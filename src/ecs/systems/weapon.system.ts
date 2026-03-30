import { ComponentMask } from '@ecs/components/component.mask'
import { FactoryService } from '@services/service.factory'

import type { Entity } from '../entity'

import { System } from '../system'

export class WeaponSystem extends System {
  private bulletSpeed = 0.75
  constructor() {
    // Нас интересуют все, у кого есть координаты и пушка
    super(ComponentMask.Transform | ComponentMask.Weapon)
  }

  protected update(delta: number, entity: Entity): void {
    if (entity.isDestroyed) return

    const weapon = entity.get('Weapon')!

    // 1. Уменьшаем таймер кулдауна каждый кадр
    if (weapon.cooldownTimer > 0) {
      weapon.cooldownTimer -= delta
    }

    // 2. Если кнопка зажата и пушка остыла — СТРЕЛЯЕМ!
    if (weapon.isFiring && weapon.cooldownTimer <= 0) {
      const transform = entity.get('Transform')!

      // Достаем Фабрику из нашего любимого ServiceLocator
      const factory = this.world.services.get(FactoryService)

      // Спавним пулю (передаем координаты стрелка и направление)
      console.log('spawn bullet')
      const bullet = factory.spawn('bullet', {
        x: transform.x,
        y: transform.y,
        vx: weapon.aimX * this.bulletSpeed,
        vy: weapon.aimY * this.bulletSpeed
      })

      console.log(bullet)

      // Сбрасываем таймер выстрела
      weapon.cooldownTimer = weapon.fireRate
    }
  }
}
