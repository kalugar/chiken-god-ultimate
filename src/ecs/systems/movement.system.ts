import { ComponentMask } from '@ecs/components/component.mask'
import { Entity } from '@ecs/entity'
import { System } from '@ecs/systems/system'

export class MovementSystem extends System {
  public readonly includeMask = ComponentMask.Transform | ComponentMask.Velocity

  protected update(delta: number, entity: Entity): void {
    const transform = entity.require('Transform')
    const velocity = entity.require('Velocity')

    transform.x += velocity.vx * delta
    transform.y += velocity.vy * delta
  }
}
