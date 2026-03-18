import type { ECSRegistry } from '@ecs/ecs-registry'
import type { System } from '@ecs/system'

import { ComponentMask } from '@ecs/components/component-mask'
import {
  OFFSET_VEL_X,
  OFFSET_VEL_Y,
  OFFSET_X,
  OFFSET_Y,
  STRIDE_FLOATS
} from '@ecs/components/memory-layout'

export class PhysicsSystem implements System {
  private readonly REQUIRED_MASK = ComponentMask.Transform | ComponentMask.Velocity
  private readonly GRAVITY_Y = 500

  public update(registry: ECSRegistry, deltaTime: number): void {
    const count = registry.highestEntityId + 1
    const masks = registry.masks
    const f32 = registry.f32
    const velF32 = registry.velocityF32

    for (let index = 0; index < count; index++) {
      if ((masks[index] & this.REQUIRED_MASK) === this.REQUIRED_MASK) {
        const offset = index * STRIDE_FLOATS

        let vx = velF32[offset + OFFSET_VEL_X]
        let vy = velF32[offset + OFFSET_VEL_Y]

        // 3. МАТЕМАТИКА (Применяем гравитацию)
        vy += this.GRAVITY_Y * deltaTime

        const newX = f32[offset + OFFSET_X] + vx * deltaTime
        let newY = f32[offset + OFFSET_Y] + vy * deltaTime

        // --- ПРОСТЕЙШАЯ КОЛЛИЗИЯ С ГРАНИЦАМИ ЭКРАНА (Отскок) ---
        // Допустим, наш экран 1024x720. Заставим объекты отскакивать от пола!
        if (newY > 700) {
          newY = 700
          vy *= -0.8 // Отскок с потерей 20% энергии
        }
        if (newX < 0 || newX > 1024) {
          vx *= -1 // Отскок от стен
        }

        // 4. ЗАПИСЬ ОБРАТНО В ПАМЯТЬ
        f32[offset + OFFSET_X] = newX
        f32[offset + OFFSET_Y] = newY
        velF32[offset + OFFSET_VEL_X] = vx
        velF32[offset + OFFSET_VEL_Y] = vy
      }
    }
  }
}
