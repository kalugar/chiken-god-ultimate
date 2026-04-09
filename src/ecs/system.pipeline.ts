import type { System } from '@ecs/systems/system'

import {
  DashSystem,
  GarbageCollectorSystem,
  InputSystem,
  LifeTimeSystem,
  MovementSystem,
  PlayerCombatSystem,
  PlayerLocomotionSystem,
  RenderSystem,
  WeaponSystem
} from '@ecs/systems'

type SystemConstructor = new () => System

// Экспортируем наш пайплайн как массив конструкторов
export const SystemPipeline: SystemConstructor[] = [
  // 1. Сбор данных
  InputSystem,

  // 2. Логика намерений (Intent)
  PlayerLocomotionSystem,
  PlayerCombatSystem,

  // 3. Физика и скиллы
  DashSystem,
  WeaponSystem,
  MovementSystem,

  // 4. Очистка и утилиты
  LifeTimeSystem,
  GarbageCollectorSystem,
  // 5. Отрисовка (ВСЕГДА в конце)
  RenderSystem
]
