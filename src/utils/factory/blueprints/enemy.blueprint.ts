import type { Assembler } from '@app-types'
import type {
  // ComponentMask,
  TransformData,
  VelocityData,
  ViewData
  // ColliderData
} from '@ecs/components'

import { ComponentMask } from '@ecs/components/component.mask'
import { ObjectPool } from '@utils/ecs/object.pool'
import { Graphics } from 'pixi.js'

export const createEnemy: Assembler<'enemy'> = (context, args) => {
  // 1. Инициализируем пул врагов, если его еще нет в этом контексте
  if (!context.pools['enemy']) {
    context.pools['enemy'] = new ObjectPool(
      () => {
        // Рисуем красный круг радиусом 15px
        const g = new Graphics().circle(0, 0, 15).fill(0xff_00_00)
        g.visible = false
        context.gameLayer.addChild(g)
        return g
      },
      (g) => {
        g.visible = false
      }, // Сброс при возврате в пул
      100 // Заранее создаем 100 врагов в памяти
    )
  }

  const pool = context.pools['enemy'] as ObjectPool

  // 2. Создаем сущность
  const entity = context.world.createEntity()
  if (!entity) return null

  // 3. Достаем графику из пула
  const graphics = pool.get()
  graphics.visible = true
  graphics.x = args.x
  graphics.y = args.y

  // 4. Навешиваем компоненты
  context.world.addComponent<TransformData>(entity, 'Transform', {
    x: args.x,
    y: args.y,
    rotation: 0
  })

  // Даем врагу базовую скорость (если передана в аргументах)
  // Направление можно будет менять отдельной системой EnemyAISystem
  const speed = args.speed || 0
  context.world.addComponent<VelocityData>(entity, 'Velocity', { vx: 0, vy: speed })

  // context.world.addComponent<ColliderData>(entity, 'Collider', { radius: 15 })
  // context.world.addComponent<HealthData>(entity, 'Health', { current: 30, max: 30 })

  // 5. Компонент View с функцией ВОЗВРАТА В ПУЛ
  context.world.addComponent<ViewData>(entity, 'View', {
    node: graphics,
    release: () => pool.release(graphics)
  })

  // 6. Вешаем тег Врага
  context.world.addTag(entity, ComponentMask.Enemy)

  return entity
}
