import type { ECSRegistry } from '@ecs/ecs.registry'

/**
 * Базовый контракт для всех логических систем.
 * Система ничего не знает о графике, она работает только с математикой и байтами.
 */
export interface System {
  /**
   * @param registry Главный менеджер ECS (хранилище памяти)
   * @param deltaTime Время, прошедшее с предыдущего кадра (в секундах)
   */
  paused?: boolean
  update(registry: ECSRegistry, deltaTime: number): void
}
