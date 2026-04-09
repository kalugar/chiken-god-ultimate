import type { RectangleSize } from '@app-types'
import type { ServiceLocator } from '@services/locator'

import type { System } from './systems/system'

export class SystemDispatcher {
  private systems: System[] = []

  constructor(public readonly services: ServiceLocator) {}

  /**
   * Добавляет систему в пайплайн и внедряет в нее зависимости.
   */
  public addSystem(system: System): void {
    system.injectServices(this.services)
    this.systems.push(system)
  }

  /**
   * Добавляет сразу массив систем (удобно для pipeline.config.ts)
   */
  public addSystems(systemClasses: (new () => System)[]): void {
    for (const systemClass of systemClasses) {
      this.addSystem(new systemClass())
    }
  }

  /**
   * Полностью очищает пайплайн (удобно при смене уровня)
   */
  public clear(): void {
    this.systems.length = 0
  }

  /**
   * Вызывается из главного цикла движка (Engine.update)
   */
  public update(deltaInSeconds: number): void {
    for (let i = 0; i < this.systems.length; i++) {
      this.systems[i].execute(deltaInSeconds)
    }
  }

  public resize(newSize: RectangleSize): void {
    for (let i = 0; i < this.systems.length; i++) {
      this.systems[i].resize?.(newSize)
    }
  }
}
