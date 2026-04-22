import type { ComponentName, ComponentRegistry } from '@core/types'

import type { ComponentController } from '../component/controller'

import { BitSet } from '../../utils/bitset'
export class Entity {
  private components: unknown[] = []
  public id: number
  public mask = new BitSet()
  public isDestroyed: boolean = false
  public tag?: string

  // Внедряем менеджер через конструктор!
  constructor(
    id: number,
    private compManager: ComponentController
  ) {
    this.id = id
  }

  public get<K extends ComponentName>(name: K): ComponentRegistry[K] | undefined {
    const id = this.compManager.getId(name) // Динамическое получение ID
    return this.components[id] as ComponentRegistry[K]
  }

  public require<K extends ComponentName>(name: K): ComponentRegistry[K] {
    const component = this.get(name)
    if (!component) {
      throw new Error(
        `[ECS] Критическая ошибка: У сущности (ID: ${this.id}) отсутствует обязательный компонент "${name as string}"!`
      )
    }
    return component
  }

  public has(identifier: ComponentName | number): boolean {
    // Если передали строку, спрашиваем ID у менеджера
    const id = typeof identifier === 'string' ? this.compManager.getId(identifier) : identifier
    return this.mask.has(id)
  }

  public _setComponentData(id: number, data: unknown): void {
    this.components[id] = data
  }

  public _removeComponentData(id: number): void {
    this.components[id] = undefined
  }

  public _clearComponents(): void {
    this.components.length = 0
  }
}
