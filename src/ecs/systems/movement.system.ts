import { System } from '@ecs/system'
import { ComponentMask } from '@ecs/components/component.mask'
import { Entity } from '@ecs/entity'
import type { TransformData, VelocityData } from '@ecs/components'
import { RenderSystem } from './render.system'

RenderSystem

export class MovementSystem extends System {
  constructor() {
    // Указываем, какие компоненты нам нужны
    super(ComponentMask.Transform | ComponentMask.Velocity)
  }

  // Этот метод будет вызван ТОЛЬКО для тех сущностей,
  // у которых есть и Transform, и Velocity
  protected update(delta: number, entity: Entity): void {
    const transform = entity.get<TransformData>('Transform')
    const velocity = entity.get<VelocityData>('Velocity')

    transform.x += velocity.vx * delta
    transform.y += velocity.vy * delta
  }
}
