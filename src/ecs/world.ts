import { ComponentMask } from '@ecs/components/component.mask'
import { Entity } from '@ecs/entity'
import { System } from '@ecs/system'

import type { ComponentName, defaultComponentRegistry } from './components'
import type { ServiceLocator } from '@services/locator'
// import { EventEmitter } from './utils/event-emitter'

export class World {
  public readonly activeEntities: Set<Entity>
  public readonly services: ServiceLocator
  // public events: EventEmitter
  private entities: Entity[]
  private availableIds: number[]
  private systems: System[]

  constructor(maxEntities: number = 10_000, services: ServiceLocator) {
    this.entities = Array.from({ length: maxEntities })
    this.availableIds = Array.from({ length: maxEntities })
    this.activeEntities = new Set()
    this.services = services
    this.systems = []
    // this.events = new EventEmitter()

    // Предварительная аллокация памяти (Object Pool)
    for (let i = 0; i < maxEntities; i++) {
      this.entities[i] = new Entity(i)
      this.availableIds[maxEntities - 1 - i] = i
    }
  }

  public createEntity(): Entity | null {
    if (this.availableIds.length === 0) {
      console.warn('[ECS] Entity pool is empty!')
      return null
    }

    const id = this.availableIds.pop()!
    const entity = this.entities[id]

    entity.isDestroyed = false
    entity.mask = ComponentMask.None
    entity.components.clear()

    this.activeEntities.add(entity)
    return entity
  }

  public destroyEntity(id: number): void {
    const entity = this.entities[id]
    if (!entity || entity.isDestroyed) return

    // НОВОЕ: Кричим на весь мир, что сущность умирает.
    // Передаем её со всеми данными ДО очистки.

    // this.events.emit('ON_ENTITY_DESTROYED', entity);

    entity.isDestroyed = true
    entity.components.clear()
    entity.mask = ComponentMask.None

    this.updateEntityMask(entity)
    this.activeEntities.delete(entity)
    this.availableIds.push(id)
  }

  public addComponent(
    entity: Entity,
    name: ComponentName,
    data: typeof defaultComponentRegistry
  ): void {
    if (entity.isDestroyed || entity.components.has(name)) return
    entity.components.set(name, data)
    entity.mask |= ComponentMask[name]
    this.updateEntityMask(entity)
  }

  public removeComponent(entity: Entity, name: ComponentName): void {
    if (entity.isDestroyed || !entity.components.has(name)) return

    entity.components.delete(name)
    entity.mask &= ~ComponentMask[name]
    this.updateEntityMask(entity)
  }

  public addTag(entity: Entity, tagMask: number): void {
    if (entity.isDestroyed || (entity.mask & tagMask) === tagMask) return

    entity.mask |= tagMask
    this.updateEntityMask(entity)
  }

  public removeTag(entity: Entity, tagMask: number): void {
    if (entity.isDestroyed || (entity.mask & tagMask) === 0) return

    entity.mask &= ~tagMask
    this.updateEntityMask(entity)
  }

  public addSystem(system: System): this {
    this.systems.push(system)

    for (const entity of this.activeEntities) {
      this.routeEntityToSystem(entity, system)
    }
    return this
  }

  // Прогоняет сущность через все системы
  private updateEntityMask(entity: Entity): void {
    for (let i = 0; i < this.systems.length; i++) {
      this.routeEntityToSystem(entity, this.systems[i])
    }
  }

  // Решает, положить сущность в кэш системы или убрать оттуда
  private routeEntityToSystem(entity: Entity, system: System): void {
    if (entity.isDestroyed) {
      system.entities.delete(entity)
      return
    }

    const hasRequired = (entity.mask & system.mask) === system.mask
    const hasExcluded = (entity.mask & system.excludeMask) !== 0

    if (hasRequired && !hasExcluded) {
      system.entities.add(entity)
    } else {
      system.entities.delete(entity)
    }
  }

  public update(delta: number): void {
    for (let i = 0; i < this.systems.length; i++) {
      this.systems[i].execute(delta)
    }
  }
}
