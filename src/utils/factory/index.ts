import { Container, Texture } from 'pixi.js'
import { World } from '@ecs/world'
import { Entity } from '@ecs/entity'
import type { EntityArgs, FactoryContext, Assembler } from '@app-types'

export class EntityFactory {
  private context: FactoryContext

  // Реестр наших импортированных функций
  private assemblers: Map<keyof EntityArgs, Assembler<any>> = new Map()

  constructor(world: World, gameLayer: Container, textures: Record<string, Texture> = {}) {
    this.context = { world, gameLayer, textures, pools: {} }
  }

  // МЕТОД 1: Регистрация чертежа
  public register<K extends keyof EntityArgs>(type: K, assembler: Assembler<K>): this {
    this.assemblers.set(type, assembler)
    return this // Для чейнинга
  }

  // МЕТОД 2: Спавн объекта
  public create<K extends keyof EntityArgs>(type: K, args: EntityArgs[K]): Entity | null {
    const assembler = this.assemblers.get(type)

    if (!assembler) {
      console.error(`[Factory] Assembler for type '${type}' is not registered!`)
      return null
    }

    return assembler(this.context, args)
  }
}
