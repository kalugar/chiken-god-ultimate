import type { System } from '@ecs/system'
import type { ECSRegistry } from '@ecs/ecs.registry'
import { ComponentMask } from '@ecs/components/component.mask'
import {
  STRIDE_FLOATS,
  OFFSET_ROTATION,
  PHYSICS_STRIDE_FLOATS,
  OFFSET_ANG_VEL
} from '@ecs/components/memory.layout'

export class RotationSystem implements System {
  // Вращаем всё, что имеет Transform (т.е. всё, что рендерится)
  private readonly REQUIRED_MASK = ComponentMask.Transform

  public update(registry: ECSRegistry, deltaTime: number): void {
    const count = registry.highestEntityId + 1
    const masks = registry.masks
    const f32 = registry.f32
    const velF32 = registry.velocityF32

    // "ГОРЯЧИЙ" ЦИКЛ ВРАЩЕНИЯ (L1 Cache Friendly)
    for (let i = 0; i < count; i++) {
      // Быстрая побитовая фильтрация
      if ((masks[i] & this.REQUIRED_MASK) === this.REQUIRED_MASK) {
        // Находим адрес сущности в "плоском" Float32 массиве
        const renderOffset = i * STRIDE_FLOATS
        const physOffset = i * PHYSICS_STRIDE_FLOATS

        // Читаем угловую скорость из физики
        const angVel = velF32[physOffset + OFFSET_ANG_VEL]

        if (angVel !== 0) {
          f32[renderOffset + OFFSET_ROTATION] += angVel * deltaTime
        }
      }
    }
  }
}
