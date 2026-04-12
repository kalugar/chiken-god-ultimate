import { Entity } from '@core/ecs/entity'
import { System } from '@core/ecs/system/system'
import { ComponentId } from '@ecs/components'

export class MovementSystem extends System {
  public readonly includeComponents = [ComponentId.Transform, ComponentId.Velocity]

  protected update(delta: number, entity: Entity): void {
    const transform = entity.require('Transform')
    const velocity = entity.require('Velocity')

    transform.x += velocity.vx * delta
    transform.y += velocity.vy * delta
  }
}
