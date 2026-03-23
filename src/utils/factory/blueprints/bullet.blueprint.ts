import type { Assembler } from '@app-types'
import type {
  // ComponentMask,
  TransformData,
  VelocityData,
  ViewData
  // ColliderData
} from '@ecs/components'

import { ObjectPool } from '@utils/ecs/object.pool'
import { Graphics } from 'pixi.js'

// Экспортируем функцию-сборщик
export const createBullet: Assembler<'bullet'> = (context, args) => {
  // 1. Инициализируем (или получаем) пул прямо здесь, "лениво" (Lazy init)
  if (!context.pools['bullet']) {
    context.pools['bullet'] = new ObjectPool(
      () => {
        const g = new Graphics().circle(0, 0, 4).fill(0xff_ff_00)
        g.visible = false
        context.gameLayer.addChild(g)
        return g
      },
      (g) => {
        g.visible = false
      },
      500 // преаллокация
    )
  }

  const pool = context.pools['bullet'] as ObjectPool

  // 2. Спавним сущность
  const entity = context.world.createEntity()
  if (!entity) return null

  const graphics = pool.get()
  graphics.visible = true
  graphics.x = args.x
  graphics.y = args.y

  // 3. Вешаем компоненты
  context.world.addComponent<TransformData>(entity, 'Transform', {
    x: args.x,
    y: args.y,
    rotation: 0
  })
  context.world.addComponent<VelocityData>(entity, 'Velocity', {
    vx: args.dirX * args.speed,
    vy: args.dirY * args.speed
  })
  // context.world.addComponent<ColliderData>(entity, 'Collider', { radius: 4 })

  context.world.addComponent<ViewData>(entity, 'View', {
    node: graphics,
    release: () => pool.release(graphics)
  })

  return entity
}
