import type { SceneConfig, PrefabConfig, SpawnOverrides } from '@app-types'

import { ComponentMask } from '@ecs/components/component.mask'
import { Entity } from '@ecs/entity'
import { World } from '@ecs/world'
import LayersService from '@services/sevice.layers'
import { ObjectPool } from '@utils/object.pool'
import { createView, type RawViewConfig } from '@utils/view.selector'
import { Container } from 'pixi.js'

import { attachComponents } from '../utils/components.builder'
import { overrideComponentData } from '../utils/components.override'
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
        this.resolveAnchor(view, config.view)
        return view
      },
      (view) => {
        view.visible = false
      },
      config.poolSize
    )

    PoolService.register(config.view.parent ?? prefabId, pool)
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

    const layers = this.world.services.get(LayersService)

    if (!layers)
      throw new Error('[FactoryService] resolveParent dropped. Layers service is not registred')

    if (layers.has(layerLabel)) {
      return layers.getLayerByLabel(layerLabel)
    }

    return layers.getLayerByLabel('world')
  }

  private resolveAnchor(view: Container, config?: RawViewConfig): void {
    if ('anchor' in view) {
      ;(view as { anchor: unknown }).anchor = config?.anchor ?? 0.5
    }
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
    const hasPool = PoolService.has(poolId)

    let view: Container | null = null

    if (viewData && viewComponent) {
      if (hasPool) {
        view = PoolService.get(poolId)!
        view.visible = true
      } else {
        const targetParent = this.resolveParent(config.layer, viewData.parent)
        view = createView({ ...viewData, label: prefabId, parent: targetParent })
        if (view) {
          this.resolveAnchor(view, viewData)
          this.structuralViews.set(prefabId, view)
          this.world.setTag(prefabId, entity)
        }
      }
    }
    overrideComponentData(entity, componentRawData, overrides, view, hasPool ? poolId : undefined)

    return entity
  }
}
