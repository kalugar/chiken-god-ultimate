import type { Entity } from '@ecs/entity'

import { moveTowards } from '@utils/move.towards'

import { System } from './system'

export class PlayerLocomotionSystem extends System {
  constructor() {
    super(['Player', 'MovementSpeed', 'Velocity'])
  }

  protected update(delta: number, entity: Entity): void {
    const player = entity.get('Player')!
    const speed = entity.get('MovementSpeed')!
    const velocity = entity.get('Velocity')!
    const dash = entity.get('Dash')!

    if (dash && dash.dashTimer > 0) return

    const sprintMultiplier = player.intentSprint ? 1.5 : 1
    const finalSpeed = speed.current * sprintMultiplier
    const finalAcceleration = (speed.acceleration ?? 0) * sprintMultiplier
    const finalDeceleration = (speed.deceleration ?? 0) / sprintMultiplier

    const targetVx = player.moveX * finalSpeed
    const targetVy = player.moveY * finalSpeed

    const accelX = targetVx === 0 ? finalDeceleration : finalAcceleration
    const accelY = targetVy === 0 ? finalDeceleration : finalAcceleration

    velocity.vx = moveTowards(velocity.vx, targetVx, accelX * delta)
    velocity.vy = moveTowards(velocity.vy, targetVy, accelY * delta)
  }
}
