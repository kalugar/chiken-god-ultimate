import { Graphics } from 'pixi.js'
import { ObjectPool } from '@utils/ecs/object.pool'
import type { Assembler } from '@app-types'
import type {
  // ComponentMask,
  TransformData,
  VelocityData,
  ViewData
  // ColliderData
} from '@ecs/components'
import { ComponentMask } from '@ecs/components/component.mask'

export const createEnemy: Assembler<'enemy'> = (ctx, args) => {
  // 1. Инициализируем пул врагов, если его еще нет в этом контексте
  if (!ctx.pools['enemy']) {
    ctx.pools['enemy'] = new ObjectPool<Graphics>(
      () => {
        // Рисуем красный круг радиусом 15px
        const g = new Graphics().circle(0, 0, 15).fill(0xff0000)
        g.visible = false
        ctx.gameLayer.addChild(g)
        return g
      },
      (g) => {
        g.visible = false
      }, // Сброс при возврате в пул
      100 // Заранее создаем 100 врагов в памяти
    )
  }

  const pool = ctx.pools['enemy'] as ObjectPool<Graphics>

  // 2. Создаем сущность
  const entity = ctx.world.createEntity()
  if (!entity) return null

  // 3. Достаем графику из пула
  const graphics = pool.get()
  graphics.visible = true
  graphics.x = args.x
  graphics.y = args.y

  // 4. Навешиваем компоненты
  ctx.world.addComponent<TransformData>(entity, 'Transform', {
    x: args.x,
    y: args.y,
    rotation: 0
  })

  // Даем врагу базовую скорость (если передана в аргументах)
  // Направление можно будет менять отдельной системой EnemyAISystem
  const speed = args.speed || 0
  ctx.world.addComponent<VelocityData>(entity, 'Velocity', { vx: 0, vy: speed })

  // ctx.world.addComponent<ColliderData>(entity, 'Collider', { radius: 15 })
  // ctx.world.addComponent<HealthData>(entity, 'Health', { current: 30, max: 30 })

  // 5. Компонент View с функцией ВОЗВРАТА В ПУЛ
  ctx.world.addComponent<ViewData<Graphics>>(entity, 'View', {
    node: graphics,
    release: () => pool.release(graphics)
  })

  // 6. Вешаем тег Врага
  ctx.world.addTag(entity, ComponentMask.Enemy)

  return entity
}
