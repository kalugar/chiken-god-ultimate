import type { Entity } from '@core/ecs/entity'
import type RegistryService from '@core/services/service.registry'

import { ComponentId } from '@ecs/components'

import { System } from './system'

export class RenderSystem extends System {
  public readonly includeComponents = [ComponentId.Transform, ComponentId.View]

  // private readonly FOV = 400
  // private readonly CAMERA_HEIGHT = 150
  // private readonly HORIZON_Y = window.innerHeight / 2

  constructor(registry: RegistryService) {
    super(registry, ['Transform', 'View'])
  }

  protected update(delta: number, entity: Entity) {
    const transform = entity.require('Transform')
    const view = entity.require('View')

    view.node.x = transform.x
    view.node.y = transform.y
    view.node.rotation = transform.rotation
  }
}
