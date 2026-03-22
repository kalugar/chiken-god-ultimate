import { Graphics } from 'pixi.js'
import type { Assembler } from '@app-types'
import { ObjectPool } from '@utils/ecs/object.pool'
import type {
  // ComponentMask,
  TransformData,
  VelocityData,
  ViewData
  // ColliderData
} from '@ecs/components'

// Экспортируем функцию-сборщик
export const createBullet: Assembler<'bullet'> = (ctx, args) => {
  // 1. Инициализируем (или получаем) пул прямо здесь, "лениво" (Lazy init)
  if (!ctx.pools['bullet']) {
    ctx.pools['bullet'] = new ObjectPool<Graphics>(
      () => {
        const g = new Graphics().circle(0, 0, 4).fill(0xffff00)
        g.visible = false
        ctx.gameLayer.addChild(g)
        return g
      },
      (g) => {
        g.visible = false
      },
      500 // преаллокация
    )
  }

  const pool = ctx.pools['bullet'] as ObjectPool<Graphics>

  // 2. Спавним сущность
  const entity = ctx.world.createEntity()
  if (!entity) return null

  const graphics = pool.get()
  graphics.visible = true
  graphics.x = args.x
  graphics.y = args.y

  // 3. Вешаем компоненты
  ctx.world.addComponent<TransformData>(entity, 'Transform', { x: args.x, y: args.y, rotation: 0 })
  ctx.world.addComponent<VelocityData>(entity, 'Velocity', {
    vx: args.dirX * args.speed,
    vy: args.dirY * args.speed
  })
  // ctx.world.addComponent<ColliderData>(entity, 'Collider', { radius: 4 })

  ctx.world.addComponent<ViewData<Graphics>>(entity, 'View', {
    node: graphics,
    release: () => pool.release(graphics)
  })

  return entity
}
