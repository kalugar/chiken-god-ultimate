import type { Entity } from '@ecs/entity'

import { ComponentId } from '@ecs/components/component.id'
import { moveTowards } from '@utils/move.towards'

import { System } from './system'

export class PlayerLocomotionSystem extends System {
  public readonly includeComponents = [
    ComponentId.Player,
    ComponentId.MovementSpeed,
    ComponentId.Velocity
  ]

  protected update(delta: number, entity: Entity): void {
    const player = entity.require('Player')
    const speed = entity.require('MovementSpeed')
    const velocity = entity.require('Velocity')
    const dash = entity.require('Dash')

    if (dash && dash.dashTimer > 0) return

    const sprintMultiplier = player.intentSprint ? player.sprintMultiplier : 1
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
