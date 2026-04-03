import type { Entity } from '@ecs/entity'

import { ComponentMask } from '@ecs/components/component.mask'
import { System } from '@ecs/systems/system'
import { getNWayDirection } from '@utils/get.n.way.direction'
import { Assets, Sprite } from 'pixi.js'

export class RenderSystem extends System {
  constructor() {
    super(['Transform', 'View'])
  }

  protected update(delta: number, entity: Entity) {
    const transform = entity.get('Transform')!
    const view = entity.get('View')

    if (!view) return
    if (view.node) {
      view.node.x = transform.x
      view.node.y = transform.y
      view.node.rotation = transform.rotation
    }

    if (entity.has(ComponentMask.Player) && view.node instanceof Sprite) {
      const player = entity.get('Player')!

      // Считаем, куда смотрим сейчас
      const newDirection = getNWayDirection(8, player.aimX, player.aimY)

      // Сравниваем с тем, что было в прошлом кадре!
      if (view.currentFrameIndex !== newDirection) {
        // Обновляем только если сектор реально сменился!
        view.currentFrameIndex = newDirection
        view.node.texture = Assets.get(`player_idle/${newDirection}`)
      }
    }
  }
}
