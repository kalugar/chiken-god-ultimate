import type { Engine } from '@core/engine'
import { FastSprite } from '@utils/sprite/fast.sprite'
import { ComponentMask } from '@ecs/components/component.mask'
import {
  OFFSET_ANG_VEL,
  OFFSET_VEL_X,
  OFFSET_VEL_Y,
  PHYSICS_STRIDE_FLOATS,
  STRIDE_FLOATS
} from '@ecs/components/memory.layout'

export function spawnAsteroidField(engine: Engine, count: number) {
  const { app, ecs, frames } = engine
  const centerX = app.screen.width / 2
  const centerY = app.screen.height / 2

  for (let i = 0; i < count; i++) {
    // 1. Выделяем память под сущность
    const id = ecs.createEntity()

    // 2. Навешиваем нужные системы (Физика + Рендер)
    ecs.addComponent(id, ComponentMask.Transform | ComponentMask.Render | ComponentMask.Velocity)

    // 3. Используем Proxy для удобной настройки
    const sprite = new FastSprite(ecs, id)

    const angle = Math.random() * Math.PI * 2
    // Случайное расстояние от центра (от 50 до 400 пикселей)
    const radius = 50 + Math.random() * 125

    // Переводим полярные координаты в декартовы X/Y
    sprite.x = centerX + Math.cos(angle) * radius
    sprite.y = centerY + Math.sin(angle) * radius

    sprite.scaleX = 1
    sprite.scaleY = 1

    sprite.rotation = Math.random() * Math.PI * 2

    // Случайный цвет (Tint)
    // sprite.setTintAndAlpha(Math.random() * 0xffffff, 1.0)

    sprite.setTint(0xffffff)
    sprite.setAlpha(1)
    // Выбираем кадр из атласа (допустим, у нас есть 3 вида астероидов)
    const frameName = `ornament_0125`
    sprite.setFrame(frameName, frames)

    // 4. Задаем физику (Сырой доступ для производительности)
    // Скорость от -50 до 50 пикселей в секунду
    const physOffset = id * PHYSICS_STRIDE_FLOATS
    ecs.velocityF32[physOffset + OFFSET_VEL_X] = (Math.random() - 0.5) * 200
    ecs.velocityF32[physOffset + OFFSET_VEL_Y] = (Math.random() - 0.5) * 200
    ecs.velocityF32[physOffset + OFFSET_ANG_VEL] = (Math.random() - 0.5) * Math.PI * 4
  }
}
