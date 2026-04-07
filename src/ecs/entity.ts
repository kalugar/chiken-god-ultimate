import { ComponentMask, MaskToName } from '@ecs/components/component.mask'

import type { ComponentDataInput, ComponentName, ComponentRegistry } from './components'

export class Entity {
  public id: number
  public components: Map<ComponentName, ComponentDataInput<ComponentName>> = new Map()
  public mask: number = ComponentMask.None
  public isDestroyed: boolean = false
  public tag?: string

  constructor(id: number) {
    this.id = id
  }

  public get<K extends ComponentName>(
    identifier: K | ComponentMask
  ): ComponentRegistry[K] | undefined {
    const name: ComponentName =
      typeof identifier === 'string' ? identifier : (MaskToName[identifier] as K)

    return this.components.get(name) as ComponentRegistry[K]
  }

  public require<K extends ComponentName>(identifier: K | ComponentMask): ComponentRegistry[K] {
    const component = this.get(identifier)

    if (!component) {
      const name = typeof identifier === 'string' ? identifier : MaskToName[identifier]
      throw new Error(
        `[ECS] Критическая ошибка: У сущности (ID: ${this.id}) отсутствует обязательный компонент "${name}"!`
      )
    }

    return component
  }

  public has(identifier: ComponentName | ComponentMask): boolean {
    if (typeof identifier === 'string') {
      return this.components.has(identifier)
    }
    return (this.mask & identifier) !== 0
  }
}
