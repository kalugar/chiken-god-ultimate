import type { Entity } from '@core/ecs/entity'

import { System } from '@core/ecs/system/system'
import { ComponentId } from '@ecs/components'

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
