import type { Entity } from '@ecs/entity'

import { ComponentId } from '@ecs/components/component.id'
import { System } from '@ecs/systems/system'
import { getNWayDirection } from '@utils/get.n.way.direction'
import { Assets, Sprite } from 'pixi.js'

export class RenderSystem extends System {
  public readonly includeComponents = [ComponentId.Transform, ComponentId.View]

  // private readonly FOV = 400
  // private readonly CAMERA_HEIGHT = 150
  // private readonly HORIZON_Y = window.innerHeight / 2

  protected update(delta: number, entity: Entity) {
    const transform = entity.require('Transform')
    const view = entity.require('View')

    if (view.node) {
      view.node.x = transform.x
      view.node.y = transform.y
      view.node.rotation = transform.rotation
    }

    if (entity.has(ComponentId.Player) && view.node instanceof Sprite) {
      const player = entity.require('Player')

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
