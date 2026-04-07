import type { Entity } from '@ecs/entity'

import { ComponentMask } from '@ecs/components/component.mask'
import { System } from '@ecs/systems/system'

export class LifeTimeSystem extends System {
  public readonly includeMask = ComponentMask.LifeTime

  protected update(delta: number, entity: Entity): void {
    const lifeTime = entity.require('LifeTime')

    lifeTime.value -= delta
    if (lifeTime.value <= 0) {
      this.registry.addComponent(entity, 'Destroy', {})
    }
  }
}
