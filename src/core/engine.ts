import type { System } from '@ecs/system'
import type { ApplicationOptions } from 'pixi.js'

import { Application } from 'pixi.js'
import { ECSRegistry } from '@ecs/ecs.registry'
import { FrameRegistry } from '@core/rendering/frame.registry'
import { GPURenderSystem } from '@core/rendering/gpu.renderer'
import { PhysicsSystem, RotationSystem, UISystem } from '@ecs/systems'

export type TGameState = {
  isRunning: boolean
  settings: Partial<ApplicationOptions>
}

export class Engine {
  public readonly app: Application
  public readonly ecs: ECSRegistry
  public readonly frames: FrameRegistry
  public readonly MOUSE_ENTITY_ID = 0

  public mouseX: number = 0
  public mouseY: number = 0

  private systems: System[] = []

  private state: TGameState

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
    ;(globalThis as any).app = this.app
    document.querySelector('#pixi-container')!.append(this.app.canvas)

    await this.frames.loadAtlas('assets/atlas/atlas.json')

    this.systems = [
      // new InteractionSystem(),
      new PhysicsSystem(),
      new RotationSystem(),
      new UISystem(this.app.stage),
      new GPURenderSystem(this.ecs, this.frames.atlasTexture!, this.app.stage)
    ]

    this.app.ticker.add(this.update.bind(this))
  }

  public pause(): void {
    this.app.stop()
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
}
