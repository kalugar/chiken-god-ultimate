import type { EngineState, TimeEvent } from '@app-types'
import type { ApplicationOptions } from 'pixi.js'

import { World } from '@ecs/world'
import { ServiceLocator } from '@services/locator'
import { FactoryService } from '@services/service.factory'
import SystemTimeService from '@services/service.system.time'
import TimeService from '@services/service.time'
import { InputService } from '@services/services.input'
import LayersService from '@services/sevice.layers'
import { Ticker, Application } from 'pixi.js'

import { FIXED_TIME_STEP, LOGICAL_SIZE, RESIZE_DEBOUNCE } from './constants'
import { EngineControl } from './engine.control'

export class Engine {
  public readonly app: Application
  public readonly world: World
  public layers!: LayersService
  public readonly services: ServiceLocator

  private state: EngineState
  private timeStampAccumulator: number = 0
  private resizeTimeout: TimeEvent | null = null

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
    })()

    this.services.register(TimeService, gameTime)
    this.services.register(SystemTimeService, systemTime)
    this.services.register(InputService, new InputService())
    this.services.register(EngineControl, controlPanel)

    Ticker.shared.add((ticker) => systemTime.update(ticker.deltaMS))

    this.world = new World(maxEntities, this.services)

    this.services.register(FactoryService, new FactoryService(this.world))
  }

  public async init(): Promise<void> {
    await this.app.init(this.state.settings)
    document.querySelector('#pixi-container')!.append(this.app.canvas)

    this.app.renderer.on('resize', this.onResizeDebounced.bind(this))
  }

  public start(): void {
    const layers = new LayersService(this.app.stage, { defaultList: true })
    this.services.register(LayersService, layers)

    this.resize()
    this.state.isRunning = true
    this.app.ticker.add(this.update.bind(this))
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
      this.services.get(TimeService).update(FIXED_TIME_STEP)
      this.world.update(FIXED_TIME_STEP)
      this.timeStampAccumulator -= FIXED_TIME_STEP
    }
  }

  private onResizeDebounced() {
    if (this.resizeTimeout) {
      this.services.get(SystemTimeService).clear(this.resizeTimeout)
    }
    this.resizeTimeout = this.services.get(SystemTimeService).delayedCall(RESIZE_DEBOUNCE, () => {
      this.resize()
      this.resizeTimeout = null
    })
  }

  private resize() {
    const screenWidth = this.app.screen.width
    const screenHeight = this.app.screen.height

    const logicalWidth = this.state.settings.width ?? LOGICAL_SIZE.width
    const logicalHeight = this.state.settings.height ?? LOGICAL_SIZE.height

    const cssW = Math.max(screenWidth, 1)
    const cssH = Math.max(screenHeight, 1)

    this.app.canvas.style.width = cssW + 'px'
    this.app.canvas.style.height = cssH + 'px'

    const scale = Math.max(cssW / logicalWidth, cssH / logicalHeight)

    const newSize = {
      width: cssW,
      height: cssH,
      scale
    }

    this.services.get(LayersService)?.resize(newSize)
  }
}
