import type { EngineState } from '@app-types'
import type { ApplicationOptions } from 'pixi.js'

import { World } from '@ecs/world'
import { ServiceLocator } from '@services/locator'
import FactoryService from '@services/service.factory'
import ResizeService from '@services/service.resize'
import SystemTimeService from '@services/service.system.time'
import TimeService from '@services/service.time'
import InputService from '@services/services.input'
import LayersService from '@services/sevice.layers'
import { Ticker, Application, Rectangle } from 'pixi.js'

import { FIXED_TIME_STEP } from './constants'
import { EngineControl } from './engine.control'

export class Engine {
  public readonly app: Application
  public readonly world: World
  public readonly services: ServiceLocator

  private state: EngineState
  private timeStampAccumulator: number = 0

  constructor(config: Partial<ApplicationOptions>, maxEntities: number = 10_000) {
    this.state = {
      isRunning: false,
      settings: config
    }

    this.app = new Application()
    this.services = new ServiceLocator()

    const gameTime = new TimeService()
    const systemTime = new SystemTimeService()

    // eslint-disable-next-line unicorn/no-this-assignment, @typescript-eslint/no-this-alias
    const self = this
    const controlPanel = new (class extends EngineControl {
      public pause(): void {
        self.pause()
      }
      public resume(): void {
        self.resume()
      }
      public setSpeed(v: number): void {
        self.setSpeed(v)
      }
      public get isPaused(): boolean {
        return !self.state.isRunning
      }
      public get settings(): Partial<ApplicationOptions> {
        return self.state.settings
      }
    })()

    this.services.register(TimeService, gameTime)
    this.services.register(SystemTimeService, systemTime)
    this.services.register(InputService, new InputService())
    this.services.register(EngineControl, controlPanel)

    Ticker.shared.add((ticker) => systemTime.update(ticker.deltaMS))

    this.world = new World(maxEntities, this.services)

    this.services.register(FactoryService, new FactoryService(this.world))
  }

  public async start(): Promise<void> {
    await this.app.init(this.state.settings)
    document.querySelector('#pixi-container')!.append(this.app.canvas)

    const resize = new ResizeService(this.app, this.services, this.world.systems)
    this.services.register(ResizeService, resize)

    this.app.renderer.on('resize', resize.resizeDebounced.bind(resize))

    const layers = new LayersService(this.app.stage, { defaultList: true })
    this.services.register(LayersService, layers)

    this.state.isRunning = true

    this.app.ticker.add(this.update.bind(this))

    this.app.stage.eventMode = 'static'
    // Чтобы Pixi ловил мышь ВЕЗДЕ, даже если фон прозрачный:
    this.app.stage.hitArea = new Rectangle(-9999, -9999, 9999 * 2, 9999 * 2)

    // Ловим глобальное движение мыши с идеальными логическими координатами
    this.app.stage.on('globalpointermove', (e) => {
      const input = this.services.get(InputService)
      const layers = this.services.get(LayersService) // Достаем сервис слоев

      // Получаем наш центрированный слой мира
      const worldLayer = layers.getLayerByLabel('world')

      // === ПЕРЕВОД КООРДИНАТ ===
      // Pixi сам вычтет смещение width/2 и height/2, а также учтет scale слоя!
      const localPos = worldLayer.toLocal(e.global)
      input.mouseX = localPos.x
      input.mouseY = localPos.y
    })

    window.addEventListener('blur', () => {
      if (!this.state.isRunning) return // Если уже на паузе, ничего не делаем

      this.pause()
      console.log('Игра поставлена на паузу (потеря фокуса)')

      // Позже здесь ты вызовешь глобальное событие, чтобы показать HTML-меню паузы
      // globalEvents.emit('cmd:show_pause_menu');
    })

    window.addEventListener('focus', () => {
      // Здесь мы НЕ вызываем this.resume()!
      // Мы просто логируем или меняем состояние UI, если нужно.
      // Снять с паузы игрок должен сам, кликнув по экрану или нажав ESC.
      this.resume() //временная залушка

      console.log('Фокус возвращен. Ждем команду от игрока для продолжения.')
    })
  }

  public pause(): void {
    this.state.isRunning = false
  }

  public resume(): void {
    this.timeStampAccumulator = 0
    this.services.get(InputService).clearAll()
    this.state.isRunning = true
  }

  public setSpeed(value: number): void {
    this.app.ticker.speed = value
  }

  private update(ticker: Ticker): void {
    if (!this.state.isRunning) return

    const deltaRealTime = ticker.deltaMS

    if (deltaRealTime > 1000) {
      console.warn('Обнаружен сильный лаг, пропускаем физику')
      return
    }

    this.timeStampAccumulator += deltaRealTime
    while (this.timeStampAccumulator >= FIXED_TIME_STEP) {
      const deltaInSeconds = FIXED_TIME_STEP / 1000
      this.services.get(TimeService).update(FIXED_TIME_STEP)
      this.world.update(deltaInSeconds)
      this.timeStampAccumulator -= FIXED_TIME_STEP
    }
  }
}
