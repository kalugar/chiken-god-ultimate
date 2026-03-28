import { Entity } from './entity'

export abstract class System {
  public mask: number
  public excludeMask: number
  public entities: Set<Entity> = new Set()

  constructor(requiredMask: number, excludeMask: number) {
    this.mask = requiredMask
    this.excludeMask = excludeMask
  }

  public execute(delta: number): void {
    for (const entity of this.entities) {
      this.update(delta, entity)
    }
  }

  protected abstract update(delta: number, entity: Entity): void
}
