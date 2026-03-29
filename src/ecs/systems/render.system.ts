import type { Entity } from '@ecs/entity'

import { getComponentsMask } from '@ecs/components/components.map'
import { System } from '@ecs/system'

export class RenderSystem extends System {
  constructor() {
    super(getComponentsMask('default'))
  }

  update(delta: number, entity: Entity) {
    const transform = entity.get('Transform')!
    const view = entity.get('View')

    if (view?.node) {
      view.node.x = transform.x
      view.node.y = transform.y
      // view.node.rotation = transform.rotation
    }
  }
}
