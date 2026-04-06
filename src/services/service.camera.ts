// src/services/service.camera.ts
import type { IResizable, RectangleSize } from '@app-types'

import { Container } from 'pixi.js'

import type InputService from './services.input'

export default class CameraService implements IResizable {
  // private worldLayer: Container

  // --- Настройки ---
  public smoothness: number = 10
  private screenWidth: number = window.innerWidth
  private screenHeight: number = window.innerHeight

  // --- Состояние камеры ---
  // Цель для слежения (любой объект с x и y, например компонент Transform игрока)
  private target: { x: number; y: number } | null = null

  // Текущие логические координаты центра камеры
  private x: number = 0
  private y: number = 0

  // Зум
  private currentZoom: number = 1
  private targetZoom: number = 1
  private zoomSmoothness: number = 8

  // Тряска (Shake)
  private shakeIntensity: number = 0
  private shakeDecay: number = 5 // Как быстро затухает тряска

  // Перетаскивание (Drag)
  private isDragging: boolean = false
  private dragStartX: number = 0
  private dragStartY: number = 0
  private cameraStartX: number = 0
  private cameraStartY: number = 0

  constructor(private worldLayer: Container) {
    // this.worldLayer = worldLayer
    // Обновляем центр при ресайзе окна
    // window.addEventListener('resize', () => {
    //   this.screenWidth = window.innerWidth
    //   this.screenHeight = window.innerHeight
    // })
  }

  // === ПУБЛИЧНЫЙ API ===

  public focus(target: { x: number; y: number } | null): void {
    this.target = target
  }

  public setZoom(zoom: number): void {
    // Ограничиваем зум, чтобы не уйти в минус или бесконечность
    this.targetZoom = Math.max(0.2, Math.min(zoom, 5))
  }

  public zoomIn(amount: number = 0.2): void {
    this.setZoom(this.targetZoom + amount)
  }

  public zoomOut(amount: number = 0.2): void {
    this.setZoom(this.targetZoom - amount)
  }

  public shake(intensity: number): void {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity)
  }

  // === API ДЛЯ DRAG & PINCH (Вызывается из InputService или мышиных ивентов) ===

  public beginDrag(screenX: number, screenY: number): void {
    this.isDragging = true
    this.target = null // Отвязываем камеру от игрока при ручном драге
    this.dragStartX = screenX
    this.dragStartY = screenY
    this.cameraStartX = this.x
    this.cameraStartY = this.y
  }

  public moveDrag(screenX: number, screenY: number): void {
    if (!this.isDragging) return
    // Сдвигаем камеру с учетом текущего зума
    const dx = (screenX - this.dragStartX) / this.currentZoom
    const dy = (screenY - this.dragStartY) / this.currentZoom

    this.x = this.cameraStartX - dx
    this.y = this.cameraStartY - dy
  }

  public endDrag(): void {
    this.isDragging = false
  }

  public processInput(input: InputService): void {
    // 1. Отрабатываем Zoom (колесико и щипок)
    const zoomDelta = input.consumeZoom()
    if (zoomDelta !== 0) {
      // Вычитаем дельту. Прокрутка вниз/щипок внутрь -> zoomDelta > 0 -> targetZoom уменьшается (отдаление)
      this.setZoom(this.targetZoom - zoomDelta)
    }

    // 2. Отрабатываем Drag (Перетаскивание)
    const isPanActive = input.isActionActive('pan')

    if (isPanActive && !this.isDragging) {
      // Только начали тащить
      this.beginDrag(input.screenX, input.screenY)
    } else if (isPanActive && this.isDragging) {
      // Продолжаем тащить
      this.moveDrag(input.screenX, input.screenY)
    } else if (!isPanActive && this.isDragging) {
      // Отпустили кнопку
      this.endDrag()
    }
  }

  // === ГЛАВНЫЙ ЦИКЛ ОБНОВЛЕНИЯ ===

  public update(deltaSeconds: number): void {
    // 1. Плавный зум (Lerp)
    if (this.currentZoom !== this.targetZoom) {
      const zoomLerp = 1 - Math.exp(-this.zoomSmoothness * deltaSeconds)
      this.currentZoom += (this.targetZoom - this.currentZoom) * zoomLerp
    }

    // 2. Слежение за целью (Lerp)
    if (this.target && !this.isDragging) {
      const lerpFactor = 1 - Math.exp(-this.smoothness * deltaSeconds)
      this.x += (this.target.x - this.x) * lerpFactor
      this.y += (this.target.y - this.y) * lerpFactor
    }

    // 3. Обработка тряски (Screen Shake)
    let offsetX = 0
    let offsetY = 0
    if (this.shakeIntensity > 0) {
      offsetX = (Math.random() - 0.5) * 2 * this.shakeIntensity
      offsetY = (Math.random() - 0.5) * 2 * this.shakeIntensity

      // Затухание тряски
      this.shakeIntensity -= this.shakeIntensity * this.shakeDecay * deltaSeconds
      if (this.shakeIntensity < 0.1) this.shakeIntensity = 0
    }

    // 4. Применяем математику к слою PixiJS
    this.worldLayer.scale.set(this.currentZoom)

    // Чтобы центрировать экран на (this.x, this.y),
    // сдвигаем мир на половину экрана, а затем вычитаем координаты камеры, умноженные на зум
    this.worldLayer.x = this.screenWidth / 2 - (this.x + offsetX) * this.currentZoom
    this.worldLayer.y = this.screenHeight / 2 - (this.y + offsetY) * this.currentZoom
  }

  public resize(newSize: RectangleSize): void {
    const { width, height } = newSize
    this.screenWidth = width
    this.screenHeight = height
  }
}
