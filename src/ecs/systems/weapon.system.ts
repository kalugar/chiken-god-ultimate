import FactoryService from '@services/service.factory'

import type { Entity } from '../entity'

import { System } from './system'

export class WeaponSystem extends System {
  constructor() {
    // Нас интересуют все, у кого есть координаты и пушка
    super(['Transform', 'Weapon'])
  }

  protected update(delta: number, entity: Entity): void {
    const weapon = entity.get('Weapon')!
    if (weapon.cooldownTimer > 0) {
      weapon.cooldownTimer -= delta
    }

    if (weapon.isFiring && weapon.cooldownTimer <= 0) {
      const transform = entity.get('Transform')!
      const velocity = entity.get('Velocity')!
      const factory = this.services.get(FactoryService)

      const rawVx = weapon.aimX * weapon.bulletSpeed + (velocity ? velocity.vx : 0)
      const rawVy = weapon.aimY * weapon.bulletSpeed + (velocity ? velocity.vy : 0)

      // 2. Высчитываем длину этого сырого вектора
      const length = Math.hypot(rawVx, rawVy)

      let finalVx = 0
      let finalVy = 0

      // 3. НОРМАЛИЗАЦИЯ (Магия здесь)
      // Мы приводим длину вектора к 1, а затем жестко умножаем на bulletSpeed.
      // Теперь траектория учитывает бег игрока, но скорость пули ВСЕГДА равна bulletSpeed!
      if (length > 0) {
        finalVx = (rawVx / length) * weapon.bulletSpeed
        finalVy = (rawVy / length) * weapon.bulletSpeed
      }
      factory.spawn('bullet', {
        x: transform.x,
        y: transform.y,
        rotation: Math.atan2(finalVy, finalVx),
        vx: finalVx,
        vy: finalVy
      })
      weapon.cooldownTimer = weapon.fireRate
    }
  }
}
