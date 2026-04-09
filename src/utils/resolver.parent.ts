// resolveParent(layerLabel?: string, parentPrefab?: string | Container): Container {
//     if (parentPrefab) {
//       if (typeof parentPrefab !== 'string') {
//         return parentPrefab
//       }
//       if (!this.structuralViews.has(parentPrefab)) {
//         this.spawn(parentPrefab)
//       }
//       return this.structuralViews.get(parentPrefab)!
//     }

import type { SceneContext } from '@services/service.scenes'

import { Container } from 'pixi.js'

//     const targetParent = this.layers.has(layerLabel) ? layerLabel : 'world'
//     return this.layers.getLayerByLabel(targetParent)
//   }

// export function resolveParent(
//   context: Container //factory, scene, layer,
//   layerLabel?: string,
//   parentPrefab?: string | Container
// ): Container {
//   if (parentPrefab) {
//     if (typeof parentPrefab !== 'string') {
//       return parentPrefab
//     }
//     if (!context.structuralViews.has(parentPrefab)) {
//       // если возвращает null фабрика сама вызывает spawn()
//       return null
//       // this.spawn(parentPrefab)
//     }
//     return context.structuralViews.get(parentPrefab)!
//   }

//   const targetParent = layers.has(layerLabel) ? layerLabel : 'world'
//   return layers.getLayerByLabel(targetParent)
// }

export function resolveParent(
  scene: SceneContext,
  parentPrefab?: string | Container
): Container | null {
  // 1. Если передали готовый инстанс Container — просто возвращаем его
  if (parentPrefab && typeof parentPrefab !== 'string') {
    return parentPrefab
  }

  // 2. Если передали строку (ID префаба) — ищем в структурных вьюхах СЦЕНЫ
  if (typeof parentPrefab === 'string') {
    if (!scene.refs.has(parentPrefab)) {
      // if (parentPrefab === 'bulletPool') {
      //   console.log(parentPrefab, 'берём из сервиса пулов')
      // }
      // Сигнал фабрике: родитель еще не существует, нужно вызвать spawn(parentPrefab)
      return null
    }

    return scene.refs.get(parentPrefab)!
  }

  // 3. Дефолтный фолбэк: если родитель не указан,
  // цепляем сущность в корневой контейнер текущей сцены.
  return scene.view
}
