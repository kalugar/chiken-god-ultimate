import type { Entity } from '@ecs/entity'

import { ComponentMask } from '@ecs/components/component.mask'
import { System } from '@ecs/system'

export class LifeTimeSystem extends System {
  constructor(private destroyEntity: (entityId: number) => void) {
    super(ComponentMask.LifeTime)
  }

  protected update(delta: number, entity: Entity): void {
    if (entity.isDestroyed) return

    const lifeTime = entity.get('LifeTime')!
    lifeTime.lifeTime -= delta

    if (lifeTime.lifeTime <= 0) {
      // Сущность умирает. World сам почистит View через свою логику,
      // вернет Entity в пул и уберет её из всех систем!
      this.destroyEntity(entity.id)
    }
  }
}
