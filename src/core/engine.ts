import type { EngineState, GlobalEvents, TimeEvent } from '@app-types'
import type { ApplicationOptions, Container } from 'pixi.js'

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
import { Ticker, Application } from 'pixi.js'

import { FIXED_TIME_STEP, LOGICAL_SIZE, RESIZE_DEBOUNCE } from './constants'

export class Engine {
  public readonly app: Application
  public readonly world: World
  public readonly services: ServiceLocator

  private resizeTimeout: TimeEvent | null = null
  private state: EngineState
  private timeStampAccumulator: number = 0

  // === КЭШ СЕРВИСОВ ДЛЯ UPDATE (HOT PATH) ===
  private systemTime!: SystemTimeService
  private gameTime!: TimeService
  private camera!: CameraService | null
  private input!: InputService | null
  private worldLayer!: Container | null

  constructor(config: Partial<ApplicationOptions>, maxEntities: number = 10_000) {
    this.state = {
      isRunning: false,
      settings: config
    }

    this.app = new Application()
    this.services = new ServiceLocator()
    this.world = new World(maxEntities, this.services)
  }

  public async start(): Promise<void> {
    await this.app.init(this.state.settings)
    document.querySelector('#pixi-container')!.append(this.app.canvas)

    this.initServices()
    this.cacheHotServices()
    this.bindEvents()

    this.state.isRunning = true
  }

  private initServices(): void {
    // 1. Сначала базовые сервисы
    const events = new EventService<GlobalEvents>()
    this.services.register(EventService, events)

    const systemTime = new SystemTimeService()
    this.services.register(SystemTimeService, systemTime)

    const gameTime = new TimeService()
    this.services.register(TimeService, gameTime)

    // 2. Визуальные сервисы
    const layers = new LayersService(this.app.stage, { defaultList: true })
    this.services.register(LayersService, layers)

    const worldLayer = layers.getLayerByLabel('world')
    this.services.register(CameraService, new CameraService(worldLayer))

    // 3. Зависимые сервисы
    const width = this.state.settings.width ?? LOGICAL_SIZE.width
    const height = this.state.settings.height ?? LOGICAL_SIZE.height
    this.services.register(InputService, new InputService(events))
    this.services.register(ResizeService, new ResizeService(this.app, events, { width, height }))
    this.services.register(FactoryService, new FactoryService(this.world))
  }

  private cacheHotServices(): void {
    // Сохраняем прямые ссылки на объекты памяти для разгрузки update().
    this.systemTime = this.services.get(SystemTimeService)
    this.gameTime = this.services.get(TimeService)
    this.camera = this.services.has(CameraService) ? this.services.get(CameraService) : null
    this.input = this.services.has(InputService) ? this.services.get(InputService) : null

    const layers = this.services.get(LayersService)
    this.worldLayer = layers.getLayerByLabel('world') || null
  }

  private bindEvents(): void {
    const { canvas, renderer, ticker } = this.app
    const events = this.services.get(EventService)
    const systemTime = this.services.get(SystemTimeService)

    events.on('engine:resize', this.resizeDebounced.bind(this))
    events.on('engine:pause', this.pause.bind(this))
    events.on('engine:resume', this.resume.bind(this))
    events.on('engine:speed', this.setSpeed.bind(this))

    Ticker.shared.add((ticker) => systemTime.update(ticker.deltaMS))

    canvas.addEventListener('contextmenu', (e: MouseEvent) => e.preventDefault())
    renderer.on('resize', this.resizeDebounced.bind(this))
    ticker.add(this.update.bind(this))
  }

  private pause(): void {
    this.state.isRunning = false
  }

  private resume(): void {
    if (this.state.isRunning) return
    this.timeStampAccumulator = 0
    this.state.isRunning = true
  }

  private setSpeed(value: number): void {
    this.app.ticker.speed = value
  }
  private update(ticker: Ticker): void {
    if (!this.state.isRunning) return
    const deltaRealTime = ticker.deltaMS
    if (deltaRealTime > 1000) {
      console.warn('Обнаружен сильный лаг, сбрасываем кадр')
      return
    }
    this.timeStampAccumulator += deltaRealTime
    const deltaInSeconds = FIXED_TIME_STEP / 1000

    // Игровой цикл фиксированного шага
    while (this.timeStampAccumulator >= FIXED_TIME_STEP) {
      this.gameTime.update(FIXED_TIME_STEP)
      this.world.update(deltaInSeconds)

      if (this.camera && this.input) {
        this.camera.processInput(this.input)
        this.camera.update(deltaInSeconds)
      }

      if (this.worldLayer && this.input) {
        this.input.updateWorldMouse(this.worldLayer)
      }

      this.timeStampAccumulator -= FIXED_TIME_STEP
    }
  }

  private resizeDebounced(): void {
    if (this.resizeTimeout) {
      this.systemTime.clear(this.resizeTimeout)
    }
    this.resizeTimeout = this.systemTime.delayedCall(RESIZE_DEBOUNCE, this.resizeHandler.bind(this))
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
