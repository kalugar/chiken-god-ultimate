import type { EngineState } from '@app-types'
import type { ApplicationOptions, Ticker } from 'pixi.js'

import { World } from '@ecs/world'
import LayersService from '@services/sevice.layers'
import { Application } from 'pixi.js'

import { LOGICAL_SIZE } from './constants'

export class Engine {
  public readonly app: Application
  public readonly world: World
  public layers!: LayersService
  // private systems: System[] = []
  private state: EngineState
  private resizeTimeout: ReturnType<typeof setTimeout> | null = null

  constructor(config: Partial<ApplicationOptions>, maxEntities: number = 10_000) {
    this.state = {
      isRunning: false,
      settings: config
    }
    this.app = new Application()
    this.world = new World(maxEntities)
  }

  public async init(): Promise<void> {
    await this.app.init(this.state.settings)
    document.querySelector('#pixi-container')!.append(this.app.canvas)
    // window.addEventListener('resize', this.resize.bind(this))
    this.app.renderer.on('resize', this.onResizeDebounced.bind(this))
  }

  public async start(): Promise<void> {
    this.layers = new LayersService(this.app.stage, { defaultList: true })
    // await this.frames.loadAtlas('assets/atlas/atlas.json')

    // this.systems = []

    // console.log(this.layers.getLayerByLabel('world'))

    this.resize()
    this.state.isRunning = true
    this.app.ticker.add(this.update.bind(this))
  }

  public pause(): void {
    // this.app.stop()
    this.state.isRunning = false
    // this.systems.forEach((system) => {
    //   if (system.hasOwnProperty('paused')) system.paused = true
    // })
  }

  public resume(): void {
    this.state.isRunning = true
  }

  public setSpeed(value: number): void {
    this.app.ticker.speed = value
  }

  private update(ticker: Ticker): void {
    if (this.state.isRunning) {
      this.world.update(ticker.deltaTime)
    }
  }

  private onResizeDebounced() {
    // Если пользователь все еще тянет окно — отменяем предыдущий таймер
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout)
    }

    // Заводим новый таймер. Код выполнится только если окно не менялось 150мс
    this.resizeTimeout = setTimeout(() => {
      this.resize()
      this.resizeTimeout = null
    }, 15) // 100-200мс обычно идеальный баланс
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
