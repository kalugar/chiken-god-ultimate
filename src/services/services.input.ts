import type { GlobalEvents, InputAction } from '@app-types'
import type { Container } from 'pixi.js'

import type EventService from './service.events'

export default class InputService {
  public mouseX: number = 0
  public mouseY: number = 0
  public screenX: number = 0
  public screenY: number = 0

  // Аккумулятор зума (Колесико + Щипок)
  private zoomDelta: number = 0
  // Набор кнопок, которые физически зажаты прямо сейчас
  private activeActions = new Set<InputAction>()
  private activePointers = new Map<number, PointerEvent>() // Храним все активные касания
  private lastPinchDistance: number | null = null //

  // Маппинг: какое действие на каких кнопках висит
  private keyMap: Record<string, InputAction> = {
    KeyW: 'up',
    ArrowUp: 'up',
    KeyS: 'down',
    ArrowDown: 'down',
    KeyA: 'left',
    ArrowLeft: 'left',
    KeyD: 'right',
    ArrowRight: 'right',
    Space: 'dash',

    ShiftLeft: 'sprint',
    ShiftRight: 'sprint',

    MouseLeft: 'fire'
  }

  constructor(private events: EventService<GlobalEvents>) {
    this.bindEvents()
  }

  private bindEvents(): void {
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)

    window.addEventListener('pointerdown', this.onPointerDown)
    window.addEventListener('pointermove', this.onPointerMove)
    window.addEventListener('pointerup', this.onPointerUp)
    window.addEventListener('pointercancel', this.onPointerUp)
    window.addEventListener('pointerout', this.onPointerUp)

    window.addEventListener('blur', this.handleClear)
    window.addEventListener('contextmenu', this.handleClear)
    window.addEventListener('focus', () => this.events.emit('engine:resume'))

    window.addEventListener('wheel', this.onWheelScroll, { passive: true })
  }

  public consumeZoom(): number {
    const delta = this.zoomDelta
    this.zoomDelta = 0
    return delta
  }

  /**
   * Пересчитывает физические координаты экрана в мировые координаты.
   * Должен вызываться каждый кадр, чтобы учитывать движение камеры!
   */
  public updateWorldMouse(worldLayer: Container): void {
    // Используем встроенную математику PixiJS для перевода координат.
    // Она сама учтет зум, скейл и x/y смещение камеры.
    const localPos = worldLayer.toLocal({ x: this.screenX, y: this.screenY })

    this.mouseX = localPos.x
    this.mouseY = localPos.y
  }

  private onWheelScroll = (e: WheelEvent): void => {
    this.zoomDelta += Math.sign(e.deltaY) * 0.2
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    if (e.repeat) return
    this.activeActions.add(this.keyMap[e.code])
  }

  private onKeyUp = (e: KeyboardEvent): void => {
    this.activeActions.delete(this.keyMap[e.code])
  }

  private onPointerDown = (e: PointerEvent): void => {
    this.activePointers.set(e.pointerId, e)
    this.updateScreenCoords(e)

    if (e.button === 0) this.activeActions.add('fire')
    else if (e.button === 2 || e.button === 1) {
      // ПКМ или Колесико мыши (нажатие)
      this.activeActions.add('pan')
    }

    if (this.activePointers.size >= 2) {
      this.activeActions.add('pan')
      this.activeActions.delete('fire')
    }
  }

  private onPointerUp = (e: PointerEvent): void => {
    this.activePointers.delete(e.pointerId)
    if (e.button === 0) this.activeActions.delete('fire')
    if (e.button === 2 || e.button === 1) this.activeActions.delete('pan')

    // Если пальцев стало меньше двух, отключаем мультитач-зум и драг
    if (this.activePointers.size < 2) {
      this.lastPinchDistance = null
      if (e.pointerType === 'touch') {
        this.activeActions.delete('pan')
      }
    }
  }

  public onPointerMove = (e: PointerEvent): void => {
    this.activePointers.set(e.pointerId, e)
    this.updateScreenCoords(e)

    // --- ЛОГИКА PINCH-TO-ZOOM (Мультитач) ---
    if (this.activePointers.size === 2) {
      const pointers = [...this.activePointers.values()]
      const dx = pointers[0].clientX - pointers[1].clientX
      const dy = pointers[0].clientY - pointers[1].clientY
      const distance = Math.hypot(dx, dy)

      if (this.lastPinchDistance !== null) {
        // Если пальцы сближаются (diff > 0) -> отдаляем камеру
        const diff = this.lastPinchDistance - distance
        this.zoomDelta += diff * 0.01 // Множитель чувствительности щипка
      }
      this.lastPinchDistance = distance

      // Во время щипка центр перетаскивания находится между двумя пальцами
      this.screenX = (pointers[0].clientX + pointers[1].clientX) / 2
      this.screenY = (pointers[0].clientY + pointers[1].clientY) / 2
    } else {
      this.lastPinchDistance = null
    }
  }

  // Главный метод для нашей ECS системы
  public isActionActive(action: InputAction): boolean {
    return this.activeActions.has(action)
  }

  private handleClear = (): void => {
    this.events.emit('engine:pause')
    this.activeActions.clear()
    this.activePointers.clear()
    this.lastPinchDistance = null
    this.zoomDelta = 0
  }

  // public clearAll(): void {
  //   this.handleClear()
  // }

  private updateScreenCoords(e: PointerEvent): void {
    // Берем координаты только основного курсора
    if (this.activePointers.size <= 1) {
      this.screenX = e.clientX
      this.screenY = e.clientY
    }
  }

  // Не забываем очищать слушатели, если служба уничтожается
  public destroy(): void {
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
    window.removeEventListener('pointerdown', this.onPointerDown)
    window.removeEventListener('pointermove', this.onPointerMove)
    window.removeEventListener('pointerup', this.onPointerUp)
    window.removeEventListener('pointercancel', this.onPointerUp)
    window.removeEventListener('pointerout', this.onPointerUp)
    window.removeEventListener('blur', this.handleClear)
    window.removeEventListener('contextmenu', this.handleClear)
    window.removeEventListener('wheel', this.onWheelScroll)
  }
}
