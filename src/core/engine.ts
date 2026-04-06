import type { EngineState, GlobalEvents, TimeEvent } from '@app-types'
import type { ApplicationOptions } from 'pixi.js'

import { World } from '@ecs/world'
import { ServiceLocator } from '@services/locator'
import CameraService from '@services/service.camera'
import EventService from '@services/service.events'
import FactoryService from '@services/service.factory'
import ResizeService from '@services/service.resize'
import SystemTimeService from '@services/service.system.time'
import TimeService from '@services/service.time'
import InputService from '@services/services.input'
import LayersService from '@services/sevice.layers'
import { Ticker, Application, Rectangle } from 'pixi.js'

import { FIXED_TIME_STEP, RESIZE_DEBOUNCE } from './constants'
import { EngineControl } from './engine.control'

export class Engine {
  public readonly app: Application
  public readonly world: World
  public readonly services: ServiceLocator

  private resizeTimeout: TimeEvent | null = null
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

    const events = new EventService<GlobalEvents>()
    this.services.register(EventService, events)

    events.on('engine:resize', this.resizeDebounced.bind(this))
    events.on('engine:pause', this.pause.bind(this))
    events.on('engine:resume', this.resume.bind(this))

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
    this.app.canvas.addEventListener('contextmenu', (e: MouseEvent) => {
      e.preventDefault()
    })

    const layers = new LayersService(this.app.stage, { defaultList: true })
    this.services.register(LayersService, layers)

    const worldLayer = layers.getLayerByLabel('world')

    const camera = new CameraService(worldLayer)
    this.services.register(CameraService, camera)

    const resize = new ResizeService(this.app, this.services.get(EventService))
    this.services.register(ResizeService, resize)

    this.app.renderer.on('resize', this.resizeDebounced.bind(this))

    this.state.isRunning = true

    this.app.ticker.add(this.update.bind(this))

    this.app.stage.eventMode = 'static'
    this.app.stage.hitArea = new Rectangle(-9999, -9999, 9999 * 2, 9999 * 2)

    this.app.stage.on('globalpointermove', (e) => {
      const input = this.services.get(InputService)
      const layers = this.services.get(LayersService)
      const worldLayer = layers.getLayerByLabel('world')
      const localPos = worldLayer.toLocal(e.global)
      input.mouseX = localPos.x
      input.mouseY = localPos.y
    })

    this.onFocusChanged()
  }

  private onFocusChanged(): void {
    window.addEventListener('blur', () => {
      if (!this.state.isRunning) return

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
    if (!this.state.isRunning) return
    this.state.isRunning = false
  }

  public resume(): void {
    if (this.state.isRunning) return
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

      if (this.services.has(CameraService)) {
        const camera = this.services.get(CameraService)
        const input = this.services.get(InputService)

        // Сначала передаем инпут камере (чтобы она поняла, тащат ли её)
        camera.processInput(input)

        // Затем заставляем камеру пересчитать свою математику
        camera.update(deltaInSeconds)
      }

      this.timeStampAccumulator -= FIXED_TIME_STEP
    }
  }

  private resizeDebounced(): void {
    const systemTime = this.services.get(SystemTimeService)
    if (this.resizeTimeout) {
      systemTime.clear(this.resizeTimeout)
    }
    this.resizeTimeout = systemTime.delayedCall(RESIZE_DEBOUNCE, this.resizeHandler.bind(this))
  }

  private resizeHandler(): void {
    const resizeService = this.services.get(ResizeService)

    const newSize = resizeService.getSize()
    this.app.canvas.style.width = newSize.width + 'px'
    this.app.canvas.style.height = newSize.height + 'px'
    this.world.resize(newSize)
    this.services.resize(newSize)

    this.resizeTimeout = null
  }
}
