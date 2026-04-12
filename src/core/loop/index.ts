// @my-engine/core/loop/GameLoop.ts
import type { SystemDispatcher } from '@core/ecs/dispatcher'
import type SystemTimeService from '@core/services/service.system.time'
import type TimeService from '@core/services/service.time'

import { Ticker } from 'pixi.js'

export class GameLoop {
  private readonly FIXED_TIME_STEP = 1000 / 60 // Например, 60 раз в секунду (в мс)
  private timeStampAccumulator: number = 0
  private isRunning: boolean = false

  constructor(
    private ticker: Ticker,
    private dispatcher: SystemDispatcher,
    private systemTime: SystemTimeService,
    private gameTime: TimeService
  ) {
    // Подписываемся на тикер Pixi
    this.ticker.add(this.update, this)
  }

  public play(): void {
    if (this.isRunning) return
    this.isRunning = true
    this.timeStampAccumulator = 0
  }

  public pause(): void {
    this.isRunning = false
  }

  public setSpeed(speed: number): void {
    this.ticker.speed = speed
  }

  public destroy(): void {
    this.pause()
    this.ticker.remove(this.update, this)
  }

  // Приватный метод, который никто снаружи не вызовет
  private update = (ticker: Ticker): void => {
    const deltaRealTime = ticker.deltaMS
    this.systemTime.update(deltaRealTime)

    if (!this.isRunning) return
    // Защита от "Спирали смерти" (когда вкладка браузера была неактивна)
    if (deltaRealTime > 1000) {
      console.warn('[GameLoop] Обнаружен сильный лаг, сбрасываем кадр')
      this.timeStampAccumulator = 0
      return
    }

    this.timeStampAccumulator += deltaRealTime
    const deltaInSeconds = this.FIXED_TIME_STEP / 1000

    // Игровой цикл фиксированного шага (Fixed Update)
    while (this.timeStampAccumulator >= this.FIXED_TIME_STEP) {
      // 1. Обновляем время
      this.gameTime.update(this.FIXED_TIME_STEP)

      // 2. Обновляем ВСЕ системы разом (включая InputSystem и CameraSystem)
      this.dispatcher.update(deltaInSeconds)

      this.timeStampAccumulator -= this.FIXED_TIME_STEP
    }
  }
}
