import type { RectangleSize } from '@app-types'
import type { ComponentName } from '@ecs/components'
import type { ServiceLocator } from '@services/locator'

import { ComponentMask } from '@ecs/components/component.mask'

import { Entity } from '../entity'

export abstract class System {
  public services!: ServiceLocator
  public mask = 0
  public excludeMask = 0
  public entities: Set<Entity> = new Set()

  constructor(requiredComponents: ComponentName[], excludeComponents: ComponentName[] = []) {
    for (const name of requiredComponents) {
      this.mask |= ComponentMask[name]
    }
    for (const name of excludeComponents) {
      this.excludeMask |= ComponentMask[name]
    }
  }

  public execute(delta: number): void {
    for (const entity of this.entities) {
      if (!entity.isDestroyed) {
        this.update(delta, entity)
      }
    }
  }

  protected abstract update(delta: number, entity: Entity): void
  public resize(_newSize: RectangleSize): void {}
}
