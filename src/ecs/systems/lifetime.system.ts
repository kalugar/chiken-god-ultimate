import type { Entity } from '@ecs/entity'

import { System } from '@ecs/systems/system'

export class LifeTimeSystem extends System {
  constructor() {
    super(['LifeTime'])
  }

  protected update(delta: number, entity: Entity): void {
    const lifeTime = entity.get('LifeTime')!
    lifeTime.value -= delta

    if (lifeTime.value <= 0) {
      // this.destroyEntity(entity.id)
    }
  }
}
