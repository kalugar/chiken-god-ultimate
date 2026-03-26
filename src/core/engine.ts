import type { EngineState, TimeEvent } from '@app-types'
import type { ApplicationOptions, Ticker } from 'pixi.js'

import { World } from '@ecs/world'
import TimeService from '@services/service.time'
import LayersService from '@services/sevice.layers'
import { Application } from 'pixi.js'

import { FIXED_TIME_STEP, LOGICAL_SIZE, RESIZE_DEBOUNCE } from './constants'

export class Engine {
  public readonly app: Application
  public readonly world: World
  public time: TimeService
  public layers!: LayersService

  private state: EngineState
  private timeStampAccumulator: number = 0
  private resizeTimeout: TimeEvent | null = null

  constructor(config: Partial<ApplicationOptions & EngineState>, maxEntities: number = 10_000) {
    this.state = {
      isRunning: false,
      settings: config
    }
    this.app = new Application()
    this.time = new TimeService()
    this.world = new World(maxEntities)
  }

  public async init(): Promise<void> {
    await this.app.init(this.state.settings)
    document.querySelector('#pixi-container')!.append(this.app.canvas)

    this.app.renderer.on('resize', this.onResizeDebounced.bind(this))
  }

  public start(): void {
    this.layers = new LayersService(this.app.stage, { defaultList: true })

    this.resize()
    this.state.isRunning = true
    this.app.ticker.add(this.update.bind(this))
  }

  public pause(): void {
    this.state.isRunning = false
  }

  public resume(): void {
    this.state.isRunning = true
    this.timeStampAccumulator = 0
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
      this.time.update(FIXED_TIME_STEP)
      this.world.update(FIXED_TIME_STEP)
      this.timeStampAccumulator -= FIXED_TIME_STEP
    }
  }

  private onResizeDebounced() {
    if (this.resizeTimeout) {
      this.time.clear(this.resizeTimeout)
    }
    this.resizeTimeout = this.time.delayedCall(RESIZE_DEBOUNCE, () => {
      this.resize()
      this.resizeTimeout = null
    })
  }

  private resize() {
    console.log('resize')
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

    this.layers?.resize(newSize)
  }
}
