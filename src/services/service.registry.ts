import type { ComponentDataInput, ComponentName } from '@ecs/components'

import { ComponentMask } from '@ecs/components/component.mask'
import { Entity } from '@ecs/entity' // Твой класс сущности
// src/services/service.registry.ts
import { Query } from '@ecs/query'

export default class RegistryService {
  // === ХРАНИЛИЩЕ СУЩНОСТЕЙ ===
  // Плоский массив. V8 читает его со скоростью света.
  private entities: Entity[] = []
  private availableIds: number[] = []

  // === КЭШИРОВАНИЕ ЗАПРОСОВ (QUERIES) ===
  // Для быстрого ответа Системам: Ключ -> Объект Query
  private queryCache = new Map<string, Query>()
  // Плоский массив для быстрого обновления масок без Garbage Collection
  private activeQueries: Query[] = []
  private taggedEntities: Map<string, Entity> = new Map()

  constructor(private readonly maxEntities: number = 10_000) {
    this.entities = Array.from({ length: maxEntities })
    this.availableIds = Array.from({ length: maxEntities })
    // this.events = new EventEmitter()

    // Предварительная аллокация памяти (Object Pool)
    for (let i = 0; i < maxEntities; i++) {
      this.entities[i] = new Entity(i)
      this.availableIds[maxEntities - 1 - i] = i
    }
  }

  // ==========================================
  // УПРАВЛЕНИЕ СУЩНОСТЯМИ
  // ==========================================

  private expandPool(): void {
    // Увеличиваем размер на 50% (коэффициент 1.5 - стандарт индустрии)
    const deltaSize = Math.floor(this.maxEntities * 0.5)
    const oldSize = this.entities.length
    const newSize = oldSize + deltaSize

    console.warn(`[ECS] Entity pool exhausted! Expanding from ${oldSize} to ${newSize}...`)

    // Увеличиваем размер основного массива V8
    this.entities.length = newSize

    // 1. Создаем новые сущности
    for (let i = oldSize; i < newSize; i++) {
      const entity = new Entity(i)
      entity.isDestroyed = true
      this.entities[i] = entity
    }

    // 2. Добавляем новые ID в пул доступных.
    // Так как oldSize...newSize-1, мы пушим в обратном порядке,
    // чтобы pop() первым делом вернул oldSize, затем oldSize+1 и т.д.
    for (let i = newSize - 1; i >= oldSize; i--) {
      this.availableIds.push(i)
    }
  }

  public createEntity(): Entity {
    // Берем старый ID, если есть (Free List), иначе новый
    // Если пул пуст — расширяем его прямо здесь и сейчас
    if (this.availableIds.length === 0) {
      console.warn(
        '[ECS | RegistryService] Внимание: Исходный пул сущностей исчерпан!\n' +
          'Движок динамически выделил дополнительную память. Это может вызвать микрофриз.\n' +
          '💡 Совет: Увеличьте стартовый лимит при инициализации: new Engine(config, 50_000)'
      )
      this.expandPool()
    }

    const id = this.availableIds.pop()!
    const entity = this.entities[id]
    entity.isDestroyed = false

    return entity
  }

  public destroyEntity(id: number): void {
    const entity = this.entities[id]
    if (!entity || entity.isDestroyed) return

    // 1. Помечаем как убитую
    entity.isDestroyed = true
    entity.components.clear()
    entity.mask = ComponentMask.None
    if (entity.tag) {
      this.taggedEntities.delete(entity.tag)
      entity.tag = undefined
    }

    // 2. Убираем её из всех систем (Корзин)
    this.updateEntityMask(entity)

    // 4. Отдаем ID обратно в пул!
    this.availableIds.push(id)
  }

  public setTag(tag: string, entity: Entity): void {
    // 1. Защита: Если у сущности УЖЕ был какой-то тег
    if (entity.tag && entity.tag !== tag) {
      this.taggedEntities.delete(entity.tag)
    }

    // 2. Предупреждение: Если этот тег уже занят кем-то другим
    if (this.taggedEntities.has(tag)) {
      console.warn(
        `[World] Внимание: Сущность с тегом "${tag}" уже существует! Старая сущность потеряет тег.`
      )
      const oldEntity = this.taggedEntities.get(tag)!
      oldEntity.tag = undefined
    }
    entity.tag = tag
    this.taggedEntities.set(tag, entity)
  }

  public getEntity(id: number): Entity | undefined {
    const entity = this.entities[id]
    // Защита: не возвращаем "мертвые" сущности, которые сейчас в пуле
    return entity && !entity.isDestroyed ? entity : undefined
  }

  public getEntityByTag(tag: string): Entity | undefined {
    const entity = this.taggedEntities.get(tag)
    return entity && !entity.isDestroyed ? entity : undefined
  }

  // ==========================================
  // УПРАВЛЕНИЕ КОМПОНЕНТАМИ И МАСКАМИ
  // ==========================================

  // Вызывай эти методы вместо прямой манипуляции entity.mask!
  public addComponent<T extends ComponentName>(
    entity: Entity,
    name: T,
    data: ComponentDataInput<T>
  ): void {
    if (entity.isDestroyed || entity.components.has(name)) return

    entity.components.set(name, data)
    entity.mask |= ComponentMask[name]
    this.updateEntityMask(entity)
  }

  public removeComponent(entity: Entity, name: ComponentName): void {
    if (entity.isDestroyed || !entity.components.has(name)) return

    entity.components.delete(name)
    entity.mask &= ~ComponentMask[name]
    this.updateEntityMask(entity)
  }

  // Роутинг сущности по всем активным корзинам
  private updateEntityMask(entity: Entity): void {
    for (let i = 0; i < this.activeQueries.length; i++) {
      const query = this.activeQueries[i]

      const hasRequired = (entity.mask & query.includeMask) === query.includeMask
      const hasExcluded = query.excludeMask !== 0 && (entity.mask & query.excludeMask) !== 0

      const isMatch = !entity.isDestroyed && hasRequired && !hasExcluded

      if (isMatch) {
        query.add(entity)
      } else {
        query.remove(entity)
      }
    }
  }

  // ==========================================
  // АПИ ДЛЯ СИСТЕМ
  // ==========================================

  /**
   * Система вызывает этот метод 1 раз за кадр.
   * Возвращает плоский массив сущностей за O(1).
   */
  public getEntitiesByMask(includeMask: number, excludeMask: number = 0): Entity[] {
    const key = `${includeMask}_${excludeMask}`
    let query = this.queryCache.get(key)

    if (!query) {
      // Кэш-промах. Инициализируем новую корзину (бывает только при старте системы)
      query = new Query(includeMask, excludeMask)

      // Заполняем корзину уже существующими сущностями
      for (let i = 0; i < this.entities.length; i++) {
        const entity = this.entities[i]
        if (!entity || entity.isDestroyed) continue

        const hasRequired = (entity.mask & includeMask) === includeMask
        const hasExcluded = excludeMask !== 0 && (entity.mask & excludeMask) !== 0

        if (hasRequired && !hasExcluded) {
          query.add(entity)
        }
      }

      this.queryCache.set(key, query)
      this.activeQueries.push(query)
    }

    return query.entities
  }
}
