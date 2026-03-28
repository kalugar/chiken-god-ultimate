import { System } from '../system';
import { ComponentMask } from '@ecs/components/component.mask';
import type { Entity } from '../entity';
import { InputService } from '@services/services.input';
import { EngineControl } from '@core/engine.control';
import TimeService from '@services/service.time';

export class InputSystem extends System {
  // Кешируем данные ввода на текущий кадр
  private currentDirX = 0;
  private currentDirY = 0;
  private isFiring = false;

  constructor() {
    super(ComponentMask.Player | ComponentMask.Velocity);
  }

  // Переопределяем общий цикл, чтобы подготовить данные ОДИН раз за кадр
  public execute(delta: number): void {
    const input = this.world.services.get(InputService);

    this.currentDirX = 0;
    this.currentDirY = 0;

    if (input.isActionActive('up')) this.currentDirY -= 1;
    if (input.isActionActive('down')) this.currentDirY += 1;
    if (input.isActionActive('left')) this.currentDirX -= 1;
    if (input.isActionActive('right')) this.currentDirX += 1;

    // Нормализация вектора по диагонали
    if (this.currentDirX !== 0 && this.currentDirY !== 0) {
      const length = Math.sqrt(this.currentDirX * this.currentDirX + this.currentDirY * this.currentDirY);
      this.currentDirX /= length;
      this.currentDirY /= length;
    }

    this.isFiring = input.isActionActive('fire');

    // Запускаем цикл из базового класса (он вызовет this.update для каждого игрока)
    super.execute(delta);
  }

  // Этот метод вызывается автоматически базовым классом для каждой подходящей сущности
  protected update(delta: number, entity: Entity): void {
    if (entity.isDestroyed) return;

    const velocity = entity.get('Velocity')!;
    const stats = entity.get('Stats')!; 
    
    // Умножаем направление на личную скорость сущности
    velocity.vx = this.currentDirX * stats.speed;
    velocity.vy = this.currentDirY * stats.speed;
    
    if (this.isFiring) {
      // Здесь можно будет дернуть Factory для создания пули

      console.log('Fire!');
    }
  }
}