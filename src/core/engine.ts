import type { System } from '@ecs/system'
import type { ApplicationOptions } from 'pixi.js'

import { Application } from 'pixi.js'
import { ECSRegistry } from '@ecs/ecs.registry'
import { FrameRegistry } from '@core/rendering/frame.registry'
import { GPURenderSystem } from '@core/rendering/gpu.renderer'
import { PhysicsSystem, RotationSystem, UISystem } from '@ecs/systems'
import LayersService from '@services/sevice.layers'
import { LOGICAL_SIZE } from './constants'

export class Engine {
  public layers!: LayersService
  public readonly app: Application
  public readonly ecs: ECSRegistry
  public readonly frames: FrameRegistry
  private systems: System[] = []
  private state: GameState

  constructor(config: Partial<ApplicationOptions>, maxEntities: number = 100_000) {
    this.app = new Application()
    this.ecs = new ECSRegistry(maxEntities)
    this.frames = new FrameRegistry()

    this.state = {
      isRunning: false,
      settings: config
    }
  }

  public async init(): Promise<void> {
    await this.app.init(this.state.settings)
    document.querySelector('#pixi-container')!.append(this.app.canvas)
    // window.addEventListener('resize', this.resize.bind(this))
    // this.app.renderer.on('resize', this.resize.bind(this))
  }

  public async start(): Promise<void> {
    this.layers = new LayersService(this.app.stage, { defaultList: true })
    await this.frames.loadAtlas('assets/atlas/atlas.json')

    this.systems = [
      // new InteractionSystem(),
      new PhysicsSystem(),
      // new RotationSystem(),
      // new UISystem(this.layers.getLayerByName('ui_top')),
      new GPURenderSystem(this.ecs, this.frames.atlasTexture!, this.layers.getLayerByName('world'))
    ]

    console.log(this.layers.getLayerByName('world'))

    // this.resize()
    this.app.ticker.add(this.update.bind(this))
  }

  public pause(): void {
    // this.app.stop()
    // this.systems.forEach((system) => {
    //   if (system.hasOwnProperty('paused')) system.paused = true
    // })
  }

  public resume(): void {
    this.app.start()
  }

  public setSpeed(value: number): void {
    this.app.ticker.speed = value
  }

  private update(ticker: any): void {
    const deltaTime = ticker.deltaTime / 60

    for (let i = 0; i < this.systems.length; i++) {
      this.systems[i].update(this.ecs, deltaTime)
    }
  }

  private resize() {
    console.log('resize')
    const screenWidth = this.app.screen.width
    const screenHeight = this.app.screen.height

    const logicalWidth = this.state.settings.width ?? LOGICAL_SIZE.width
    const logicalHeight = this.state.settings.height ?? LOGICAL_SIZE.height

    const cssW = Math.max(screenWidth, 1)
    const cssH = Math.max(screenHeight, 1)

    this.app.renderer.resize(cssW, cssH)

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
