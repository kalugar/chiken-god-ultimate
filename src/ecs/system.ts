import { Entity } from './entity'

export abstract class System {
  public mask: number
  public excludeMask: number

  // БУФЕР: Здесь лежат только те сущности, которые подходят системе
  public entities: Set<Entity> = new Set()

  constructor(requiredMask: number, excludeMask: number = 0) {
    this.mask = requiredMask
    this.excludeMask = excludeMask
  }

  // Больше никаких проверок в цикле! Только чистая полезная работа.
  public execute(delta: number): void {
    for (const entity of this.entities) {
      this.update(delta, entity)
    }
  }

  protected abstract update(delta: number, entity: Entity): void
}
