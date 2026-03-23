import type { Assembler } from '@app-types'
import type {
  // ComponentMask,
  TransformData,
  VelocityData,
  ViewData
  // ColliderData
} from '@ecs/components'

import { ComponentMask } from '@ecs/components/component.mask'
import { Sprite } from 'pixi.js'

export const createPlayer: Assembler<'player'> = (context, args) => {
  const entity = context.world.createEntity()
  if (!entity) return null

  // 1. Создаем графику (берем текстуру из загруженных ресурсов)
  const texture = context.textures['player']
  const sprite = new Sprite(texture)
  sprite.anchor.set(0.5)
  context.gameLayer.addChild(sprite)

  // 2. Навешиваем компоненты с данными
  context.world.addComponent<TransformData>(entity, 'Transform', {
    x: args.x,
    y: args.y,
    rotation: 0
  })
  context.world.addComponent<VelocityData>(entity, 'Velocity', { vx: 0, vy: 0 })
  // context.world.addComponent<ColliderData>(entity, 'Collider', { radius: 15 })
  // context.world.addComponent<HealthData>(entity, 'Health', { current: 100, max: 100 })

  // 3. Компонент View с функцией ручной очистки (так как нет пула)
  context.world.addComponent<ViewData>(entity, 'View', {
    node: sprite,
    release: () => {
      sprite.removeFromParent()
      sprite.destroy()
    }
  })

  // 4. Вешаем тег Игрока (для систем ввода и коллизий)
  context.world.addTag(entity, ComponentMask.Player)

  return entity
}
