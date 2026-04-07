import type { Entity } from '@ecs/entity'

import { ComponentId } from '@ecs/components/component.id'
import { System } from '@ecs/systems/system'

export class LifeTimeSystem extends System {
  public readonly includeComponents = [ComponentId.LifeTime]

  protected update(delta: number, entity: Entity): void {
    const lifeTime = entity.require('LifeTime')

    lifeTime.value -= delta
    if (lifeTime.value <= 0) {
      this.registry.addComponent(entity, 'Destroy')
    }
  }
}
