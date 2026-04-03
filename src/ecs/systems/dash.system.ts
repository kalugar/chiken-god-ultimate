import type { DashData, PlayerData, TransformData, VelocityData } from '@ecs/components'
import type { Entity } from '@ecs/entity'

import { System } from './system'

export class DashSystem extends System {
  constructor() {
    // Нам теперь нужен Transform, чтобы знать, откуда и куда лететь
    super(['Player', 'Dash', 'Velocity', 'Transform'])
  }

  protected update(delta: number, entity: Entity): void {
    const player = entity.get('Player')!
    const dash = entity.get('Dash')!
    const velocity = entity.get('Velocity')!
    const transform = entity.get('Transform')!

    this.processCooldown(delta, dash)
    this.processTrigger(player, dash, transform)
    this.processMovement(delta, dash, velocity, transform)
  }

  private processCooldown(delta: number, dash: DashData): void {
    if (dash.currentCharges >= dash.maxCharges) return
    dash.cooldownTimer -= delta
    if (dash.cooldownTimer <= 0) {
      dash.currentCharges++
      dash.cooldownTimer = dash.currentCharges < dash.maxCharges ? dash.cooldown : 0
    }
  }

  private processTrigger(player: PlayerData, dash: DashData, transform: TransformData): void {
    if (!player.intentDash) {
      dash.isKeyLocked = false
      return
    }

    if (dash.isKeyLocked || dash.currentCharges <= 0 || dash.dashTimer > 0) return

    // Инициализация рывка
    dash.isKeyLocked = true
    dash.currentCharges--
    dash.dashTimer = dash.duration
    if (dash.cooldownTimer <= 0) dash.cooldownTimer = dash.cooldown

    // Считаем направление
    let dx = player.moveX
    let dy = player.moveY
    if (dx === 0 && dy === 0) {
      dx = player.aimX
      dy = player.aimY
    }

    const length = Math.hypot(dx, dy)
    if (length > 0) {
      const dirX = dx / length
      const dirY = dy / length

      // === КЭШИРУЕМ ТОЧКИ ===
      dash.startX = transform.x
      dash.startY = transform.y
      dash.targetX = transform.x + dirX * dash.distance
      dash.targetY = transform.y + dirY * dash.distance
    }
  }

  private processMovement(
    delta: number,
    dash: DashData,
    velocity: VelocityData,
    transform: TransformData
  ): void {
    if (dash.dashTimer <= 0) return

    dash.dashTimer -= delta

    // Защита от ухода в минус (чтобы не пролететь дальше targetX)
    const timeRemaining = Math.max(0, dash.dashTimer)

    // Прогресс рывка от 0.0 до 1.0
    const progress = 1 - timeRemaining / dash.duration

    // === LERP (Линейная интерполяция) ===
    // Плавно двигаем координаты от старта к цели
    transform.x = dash.startX + (dash.targetX - dash.startX) * progress
    transform.y = dash.startY + (dash.targetY - dash.startY) * progress

    // Принудительно гасим инерцию (Velocity), чтобы после окончания рывка
    // игрок не "скользил" по льду из-за старой скорости
    velocity.vx = 0
    velocity.vy = 0
  }
}
