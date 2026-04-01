import type { Entity } from '@ecs/entity'

import { ComponentMask } from '@ecs/components/component.mask'
import { getComponentsMask } from '@ecs/components/components.map'
import { System } from '@ecs/system'
import { get8WayDirection } from '@utils/get.8.way.direction'
import { Assets, Sprite } from 'pixi.js'

export class RenderSystem extends System {
  constructor() {
    super(getComponentsMask('default'))
  }

  protected update(delta: number, entity: Entity) {
    const transform = entity.get('Transform')!
    const view = entity.get('View')

    if (!view) return
    if (view.node) {
      view.node.x = transform.x
      view.node.y = transform.y
      // view.node.rotation = transform.rotation
    }

    if (entity.has(ComponentMask.Player) && view.node instanceof Sprite) {
      const weapon = entity.get('Weapon')!

      // Считаем, куда смотрим сейчас
      const newDirection = get8WayDirection(weapon.aimX, weapon.aimY)

      // Сравниваем с тем, что было в прошлом кадре!
      if (view.currentFrameIndex !== newDirection) {
        // Обновляем только если сектор реально сменился!
        view.currentFrameIndex = newDirection
        view.node.texture = Assets.get(`player_idle/${newDirection}`)
      }
    }
  }
}
