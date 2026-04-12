import type { Entity } from '@core/ecs/entity'

import PoolService from '@core/services/service.object.pool'
import { ComponentId } from '@ecs/components'

import { System } from '../../core/ecs/system/system'

export class GarbageCollectorSystem extends System {
  // Ищем ВСЕ убитые сущности, независимо от того, есть у них View или нет
  public readonly includeComponents = [ComponentId.Destroy]

  protected update(delta: number, entity: Entity): void {
    // 1. Проверяем, есть ли графика (View), требующая очистки
    const view = entity.get('View')

    if (view && view.node) {
      if (view.poolId) {
        // Возвращаем на склад
        this.services.get(PoolService).release(view.poolId, view.node)
      } else {
        // Сжигаем уникальную графику
        view.node.removeFromParent()
        view.node.destroy()
      }
    }

    // 2. Окончательное удаление сущности из ECS (возврат ID в пул)
    this.registry.destroyEntity(entity.id)
  }
}
