import { ComponentId } from '@ecs/components/component.id'

import type { ComponentName, ComponentRegistry } from './components'

import { BitSet } from './components/bitset'
export class Entity {
  private components: unknown[] = []
  public id: number
  public mask = new BitSet()
  public isDestroyed: boolean = false
  public tag?: string

  constructor(id: number) {
    this.id = id
  }

  // Получение компонента по его строковому имени (с сохранением TS-типизации)
  public get<K extends ComponentName>(name: K): ComponentRegistry[K] | undefined {
    const id = ComponentId[name] as number
    return this.components[id] as ComponentRegistry[K]
  }

  public require<K extends ComponentName>(name: K): ComponentRegistry[K] {
    const component = this.get(name)

    if (!component) {
      throw new Error(
        `[ECS] Критическая ошибка: У сущности (ID: ${this.id}) отсутствует обязательный компонент "${name}"!`
      )
    }

    return component
  }

  public has(identifier: ComponentName | number): boolean {
    const id = typeof identifier === 'string' ? ComponentId[identifier] : identifier
    return this.mask.has(id)
  }

  // === Внутренние методы для RegistryService ===

  // Вызывается из RegistryService.addComponent
  public _setComponentData(id: number, data: unknown): void {
    this.components[id] = data
  }

  // Вызывается из RegistryService.removeComponent
  public _removeComponentData(id: number): void {
    this.components[id] = undefined
  }

  // Вызывается при возврате сущности в пул
  public _clearComponents(): void {
    // Быстрая очистка массива без создания нового
    this.components.length = 0
  }
}
