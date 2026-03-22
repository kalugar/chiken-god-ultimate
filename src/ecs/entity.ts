import { ComponentMask, type ComponentName } from '@ecs/components/component.mask'

export class Entity {
  public id: number
  public components: Map<ComponentName, any>
  public mask: number
  public isDestroyed: boolean

  constructor(id: number) {
    this.id = id
    this.components = new Map()
    this.mask = ComponentMask.None
    this.isDestroyed = false
  }

  public get<T>(name: ComponentName): T {
    return this.components.get(name) as T
  }

  public has(name: ComponentName): boolean {
    return this.components.has(name)
  }
}
