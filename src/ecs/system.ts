import { Entity } from './entity'

export abstract class System {
  public mask: number
  public entities: Set<Entity> = new Set()

  constructor(requiredMask: number) {
    this.mask = requiredMask
  }

  public execute(delta: number): void {
    for (const entity of this.entities) {
      this.update(delta, entity)
    }
  }

  protected abstract update(delta: number, entity: Entity): void
}
