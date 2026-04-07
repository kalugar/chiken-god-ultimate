import type { RectangleSize } from '@app-types'
import type { Entity } from '@ecs/entity'
import type { ServiceLocator } from '@services/locator'

import RegistryService from '@services/service.registry'

export abstract class System {
  // Каждая система обязана объявить, какие компоненты ей нужны
  public abstract readonly includeMask: number
  public readonly excludeMask: number = 0

  // Кэшированные ссылки (чтобы не дергать Locator каждый кадр)
  protected services!: ServiceLocator
  protected registry!: RegistryService

  // === КЭШИРОВАННЫЙ МАССИВ ===
  // Храним прямую ссылку на массив из корзины Реестра
  private entitiesCache!: Entity[]

  /**
   * Вызывается Оркестратором один раз при регистрации системы.
   */
  public injectServices(services: ServiceLocator): void {
    this.services = services
    this.registry = services.get(RegistryService)
    this.entitiesCache = this.registry.getEntitiesByMask(this.includeMask, this.excludeMask)
    this.onInit()
  }

  /**
   * Опциональный хук для одноразовой настройки (например, подписки на EventBus)
   */
  protected onInit(): void {}

  /**
   * Главный метод. Вызывается Оркестратором каждый кадр.
   * Если системе нужно кастомное поведение (например, работать без сущностей),
   * она может переопределить этот метод целиком!
   */
  public execute(delta: number): void {
    // 1. Берем готовый плоский массив из нашего супер-быстрого Реестра
    for (let i = this.entitiesCache.length - 1; i >= 0; i--) {
      if (!this.entitiesCache[i].isDestroyed) {
        this.update(delta, this.entitiesCache[i])
      }
    }
  }

  /**
   * Метод, который реализует разработчик игры для обработки одной сущности.
   */
  protected abstract update(delta: number, entity: Entity): void
  public resize(_newSize: RectangleSize): void {}
}
