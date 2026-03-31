import type { InputAction } from '@app-types'

export default class InputService {
  public mouseX: number = 0
  public mouseY: number = 0
  // Набор кнопок, которые физически зажаты прямо сейчас
  private activeKeys: Set<string> = new Set()

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
    Space: 'fire',
    MouseLeft: 'fire'
  }

  constructor() {
    // Используем стрелочные функции, чтобы не потерять контекст this
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)

    window.addEventListener('pointerdown', this.onPointerDown)
    window.addEventListener('pointerup', this.onPointerUp)

    window.addEventListener('blur', this.handleClear)
    window.addEventListener('contextmenu', this.handleClear)
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    this.activeKeys.add(e.code)
  }

  private onKeyUp = (e: KeyboardEvent): void => {
    this.activeKeys.delete(e.code)
  }

  private onPointerDown = (e: PointerEvent): void => {
    if (e.button === 0) this.activeKeys.add('MouseLeft') // 0 - левая кнопка
  }

  private onPointerUp = (e: PointerEvent): void => {
    if (e.button === 0) this.activeKeys.delete('MouseLeft')
  }

  // Главный метод для нашей ECS системы
  public isActionActive(action: InputAction): boolean {
    for (const key of this.activeKeys) {
      if (this.keyMap[key] === action) {
        return true
      }
    }
    return false
  }

  private handleClear = (): void => {
    this.activeKeys.clear()
  }

  public clearAll(): void {
    this.handleClear()
  }

  // Не забываем очищать слушатели, если служба уничтожается
  public destroy(): void {
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
    window.removeEventListener('pointerdown', this.onPointerDown)
    window.removeEventListener('pointerup', this.onPointerUp)
    window.removeEventListener('blur', this.handleClear)
    window.removeEventListener('contextmenu', this.handleClear)
  }
}
