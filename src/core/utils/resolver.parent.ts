import type { Screen } from '@app-types'
import type { Container } from 'pixi.js'

export function resolveParent(scene: Screen, parentPrefab?: string | Container): Container | null {
  // 1. Если передали готовый инстанс Container — просто возвращаем его
  if (parentPrefab && typeof parentPrefab !== 'string') {
    return parentPrefab
  }

  // 2. Если передали строку (ID префаба) — ищем в структурных вьюхах СЦЕНЫ
  if (typeof parentPrefab === 'string') {
    if (!scene.refs.has(parentPrefab)) {
      // Сигнал фабрике: родитель еще не существует, нужно вызвать spawn(parentPrefab)
      return null
    }

    return scene.refs.get(parentPrefab)!
  }

  // 3. Дефолтный фолбэк: если родитель не указан,
  // цепляем сущность в корневой контейнер текущей сцены.
  return scene.view
}
