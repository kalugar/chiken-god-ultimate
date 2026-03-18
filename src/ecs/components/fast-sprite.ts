import type { ECSRegistry } from '@ecs/ecs-registry'
import type { FrameRegistry } from '@rendering/frame-registry'

import {
  STRIDE_FLOATS,
  OFFSET_X,
  OFFSET_Y,
  OFFSET_SCALE_X,
  OFFSET_SCALE_Y,
  OFFSET_ROTATION,
  OFFSET_COLOR_32,
  OFFSET_ORIG_W,
  OFFSET_ORIG_H
} from './memory-layout'

/**
 * Flyweight/Proxy объект.
 * НЕ ХРАНИТ ДАННЫЕ В СЕБЕ! Только ссылку на массивы ECS и свой ID.
 */
export class FastSprite {
  private readonly f32: Float32Array
  private readonly u32: Uint32Array
  private readonly offset: number
  public readonly entityId: number

  constructor(registry: ECSRegistry, entityId: number) {
    // Мы берем ссылки на ГЛАВНЫЕ массивы из Реестра ECS
    this.f32 = registry.f32
    this.u32 = registry.u32
    this.entityId = entityId

    // Предвычисляем смещение для феноменальной скорости доступа
    this.offset = entityId * STRIDE_FLOATS
  }

  // --- БАЗОВЫЕ КООРДИНАТЫ ---
  get x(): number {
    return this.f32[this.offset + OFFSET_X]
  }
  set x(v: number) {
    this.f32[this.offset + OFFSET_X] = v
  }

  get y(): number {
    return this.f32[this.offset + OFFSET_Y]
  }
  set y(v: number) {
    this.f32[this.offset + OFFSET_Y] = v
  }

  get rotation(): number {
    return this.f32[this.offset + OFFSET_ROTATION]
  }
  set rotation(v: number) {
    this.f32[this.offset + OFFSET_ROTATION] = v
  }

  // --- МАСШТАБ И ВИРТУАЛЬНЫЕ WIDTH/HEIGHT ---
  get scaleX(): number {
    return this.f32[this.offset + OFFSET_SCALE_X]
  }
  set scaleX(v: number) {
    this.f32[this.offset + OFFSET_SCALE_X] = v
  }

  get scaleY(): number {
    return this.f32[this.offset + OFFSET_SCALE_Y]
  }
  set scaleY(v: number) {
    this.f32[this.offset + OFFSET_SCALE_Y] = v
  }

  get width(): number {
    return Math.abs(this.scaleX) * this.f32[this.offset + OFFSET_ORIG_W]
  }
  set width(v: number) {
    const orig = this.f32[this.offset + OFFSET_ORIG_W]
    if (orig !== 0) {
      const sign = Math.sign(this.scaleX) || 1
      this.scaleX = sign * (v / orig)
    }
  }

  /**
   * Устанавливает только цвет (RGB), сохраняя текущую прозрачность.
   * @param tint Цвет в формате 0xRRGGBB (например, 0xFF0000 для красного)
   */
  public setTint(tint: number): void {
    const index = this.entityId * STRIDE_FLOATS + OFFSET_COLOR_32

    // 1. Читаем текущее упакованное значение
    const currentPacked = this.u32[index]

    // 2. Изолируем текущую альфу (старшие 8 бит: 0xFF000000)
    const currentAlpha = currentPacked & 0xff000000

    // 3. Распаковываем входящий цвет 0xRRGGBB
    const r = (tint >> 16) & 0xff
    const g = (tint >> 8) & 0xff
    const b = tint & 0xff

    // 4. Пакуем новые RGB в формат Little Endian (R - младший байт, B - старший)
    const newRgb = (b << 16) | (g << 8) | r

    // 5. Склеиваем старую альфу с новым цветом и записываем обратно
    // Используем >>> 0, чтобы JS правильно интерпретировал знак числа
    this.u32[index] = (currentAlpha | newRgb) >>> 0
  }

  /**
   * Устанавливает только прозрачность (Alpha), сохраняя текущий цвет.
   * @param alpha Прозрачность от 0.0 (невидимый) до 1.0 (полностью видимый)
   */
  public setAlpha(alpha: number): void {
    const index = this.entityId * STRIDE_FLOATS + OFFSET_COLOR_32

    // 1. Читаем текущее упакованное значение
    const currentPacked = this.u32[index]

    // 2. Изолируем текущий цвет RGB (младшие 24 бита: 0x00FFFFFF)
    const currentRgb = currentPacked & 0x00ffffff

    // 3. Переводим float (0.0 - 1.0) в байт (0 - 255)
    const a = Math.floor(alpha * 255)

    // 4. Сдвигаем альфу в старшие 8 бит
    const newAlpha = a << 24

    // 5. Склеиваем новую альфу со старым цветом
    this.u32[index] = (newAlpha | currentRgb) >>> 0
  }
  // --- ИНТЕГРАЦИЯ С АТЛАСОМ ---
  public setFrame(frameName: string, registry: FrameRegistry) {
    const frame = registry.getFrame(frameName)

    // Пишем UV напрямую в память
    this.f32[this.offset + 9] = frame.u
    this.f32[this.offset + 10] = frame.v
    this.f32[this.offset + 11] = frame.w
    this.f32[this.offset + 12] = frame.h
    this.f32[this.offset + OFFSET_ORIG_W] = frame.pixelWidth
    this.f32[this.offset + OFFSET_ORIG_H] = frame.pixelHeight
  }
}
