import type { System } from '@ecs/system'
import type { ECSRegistry } from '@ecs/ecs-registry'
import { ComponentMask } from '@ecs/components/component-mask'
import {
  STRIDE_FLOATS,
  PHYSICS_STRIDE_FLOATS,
  OFFSET_X,
  OFFSET_Y,
  OFFSET_VEL_X,
  OFFSET_VEL_Y
} from '@ecs/components/memory-layout'

export class InteractionSystem implements System {
  private readonly REQUIRED_MASK = ComponentMask.Transform | ComponentMask.Velocity
  private readonly RADIUS_SQ = 25 * 25
  private readonly FORCE = 20000 // Сделаем взрыв помощнее!

  public update(registry: ECSRegistry, deltaTime: number): void {
    const count = registry.highestEntityId + 1
    const f32 = registry.f32
    const velF32 = registry.velocityF32
    const masks = registry.masks

    // --- МАГИЯ ECS: ЧИТАЕМ СУЩНОСТЬ №0 ---
    // Смещение для ID=0 равно 0. Просто берем первые два числа из массива!
    const mouseX = f32[OFFSET_X]
    const mouseY = f32[OFFSET_Y]

    // Горячий цикл по всем остальным сущностям
    for (let i = 0; i < count; i++) {
      // Фильтр мгновенно отсеет саму мышь (i=0), так как у нее нет маски Velocity!
      if ((masks[i] & this.REQUIRED_MASK) === this.REQUIRED_MASK) {
        const rOff = i * STRIDE_FLOATS
        const pOff = i * PHYSICS_STRIDE_FLOATS

        // Считаем расстояние до сущности №0
        const dx = f32[rOff + OFFSET_X] - mouseX
        const dy = f32[rOff + OFFSET_Y] - mouseY

        const distSq = dx * dx + dy * dy

        if (distSq < this.RADIUS_SQ && distSq > 0.01) {
          const invDist = 1 / Math.sqrt(distSq)
          velF32[pOff + OFFSET_VEL_X] += dx * invDist * this.FORCE * deltaTime
          velF32[pOff + OFFSET_VEL_Y] += dy * invDist * this.FORCE * deltaTime
        }

        velF32[pOff + OFFSET_VEL_X] *= 0.98
        velF32[pOff + OFFSET_VEL_Y] *= 0.98
      }
    }
  }
}
