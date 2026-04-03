import { Entity } from '@ecs/entity'
import { System } from '@ecs/systems/system'

export class MovementSystem extends System {
  constructor() {
    super(['Transform', 'Velocity'])
  }

  protected update(delta: number, entity: Entity): void {
    const transform = entity.get('Transform')!
    const velocity = entity.get('Velocity')!

    transform.x += velocity.vx * delta
    transform.y += velocity.vy * delta
  }
}
