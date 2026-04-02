import type { SceneConfig, PrefabConfig, SpawnOverrides } from '@app-types'

import {
  defaultComponentRegistry,
  type ComponentName,
  type ComponentRegistry
} from '@ecs/components'
import { Entity } from '@ecs/entity'
import { World } from '@ecs/world'
import LayersService from '@services/sevice.layers'
import { ObjectPool } from '@utils/object.pool'
import { resolveAnchor } from '@utils/resolve.anchor'
import { createView, type ViewConfig } from '@utils/view.selector'
import { Container } from 'pixi.js'

import PoolService from './service.object.pool'

export default class FactoryService {
  private prefabs: Map<string, PrefabConfig> = new Map()
  public structuralViews: Map<string, Container> = new Map()

  constructor(private world: World) {}

  public loadScene(config: SceneConfig): void {
    this.prefabs.clear()
    this.structuralViews.clear()

    PoolService.clearAll()

    for (const [prefabId, prefabConfig] of Object.entries(config)) {
      this.prefabs.set(prefabId, prefabConfig)
    }

    for (const [prefabId, prefabConfig] of this.prefabs.entries()) {
      if (prefabConfig.poolSize) {
        this.initPool(prefabId, prefabConfig)
      } else {
        this.spawn(prefabId)
      }
    }

    console.log(`[SceneFactory] Сцена загружена. Префабов: ${this.prefabs.size}`)
  }

  public spawn(prefabId: string, overrides?: SpawnOverrides): Entity | null {
    const config = this.prefabs.get(prefabId)

    if (!config) {
      console.warn(`[SceneFactory] Префаб '${prefabId}' не найден!`)
      return null
    }

    const entity = this.world.createEntity()
    if (!entity) return null

    if (config.components) {
      for (const [key, prefabData] of Object.entries(config.components)) {
        const compName = key as ComponentName

        if (compName === 'View') {
          this.attachView(entity, prefabId, config, prefabData as ViewConfig)
          continue
        }

        const typedPrefabData = prefabData as ComponentRegistry[typeof compName]
        const defaultData = defaultComponentRegistry[compName]?.() || {}
        const overrideData = overrides?.components?.[compName] || {}

        const finalData = {
          ...defaultData,
          ...typedPrefabData,
          ...overrideData
        }
        this.world.addComponent(entity, compName, finalData)
      }
    }
    this.applyTopLevelOverrides(entity, overrides)

    return entity
  }

  private initPool(prefabId: string, config: PrefabConfig): void {
    const viewConfig = config?.components?.View
    if (!viewConfig) {
      console.warn(`[initPool] Пропуск пула для "${prefabId}": нет конфига или компонента View.`)
      return
    }

    const targetParent = this.resolveParent(config.layer, viewConfig.parent)
    const itemOptions = {
      label: prefabId,
      ...viewConfig,
      parent: targetParent
    }
    const pool = new ObjectPool<Container>(
      () => this.createPoolItem(itemOptions),
      (view) => (view.visible = false),
      config.poolSize
    )

    PoolService.register(viewConfig.parent ?? prefabId, pool)
  }

  private createPoolItem(viewConfig: ViewConfig): Container {
    const view = createView(viewConfig)

    if (!view) {
      throw new Error(
        `[initPool] Не удалось создать View для "${viewConfig.label}". Проверьте настройки.`
      )
    }
    view.visible = false
    resolveAnchor(view, viewConfig)
    return view
  }

  private resolveParent(layerLabel?: string, parentPrefab?: string | Container): Container {
    if (parentPrefab) {
      if (typeof parentPrefab !== 'string') {
        return parentPrefab
      }
      if (!this.structuralViews.has(parentPrefab)) {
        this.spawn(parentPrefab)
      }
      return this.structuralViews.get(parentPrefab)!
    }

    const layers = this.world.services.get(LayersService)

    if (!layers) {
      throw new Error('[FactoryService] resolveParent failed: LayersService is not registered.')
    }

    return layers.has(layerLabel)
      ? layers.getLayerByLabel(layerLabel)
      : layers.getLayerByLabel('world')
  }

  private attachView(
    entity: Entity,
    prefabId: string,
    config: PrefabConfig,
    viewConfig: ViewConfig
  ): void {
    const poolId = config.components.View?.parent ?? prefabId
    const hasPool = PoolService.has(poolId)

    let viewNode: Container | null

    if (hasPool) {
      viewNode = PoolService.get(poolId)!
      viewNode.visible = true
    } else {
      const targetParent = this.resolveParent(config.layer, viewConfig.parent)
      viewNode = createView({ ...viewConfig, label: prefabId, parent: targetParent })

      if (viewNode) {
        resolveAnchor(viewNode, viewConfig)
        this.structuralViews.set(prefabId, viewNode)
        this.world.setTag(prefabId, entity)
      }
    }
    if (viewNode) {
      this.world.addComponent(entity, 'View', {
        node: viewNode,
        poolId: hasPool ? poolId : undefined
      })
    }
  }

  private applyTopLevelOverrides(entity: Entity, overrides?: SpawnOverrides): void {
    if (!overrides) return

    const transform = entity.get('Transform')
    if (transform) {
      transform.x = overrides.x ?? transform.x
      transform.y = overrides.y ?? transform.y
      transform.rotation = overrides.rotation ?? transform.rotation
    }

    const velocity = entity.get('Velocity')
    if (velocity) {
      velocity.vx = overrides.vx ?? velocity.vx
      velocity.vy = overrides.vy ?? velocity.vy
    }
  }
}
