import type {
  SceneConfig,
  PrefabConfig,
  SpawnOverrides,
  PrefabComponents,
  BaseComponents,
  ViewConfig
} from '@app-types'

import { defaultComponentRegistry, type ComponentName } from '@ecs/components'
import { Entity } from '@ecs/entity'
import LayersService from '@services/sevice.layers'
import { ObjectPool } from '@utils/object.pool'
import { resolveAnchor } from '@utils/resolve.anchor'
import { createView } from '@utils/view.selector'
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
    const config = this.getOrCreateConfig(prefabId, overrides)
    if (!config) return null

    const entity = this.registry.createEntity()
    if (!entity) return null

    if (config.components) {
      const pComps = config.components
      const oComps = overrides?.components

      // Плоский цикл, никакой вложенной логики!
      for (const key in pComps) {
        this.processComponent(entity, prefabId, config, key as ComponentName, pComps, oComps)
      }
    }

    this.applyTopLevelOverrides(entity, overrides)

    return entity
  }

  private getOrCreateConfig(
    prefabId: string,
    overrides?: SpawnOverrides
  ): PrefabConfig | undefined {
    if (!this.prefabs.has(prefabId) && overrides) {
      this.prefabs.set(prefabId, overrides as PrefabConfig)
    }

    const config = this.prefabs.get(prefabId)
    if (!config) {
      console.warn(`[SceneFactory] Префаб '${prefabId}' не найден!`)
    }

    return config
  }

  private processComponent(
    entity: Entity,
    prefabId: string,
    config: PrefabConfig,
    compName: ComponentName,
    pComps: PrefabComponents,
    oComps?: PrefabComponents
  ): void {
    const defaultFactory = defaultComponentRegistry[compName]
    if (!defaultFactory) return

    const defaultData = defaultFactory()
    // const finalData = this.mergeComponentData(defaultData, pComps[compName], oComps?.[compName])
    let finalData: PrefabComponents | void = undefined
    if (defaultData) {
      const prefabCompData = typeof pComps[compName] === 'boolean' ? {} : pComps[compName] || {}
      const overrideCompData = typeof oComps === 'boolean' ? {} : oComps || {}
      finalData = {
        ...defaultData,
        ...prefabCompData,
        ...overrideCompData
      }
    }

    if (compName === 'View') {
      this.attachView(entity, prefabId, config, finalData as ViewConfig)
    } else {
      this.registry.addComponent(entity, compName, finalData as BaseComponents[typeof compName])
    }
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
