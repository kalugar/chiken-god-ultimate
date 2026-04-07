import type { SceneConfig, PrefabConfig, SpawnOverrides } from '@app-types'

import {
  defaultComponentRegistry,
  type ComponentName,
  type ComponentRegistry
} from '@ecs/components'
import { Entity } from '@ecs/entity'
import LayersService from '@services/sevice.layers'
import { ObjectPool } from '@utils/object.pool'
import { resolveAnchor } from '@utils/resolve.anchor'
import { createView, type ViewConfig } from '@utils/view.selector'
import { Container } from 'pixi.js'

import type RegistryService from './service.registry'

import PoolService from './service.object.pool'

export default class FactoryService {
  private prefabs: Map<string, PrefabConfig> = new Map()
  public structuralViews: Map<string, Container> = new Map()

  constructor(
    private readonly registry: RegistryService,
    private readonly layers: LayersService,
    private readonly pools: PoolService
  ) {}

  public loadScene(config: SceneConfig): void {
    this.prefabs.clear()
    this.structuralViews.clear()

    this.pools.clearAll()

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
    if (!this.prefabs.has(prefabId) && overrides) {
      this.prefabs.set(prefabId, overrides as PrefabConfig)
    }
    const config = this.prefabs.get(prefabId)

    if (!config) {
      console.warn(`[SceneFactory] Префаб '${prefabId}' не найден!`)
      return null
    }

    const entity = this.registry.createEntity()
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
        this.registry.addComponent(entity, compName, finalData)
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
      (view) => (view.renderable = false),
      config.poolSize
    )

    this.pools.register(viewConfig.parent ?? prefabId, pool)
  }

  private createPoolItem(viewConfig: ViewConfig): Container {
    const view = createView(viewConfig)

    if (!view) {
      throw new Error(
        `[initPool] Не удалось создать View для "${viewConfig.label}". Проверьте настройки.`
      )
    }
    view.renderable = false
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

    const targetParent = this.layers.has(layerLabel) ? layerLabel : 'world'
    return this.layers.getLayerByLabel(targetParent)
  }

  private attachView(
    entity: Entity,
    prefabId: string,
    config: PrefabConfig,
    viewConfig: ViewConfig
  ): void {
    const poolId = config.components.View?.parent ?? prefabId
    const hasPool = this.pools.has(poolId)

    let viewNode: Container | null

    if (hasPool) {
      viewNode = this.pools.get(poolId)!
      viewNode.renderable = true
    } else {
      const targetParent = this.resolveParent(config.layer, viewConfig.parent)
      viewNode = createView({ ...viewConfig, label: prefabId, parent: targetParent })

      resolveAnchor(viewNode, viewConfig)
      this.structuralViews.set(prefabId, viewNode)
      this.registry.setTag(prefabId, entity)
    }

    this.registry.addComponent(entity, 'View', {
      node: viewNode,
      poolId: hasPool ? poolId : undefined
    })
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
