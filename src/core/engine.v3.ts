import type { EngineConfig, GlobalEvents } from '@core/engine.types'

import { ComponentController } from '@core/ecs/component/controller'
import { SystemDispatcher } from '@core/ecs/dispatcher'
import { GameLoop } from '@core/loop'
import { ServiceLocator } from '@core/services/locator'
import CameraService from '@core/services/service.camera'
import EventService from '@core/services/service.events'
import FactoryService from '@core/services/service.factory'
import InputService from '@core/services/service.input'
import PoolService from '@core/services/service.object.pool'
import RegistryService from '@core/services/service.registry'
import { ResizeServiceV3 } from '@core/services/service.resize.v3'
import ScreenStateService from '@core/services/service.screen.state'
import SystemTimeService from '@core/services/service.system.time'
import TimeService from '@core/services/service.time'
import LayersService from '@core/services/sevice.layers'
import { Application } from 'pixi.js'

export class EngineV3 {
  public readonly app: Application
  public readonly components: ComponentController
  public readonly dispatcher: SystemDispatcher
  public readonly loop: GameLoop
  public readonly services: ServiceLocator
  public readonly screens: ScreenStateService
  private config: EngineConfig

  constructor(config: EngineConfig) {
    this.config = {
      maxEntities: 10_000,
      maxComponents: 256,
      ...config
    }

    this.app = new Application()
    this.components = new ComponentController(config.maxComponents)
    this.services = new ServiceLocator()
    this.dispatcher = new SystemDispatcher(this.services)

    const events = new EventService<GlobalEvents>()
    const gameTime = new TimeService()
    const systemTime = new SystemTimeService()
    const layers = new LayersService(this.app.stage, { defaultList: true })

    this.services.register(EventService, events)
    this.services.register(TimeService, gameTime)
    this.services.register(SystemTimeService, systemTime)
    this.services.register(LayersService, layers)

    this.services.register(InputService, new InputService(this.app.canvas, events))
    this.services.register(ResizeServiceV3, new ResizeServiceV3(this.app, events))

    this.services.register(
      RegistryService,
      new RegistryService(config.maxEntities, this.components)
    )
    this.services.register(PoolService, new PoolService())
    this.services.register(FactoryService, new FactoryService())

    const worldLayer = layers.getLayerByLabel('world')
    this.services.register(CameraService, new CameraService(worldLayer))

    this.loop = new GameLoop(this.app.ticker, this.dispatcher, systemTime, gameTime)
    this.screens = new ScreenStateService(layers)
  }

  public async start(): Promise<void> {
    await this.app.init(this.config.appSettings)

    const container = document.querySelector(this.config.containerId)
    if (!container) {
      throw new Error(`[Engine] Контейнер ${this.config.containerId} не найден в DOM!`)
    }
    container.append(this.app.canvas)

    // await this.screens.bootGame()
    this.loop.play()
  }
}
