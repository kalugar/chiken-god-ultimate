import { ComponentMask } from '@ecs/components/component.mask'
import { getComponentsMask } from '@ecs/components/components.map'
import { InputService } from '@services/services.input'

import type { Entity } from '../entity'

import { System } from '../system'

export class InputSystem extends System {
  // Кешируем данные ввода на текущий кадр
  private currentDirX = 0
  private currentDirY = 0
  private isFiring = false

  constructor() {
    super(getComponentsMask('player'))
  }

  // Переопределяем общий цикл, чтобы подготовить данные ОДИН раз за кадр
  public execute(delta: number): void {
    const input = this.world.services.get(InputService)

    this.currentDirX = 0
    this.currentDirY = 0

    if (input.isActionActive('up')) this.currentDirY -= 1
    if (input.isActionActive('down')) this.currentDirY += 1
    if (input.isActionActive('left')) this.currentDirX -= 1
    if (input.isActionActive('right')) this.currentDirX += 1

    // Нормализация вектора по диагонали
    if (this.currentDirX !== 0 && this.currentDirY !== 0) {
      const length = Math.hypot(this.currentDirX, this.currentDirY)
      this.currentDirX /= length
      this.currentDirY /= length
    }

    this.isFiring = input.isActionActive('fire')

    // Запускаем цикл из базового класса (он вызовет this.update для каждого игрока)
    super.execute(delta)
  }

  // Этот метод вызывается автоматически базовым классом для каждой подходящей сущности
  protected update(delta: number, entity: Entity): void {
    if (entity.isDestroyed) return

    const velocity = entity.get('Velocity')!
    const stats = entity.get('Stats')!

    const speed = stats.speed ?? 0

    // 2. Применяем скорость к вектору движения
    velocity.vx = this.currentDirX * speed
    velocity.vy = this.currentDirY * speed

    // eslint-disable-next-line sonarjs/todo-tag
    //TODO: добавить систему спринта по нажатию клавиши SHIFT и расхода стамины, stamina refill
    // eslint-disable-next-line sonarjs/todo-tag
    //TODO: добавить систему DASH и dash quantity, dash refill

    if (!entity.has(ComponentMask.Weapon)) return

    const weapon = entity.get('Weapon')!
    weapon.isFiring = this.isFiring

    if (this.currentDirX !== 0 || this.currentDirY !== 0) {
      weapon.aimX = this.currentDirX
      weapon.aimY = this.currentDirY
    }
  }
}
