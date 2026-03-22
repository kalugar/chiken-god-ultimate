import { Sprite } from 'pixi.js'
import type { Assembler } from '@app-types'
import type {
  // ComponentMask,
  TransformData,
  VelocityData,
  ViewData
  // ColliderData
} from '@ecs/components'
import { ComponentMask } from '@ecs/components/component.mask'

export const createPlayer: Assembler<'player'> = (ctx, args) => {
  const entity = ctx.world.createEntity()
  if (!entity) return null

  // 1. Создаем графику (берем текстуру из загруженных ресурсов)
  const texture = ctx.textures['player']
  const sprite = new Sprite(texture)
  sprite.anchor.set(0.5)
  ctx.gameLayer.addChild(sprite)

  // 2. Навешиваем компоненты с данными
  ctx.world.addComponent<TransformData>(entity, 'Transform', {
    x: args.x,
    y: args.y,
    rotation: 0
  })
  ctx.world.addComponent<VelocityData>(entity, 'Velocity', { vx: 0, vy: 0 })
  // ctx.world.addComponent<ColliderData>(entity, 'Collider', { radius: 15 })
  // ctx.world.addComponent<HealthData>(entity, 'Health', { current: 100, max: 100 })

  // 3. Компонент View с функцией ручной очистки (так как нет пула)
  ctx.world.addComponent<ViewData<Sprite>>(entity, 'View', {
    node: sprite,
    release: () => {
      sprite.removeFromParent()
      sprite.destroy()
    }
  })

  // 4. Вешаем тег Игрока (для систем ввода и коллизий)
  ctx.world.addTag(entity, ComponentMask.Player)

  return entity
}
