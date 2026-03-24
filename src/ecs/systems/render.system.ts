import type { Entity } from '@ecs/entity'

import { ComponentMask } from '@ecs/components/component.mask'
import { System } from '@ecs/system'

export class RenderSystem extends System {
  constructor() {
    super(ComponentMask.Transform | ComponentMask.View)
  }

  update(delta: number, entity: Entity) {
    const transform = entity.get('Transform')!
    const view = entity.get('View')!

    view.node!.x = transform.x
    view.node!.y = transform.y
    view.node!.rotation = transform.rotation
  }
}
