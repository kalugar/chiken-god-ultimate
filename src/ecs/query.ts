import type { Entity } from './entity'

export class Query {
  public entities: Entity[] = []

  // Кэш индексов для удаления за O(1)
  private entityIndices = new Map<number, number>()

  // Уникальный ключ корзины (например, "3_8" -> Требует 1 и 2, исключает 8)
  public readonly key: string

  constructor(
    public readonly includeMask: number,
    public readonly excludeMask: number = 0
  ) {
    this.key = `${includeMask}_${excludeMask}`
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

    // === ПАТТЕРН SWAP AND POP ===
    // Ставим последний элемент на место удаляемого
    if (indexToRemove !== lastIndex) {
      this.entities[indexToRemove] = lastEntity
      this.entityIndices.set(lastEntity.id, indexToRemove)
    }

    // Удаляем последний элемент (с конца массива удаление происходит мгновенно)
    this.entities.pop()
    this.entityIndices.delete(entity.id)
  }
}
