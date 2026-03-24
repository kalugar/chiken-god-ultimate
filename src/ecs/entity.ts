import { ComponentMask, MaskToName } from '@ecs/components/component.mask'

import type { ComponentName, ComponentRegistry } from './components'

export class Entity {
  public id: number
  public components: Map<ComponentName, ComponentRegistry[ComponentName]> = new Map()
  public mask: number = ComponentMask.None
  public isDestroyed: boolean = false

  constructor(id: number) {
    this.id = id
    this.components = new Map()
    this.mask = ComponentMask.None
    this.isDestroyed = false
  }

  public add<K extends ComponentName>(name: K, data: ComponentRegistry[K]): void {
    this.components.set(name, data);
    this.mask |= ComponentMask[name];
  }

  public remove(name: ComponentName): void {
    this.components.delete(name);
    this.mask &= ~ComponentMask[name];
  }

  public get<K extends ComponentName>(identifier: K | ComponentMask): ComponentRegistry[K] | undefined {
    const name: ComponentName | undefined  = typeof identifier === 'string' ? identifier : MaskToName[identifier] as K;

    return this.components.get(name) as ComponentRegistry[K];
  }

  public has(identifier: ComponentName | ComponentMask): boolean {
    if (typeof identifier === 'string') {
      return this.components.has(identifier);
    }
    return (this.mask & identifier) !== 0;
  }
}
