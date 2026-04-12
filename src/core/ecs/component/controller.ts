import type { ComponentData, ComponentName } from '@core/types/ecs.types'

import { BitSet } from '../utils/bitset'

export class ComponentController {
  private idCounter = 0

  public readonly maxComponents: number
  public readonly wordCount: number // Сколько 32-битных чисел нужно

  private readonly nameToId = new Map<string, number>()
  private readonly idToName = new Map<number, string>()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly factories = new Map<string, () => any>()

  constructor(maxComponents: number = 256) {
    // Настраиваем BitSet до того, как создастся первая сущность!
    this.maxComponents = maxComponents
    this.wordCount = Math.ceil(maxComponents / 32)
    BitSet.wordCount = this.wordCount
    // Делим на 32 с округлением вверх. Для 256 будет 8 слов.
  }

  public register<K extends ComponentName>(name: K, factory: () => ComponentData<K>): void {
    if (this.nameToId.has(name as string)) return

    if (this.idCounter >= this.maxComponents) {
      throw new Error(`[ECS] Превышен лимит компонентов (${this.maxComponents} макс).`)
    }

    const id = this.idCounter++
    this.nameToId.set(name as string, id)
    this.idToName.set(id, name as string)
    this.factories.set(name as string, factory)
  }

  public getId(name: ComponentName): number {
    const id = this.nameToId.get(name as string)
    if (id === undefined) throw new Error(`[ECS] Компонент "${name}" не зарегистрирован!`)
    return id
  }

  public getFactory<K extends ComponentName>(name: K): () => ComponentData<K> {
    return this.factories.get(name as string) as () => ComponentData<K>
  }
}
