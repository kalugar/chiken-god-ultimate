import type { SceneConfig, PrefabConfig, SpawnOverrides } from '@app-types'
import type LayersService from '@services/sevice.layers'

import { ComponentMask } from '@ecs/components/component.mask'
import { Entity } from '@ecs/entity'
import { World } from '@ecs/world'
import { PoolManager } from '@services/service.object.pool'
import { ObjectPool } from '@utils/ecs/object.pool'
import { createView } from '@utils/factory/view.selector'
import { Container } from 'pixi.js'

import { attachComponents } from './components.builder'
import { overrideComponentData } from './components.override'

export class SceneFactory {
  private world: World
  private layers: LayersService
  private prefabs: Map<string, PrefabConfig> = new Map()
  public structuralViews: Map<string, Container> = new Map()

  constructor(world: World, layers: LayersService) {
    this.world = world
    this.layers = layers
  }

  public loadScene(config: SceneConfig): void {
    this.prefabs.clear()
    this.structuralViews.clear()

    PoolManager.clearAll()

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

  private initPool(prefabId: string, config: PrefabConfig): void {
    if (!config.view) return

    const pool = new ObjectPool<Container>(
      () => {
        const targetParent = this.resolveParent(config.layer, config.view!.parent)
        const view = createView({ label: prefabId, ...config.view, parent: targetParent })
        if (!view)
          throw new Error(
            `[initPool] не получилось создать view для ${prefabId}, проверьте настройки конфигурации`
          )

        view.visible = false

        return view
      },
      (view) => {
        view.visible = false
      },
      config.poolSize
    )

    PoolManager.register(config.view.parent ?? prefabId, pool)
  }

  private resolveParent(layerLabel?: string, parentPrefab?: string | Container): Container {
    if (parentPrefab) {
      if (typeof parentPrefab !== 'string') {
        return parentPrefab
      } else if (!this.structuralViews.has(parentPrefab)) {
        this.spawn(parentPrefab)
        return this.structuralViews.get(parentPrefab)!
      }
    }

    if (this.layers.has(layerLabel)) {
      return this.layers.getLayerByLabel(layerLabel)
    }

    return this.layers.getLayerByLabel('world')
  }

  public spawn(prefabId: string, overrides?: SpawnOverrides): Entity | null {
    const config = this.prefabs.get(prefabId)

    if (!config) {
      console.warn(`[SceneFactory] Префаб '${prefabId}' не найден!`)
      return null
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { components, poolSize, layer, view: viewData, ...componentRawData } = config

    const entity = this.world.createEntity()
    if (!entity) return null

    let componentMask = components
    if (componentMask === undefined) {
      const defaultMask = ComponentMask.Transform | ComponentMask.View
      componentMask = viewData ? defaultMask : ComponentMask.None
    }

    attachComponents(this.world, entity, componentMask)

    const viewComponent = entity.get('View')
    const poolId = (viewData && viewData.parent) ?? prefabId
    const hasPool = PoolManager.has(poolId)

    let view: Container | null = null

    if (viewData && viewComponent) {
      if (hasPool) {
        view = PoolManager.get(poolId)!
        view.visible = true
      } else {
        const targetParent = this.resolveParent(config.layer, viewData.parent)
        view = createView({ ...viewData, label: prefabId, parent: targetParent })
        if (view) {
          this.structuralViews.set(prefabId, view)
          this.world.setTag(prefabId, entity)
        }
      }
    }
    overrideComponentData(entity, componentRawData, overrides, view, hasPool ? poolId : undefined)

    return entity
  }
}
