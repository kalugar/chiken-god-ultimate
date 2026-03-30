import { getComponentsMask } from '@ecs/components/components.map'
import { Entity } from '@ecs/entity'
import { System } from '@ecs/system'

export class MovementSystem extends System {
  constructor() {
    super(getComponentsMask('dynamic'))
  }

  protected update(delta: number, entity: Entity): void {
    if (entity.isDestroyed) return
    const transform = entity.get('Transform')!
    const velocity = entity.get('Velocity')!

    transform.x += velocity.vx * delta
    transform.y += velocity.vy * delta
  }
}
