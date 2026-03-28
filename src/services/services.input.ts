import type { InputAction } from "@app-types";

export class InputService {
  // Набор кнопок, которые физически зажаты прямо сейчас
  private activeKeys: Set<string> = new Set();

  // Маппинг: какое действие на каких кнопках висит
  private keyMap: Record<string, InputAction> = {
    'KeyW': 'up',
    'ArrowUp': 'up',
    'KeyS': 'down',
    'ArrowDown': 'down',
    'KeyA': 'left',
    'ArrowLeft': 'left',
    'KeyD': 'right',
    'ArrowRight': 'right',
    'Space': 'fire',
  };

  constructor() {
    // Используем стрелочные функции, чтобы не потерять контекст this
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);

    window.addEventListener('blur', this.clearAll.bind(this));
    window.addEventListener('contextmenu', this.clearAll.bind(this));
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    this.activeKeys.add(e.code);
  }

  private onKeyUp = (e: KeyboardEvent): void => {
    this.activeKeys.delete(e.code);
  }

  // Главный метод для нашей ECS системы
  public isActionActive(action: InputAction): boolean {
    for (const key of this.activeKeys) {
      if (this.keyMap[key] === action) {
        return true;
      }
    }
    return false;
  }

  public clearAll(): void{
    this.activeKeys.clear();
  }

  // Не забываем очищать слушатели, если служба уничтожается
  public destroy(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.clearAll.bind(this));
    window.removeEventListener('contextmenu', this.clearAll.bind(this));
  }
}