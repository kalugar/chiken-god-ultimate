import type { Entity } from './entity'

import { BitSet } from '../utils/ecs.bitset'

export class Query {
  public entities: Entity[] = []
  private entityIndices = new Map<number, number>()

  public readonly includeMask = new BitSet()
  public readonly excludeMask = new BitSet()

  public readonly key: string

  constructor(includeIds: number[], excludeIds: number[] = []) {
    // 1. Заполняем BitSet'ы
    for (const id of includeIds) {
      this.includeMask.add(id)
    }
    for (const id of excludeIds) {
      this.excludeMask.add(id)
    }

    // 2. Генерируем уникальный ключ на основе сырых слов BitSet.
    // Пример ключа: "5,0,0,0_0,2,0,0" (гарантирует уникальность корзины)
    this.key = `${this.includeMask.words.join(',')}_${this.excludeMask.words.join(',')}`
  }

  // === НОВЫЙ МЕТОД: Быстрая проверка сущности ===
  public matches(entity: Entity): boolean {
    if (entity.isDestroyed) return false

    // Сущность должна иметь ВСЕ требуемые компоненты
    if (!entity.mask.containsAll(this.includeMask)) return false

    // Сущность НЕ должна иметь НИ ОДНОГО исключаемого компонента
    if (this.excludeMask.intersects(entity.mask)) return false

    return true
  }

  public has(entity: Entity): boolean {
    return this.entityIndices.has(entity.id)
  }

  public add(entity: Entity): void {
    if (this.has(entity)) return

    const index = this.entities.length
    this.entities.push(entity)
    this.entityIndices.set(entity.id, index)
  }

  public remove(entity: Entity): void {
    const indexToRemove = this.entityIndices.get(entity.id)
    if (indexToRemove === undefined) return

    const lastIndex = this.entities.length - 1
    const lastEntity = this.entities[lastIndex]

    if (indexToRemove !== lastIndex) {
      this.entities[indexToRemove] = lastEntity
      this.entityIndices.set(lastEntity.id, indexToRemove)
    }

    this.entities.pop()
    this.entityIndices.delete(entity.id)
  }
}
