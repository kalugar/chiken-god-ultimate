import type { Screen } from '@app-types'
import type { ServiceLocator } from '@core/services/locator'

import FactoryService from '@core/services/service.factory'
import ScreenService from '@core/services/service.screen.state'
import { ComponentId } from '@ecs/components'

import type { Entity } from '../../core/ecs/entity'

import { System } from '../../core/ecs/system/system'

export class WeaponSystem extends System {
  public readonly includeComponents = [ComponentId.Transform, ComponentId.Weapon]
  private factory!: FactoryService
  private sceneService!: ScreenService
  private activeScreen!: Screen

  public injectServices(services: ServiceLocator): void {
    super.injectServices(services)
    this.factory = this.services.get(FactoryService)
    this.sceneService = this.services.get(ScreenService)
    this.activeScreen = this.sceneService.getActiveScreen()
  }

  protected update(delta: number, entity: Entity): void {
    const weapon = entity.require('Weapon')
    if (weapon.cooldownTimer > 0) {
      weapon.cooldownTimer -= delta
    }

    if (weapon.isFiring && weapon.cooldownTimer <= 0) {
      const transform = entity.require('Transform')
      const velocity = entity.require('Velocity')

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
      this.factory.spawn(this.activeScreen, 'bullet', {
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
