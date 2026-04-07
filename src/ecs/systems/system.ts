import type { RectangleSize } from '@app-types'
import type { Entity } from '@ecs/entity'
import type { ServiceLocator } from '@services/locator'

import RegistryService from '@services/service.registry'

export abstract class System {
  // Теперь системы объявляют массивы требуемых ID компонентов
  public abstract readonly includeComponents: number[]
  public readonly excludeComponents: number[] = []

  protected services!: ServiceLocator
  protected registry!: RegistryService
  private entitiesCache!: Entity[]

  public injectServices(services: ServiceLocator): void {
    this.services = services
    this.registry = services.get(RegistryService)

    // Вызываем новый метод Реестра (см. ниже)
    this.entitiesCache = this.registry.getEntitiesByQuery(
      this.includeComponents,
      this.excludeComponents
    )

    this.onInit()
  }

  protected onInit(): void {}

  public execute(delta: number): void {
    for (let i = this.entitiesCache.length - 1; i >= 0; i--) {
      if (!this.entitiesCache[i].isDestroyed) {
        this.update(delta, this.entitiesCache[i])
      }
    }
  }

  protected abstract update(delta: number, entity: Entity): void
  public resize(_newSize: RectangleSize): void {}
}
