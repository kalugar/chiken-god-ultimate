import type { Entity } from '@ecs/entity'

import { System } from '@ecs/systems/system'

export class LifeTimeSystem extends System {
  constructor(private destroyEntity: (entityId: number) => void) {
    super(['LifeTime'])
  }

  protected update(delta: number, entity: Entity): void {
    const lifeTime = entity.get('LifeTime')!
    lifeTime.value -= delta

    if (lifeTime.value <= 0) {
      // Сущность умирает. World сам почистит View через свою логику,
      // вернет Entity в пул и уберет её из всех систем!
      this.destroyEntity(entity.id)
    }
  }
}
