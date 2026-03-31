import type { RectangleSize } from '@app-types'
import type { Entity } from '@ecs/entity'

import { LOGICAL_SIZE } from '@core/constants'
import { ComponentMask } from '@ecs/components/component.mask'
import { System } from '@ecs/system'
import ResizeService from '@services/service.resize'

// private bounds = {
//   top: -LOGICAL_SIZE.height / 2,
//   bottom: LOGICAL_SIZE.height / 2,
//   left: -LOGICAL_SIZE.width / 2,
//   right: LOGICAL_SIZE.width / 2
// }
// constructor() {
//   // Нам нужны и координаты (чтобы их менять), и коллайдер (чтобы знать радиус/размер)
//   super(ComponentMask.Transform | ComponentMask.Collider)
// }

// // Используем твой красивый абстрактный метод update для каждой сущности
// protected update(delta: number, entity: Entity): void {
//   if (entity.isDestroyed) return

//   const transform = entity.get('Transform')!
//   const collider = entity.get('Collider')!

//   console.log('x:', Math.floor(transform.x), 'y:', Math.floor(transform.y))
//   // --- Проверка по оси X ---
//   // Левая граница экрана (0)
//   if (transform.x - collider.colliderRadius < this.bounds.left) {
//     console.log('граница ;bounds.left; -', this.bounds.left)
//     transform.x = this.bounds.left + collider.colliderRadius
//   }
//   // Правая граница экрана
//   else if (transform.x + collider.colliderRadius > this.bounds.right) {
//     console.log('граница ;bounds.right; -', this.bounds.right)
//     transform.x = this.bounds.right - collider.colliderRadius
//   }

//   // --- Проверка по оси Y ---
//   // Верхняя граница экрана (0)
//   if (transform.y - collider.colliderRadius < this.bounds.top) {
//     console.log('граница ;bounds.top; -', this.bounds.top)
//     transform.y = this.bounds.top + collider.colliderRadius
//   }
//   // Нижняя граница экрана
//   else if (transform.y + collider.colliderRadius > this.bounds.bottom) {
//     console.log('граница ;bounds.bottom; -', this.bounds.bottom)
//     transform.y = this.bounds.bottom - collider.colliderRadius
//   }
// }

export class BoundsSystem extends System {
  private viewport = {
    width: 1,
    height: 1
  }

  // private scaleFactor = 1
  constructor() {
    // Нам нужны и координаты (чтобы их менять), и коллайдер (чтобы знать радиус/размер)
    super(ComponentMask.Transform | ComponentMask.Collider)
  }

  // Используем твой красивый абстрактный метод update для каждой сущности
  protected update(delta: number, entity: Entity): void {
    if (entity.isDestroyed) return

    const transform = entity.get('Transform')!
    const collider = entity.get('Collider')!

    console.log('x:', Math.floor(transform.x), 'y:', Math.floor(transform.y))
    // --- Проверка по оси X ---
    // Левая граница экрана (0)
    if (transform.x - collider.colliderRadius < -LOGICAL_SIZE.width / 2) {
      console.log('граница ;bounds.left; -', -LOGICAL_SIZE.width / 2)
      transform.x = -LOGICAL_SIZE.width / 2 + collider.colliderRadius
    }
    // Правая граница экрана
    else if (transform.x + collider.colliderRadius > LOGICAL_SIZE.width / 2) {
      console.log('граница ;bounds.right; -', LOGICAL_SIZE.width / 2)
      transform.x = LOGICAL_SIZE.width / 2 - collider.colliderRadius
    }

    // --- Проверка по оси Y ---
    // Верхняя граница экрана (0)
    if (transform.y - collider.colliderRadius < -LOGICAL_SIZE.height / 2) {
      console.log('граница ;bounds.top; -', -LOGICAL_SIZE.height / 2)
      transform.y = -LOGICAL_SIZE.height / 2 + collider.colliderRadius
    }
    // Нижняя граница экрана
    else if (transform.y + collider.colliderRadius > LOGICAL_SIZE.width / 2) {
      console.log('граница ;bounds.bottom; -', LOGICAL_SIZE.height / 2)
      transform.y = LOGICAL_SIZE.height / 2 - collider.colliderRadius
    }
  }

  public resize(): void {
    this.viewport = this.services.get(ResizeService).getScreenSize()
  }
}
