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
      const factory = this.services.get(FactoryService)

      const vx = weapon.aimX * weapon.bulletSpeed
      const vy = weapon.aimY * weapon.bulletSpeed

      factory.spawn('bullet', {
        x: transform.x,
        y: transform.y,
        rotation: Math.atan2(weapon.aimY, weapon.aimX),
        vx,
        vy
      })
      weapon.cooldownTimer = weapon.fireRate
    }
  }
}
