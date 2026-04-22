import type {
  SceneConfig,
  PrefabConfig,
  SpawnOverrides,
  PrefabComponents,
  BaseComponents,
  ViewConfig,
  Screen
} from '@app-types'

import { Entity } from '@core/ecs/entity'
import { ObjectPool } from '@core/utils/factory.object.pool'
import { createView } from '@core/utils/factory.view.selector'
import { resolveAnchor } from '@core/utils/resolver.anchor'
import { resolveParent } from '@core/utils/resolver.parent'
import { defaultComponentRegistry, type ComponentName } from '@ecs/components'
import { Container } from 'pixi.js'

export default class FactoryUIService {
  public loadScene(context: Screen, config: SceneConfig): void {
    // context.schemas.clear()
    // context.pools.clearAll()

    // TODO: добавить scene reset код

    for (const prefabId in config) {
      context.schemas.set(prefabId, config[prefabId])
    }

    for (const [prefabId, prefabConfig] of context.schemas.entries()) {
      if (prefabConfig.poolSize) {
        this.initPool(context, prefabId, prefabConfig)
      } else {
        this.spawn(context, prefabId)
      }
    }

    console.log(`[FactoryService] Сцена загружена. Префабов: ${context.schemas.size}`)
  }

  public spawn(context: Screen, prefabId: string, overrides?: SpawnOverrides): Entity | null {
    const config = this.getOrCreateConfig(context, prefabId, overrides)
    if (!config) return null

    const entity = context.registry.createEntity()
    if (!entity) return null

    if (config.components) {
      const pComps = config.components
      const oComps = overrides?.components

      // Плоский цикл, никакой вложенной логики!
      for (const key in pComps) {
        this.processComponent(
          context,
          entity,
          prefabId,
          config,
          key as ComponentName,
          pComps,
          oComps
        )
      }
    }

    this.applyTopLevelOverrides(entity, overrides)

    return entity
  }

  private getOrCreateConfig(
    context: Screen,
    prefabId: string,
    overrides?: SpawnOverrides
  ): PrefabConfig | undefined {
    if (!context.schemas.has(prefabId) && overrides) {
      context.schemas.set(prefabId, overrides as PrefabConfig)
    }

    const config = context.schemas.get(prefabId)
    if (!config) {
      console.warn(`[SceneFactory] Префаб '${prefabId}' не найден!`)
    }

    return config
  }

  private getParent(context: Screen, parent?: string | Container) {
    return (
      resolveParent(context, parent) ??
      this.spawn(context, parent as string)?.get('View')?.node ??
      new Container({ label: parent as string, parent: context.view })
    )
  }

  private processComponent(
    context: Screen,
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
      this.attachView(context, entity, prefabId, config, finalData as ViewConfig)
    } else {
      context.registry.addComponent(entity, compName, finalData)
    }
  }

  private initPool(context: Screen, prefabId: string, config: PrefabConfig): void {
    const viewConfig = config?.components?.View
    if (!viewConfig) {
      console.warn(`[initPool] Пропуск пула для "${prefabId}": нет конфига или компонента View.`)
      return
    }

    //предохранитель на случай, если разработчик забыл указать в конфиге имя пула (parent)
    const rawParent = viewConfig.parent ?? prefabId + 'Pool'
    const targetParent = this.getParent(context, rawParent)

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

    context.pools.register(targetParent.label, pool)
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

  private attachView(
    context: Screen,
    entity: Entity,
    prefabId: string,
    config: PrefabConfig,
    viewConfig: ViewConfig
  ): void {
    const poolId = config.components.View?.parent ?? prefabId
    const hasPool = context.pools.has(poolId)

    let viewNode: Container | null

    if (hasPool) {
      viewNode = context.pools.get(poolId)!
      viewNode.renderable = true
    } else {
      const targetParent = this.getParent(context, viewConfig.parent)
      viewNode = createView({ ...viewConfig, label: prefabId, parent: targetParent })

      resolveAnchor(viewNode, viewConfig)
      context.refs.set(prefabId, viewNode)
      context.registry.setTag(prefabId, entity)
    }

    context.registry.addComponent(entity, 'View', {
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
