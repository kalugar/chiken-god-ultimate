import { ComponentId } from '@ecs/components'
import { Entity } from '@ecs/entity'
import { System } from '@ecs/systems/system'

export class MovementSystem extends System {
  public readonly includeComponents = [ComponentId.Transform, ComponentId.Velocity]

  protected update(delta: number, entity: Entity): void {
    const transform = entity.require('Transform')
    const velocity = entity.require('Velocity')

    transform.x += velocity.vx * delta
    transform.y += velocity.vy * delta
  }
}
