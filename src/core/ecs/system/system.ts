import type { ComponentName } from '@core/types/ecs.types'

import RegistryService from '@core/services/service.registry'

import type { Entity } from '../entity'

export abstract class System {
  protected registry: RegistryService

  // Кэш массива сущностей (ссылка на query.entities)
  private entitiesCache: Entity[]

  /**
   * Теперь базовый конструктор принимает RegistryService и массивы ИМЕН компонентов.
   * Никаких локаторов и хардкод-чисел!
   */
  constructor(
    registry: RegistryService,
    includeNames: ComponentName[],
    excludeNames: ComponentName[] = []
  ) {
    this.registry = registry

    // 1. Динамически переводим строковые имена в ID компонентов
    const includeIds = includeNames.map((name) => this.registry.getComponentId(name))
    const excludeIds = excludeNames.map((name) => this.registry.getComponentId(name))

    // 2. Получаем ссылку на "живой" массив сущностей из запроса
    this.entitiesCache = this.registry.getEntitiesByQuery(includeIds, excludeIds)

    this.onInit()
  }

  // Хук для дочерних классов (опционально)
  protected onInit(): void {}

  // Главный цикл системы
  public execute(delta: number): void {
    // Обратный цикл отлично подходит для ECS (если сущность удаляется посреди кадра, индексы не ломаются)
    for (let i = this.entitiesCache.length - 1; i >= 0; i--) {
      const entity = this.entitiesCache[i]
      if (!entity.isDestroyed) {
        this.update(delta, entity)
      }
    }
  }

  // Метод, который обязан реализовать разработчик игры
  protected abstract update(delta: number, entity: Entity): void
}
