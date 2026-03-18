import { Application } from 'pixi.js'

import { ECSRegistry } from '@ecs/ecs-registry'
import { PhysicsSystem } from '@ecs/systems/physics-system'
import { FrameRegistry } from '@rendering/frame-registry'
import { GPURenderSystem } from '@rendering/gpu-renderer'
import { RotationSystem } from '@ecs/systems/rotation-system'
import { UISystem } from '@ecs/systems/ui-system'
import { ComponentMask } from '@ecs/components/component-mask'
import { OFFSET_X, OFFSET_Y, STRIDE_FLOATS } from '@ecs/components/memory-layout'
import { InteractionSystem } from '@ecs/systems/interaction-system'

export class Engine {
  public readonly app: Application
  public readonly ecs: ECSRegistry
  public readonly frames: FrameRegistry
  public readonly MOUSE_ENTITY_ID = 0

  public mouseX: number = 0
  public mouseY: number = 0

  private physicsSystem: PhysicsSystem
  private rotationSystem: RotationSystem
  private renderSystem!: GPURenderSystem
  private interactionSystem!: InteractionSystem
  private uiSystem!: UISystem
  private lastTime: number = 0
  private framesCount: number = 0
  private timer: number = 0

  constructor(maxEntities: number = 100_000) {
    this.app = new Application()
    this.ecs = new ECSRegistry(maxEntities)
    this.frames = new FrameRegistry()
    this.physicsSystem = new PhysicsSystem()
    this.rotationSystem = new RotationSystem()
    this.interactionSystem = new InteractionSystem()
    this.uiSystem = new UISystem(this.app.stage)
  }

  public async init(): Promise<void> {
    // 1. Инициализируем PixiJS (WebGPU с фоллбеком на WebGL2)
    await this.app.init({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: '#1099bb',
      // eslint-disable-next-line unicorn/prefer-global-this
      resizeTo: window, // Автоматический ресайз
      preference: 'webgpu'
    })
    document.querySelector('#pixi-container')!.append(this.app.canvas)

    this.app.stage.eventMode = 'static'
    this.app.stage.hitArea = this.app.screen
    this.app.stage.on('pointermove', (e) => {
      this.mouseX = e.global.x
      this.mouseY = e.global.y
    })
    // 2. Загружаем графику
    await this.frames.loadAtlas('assets/atlas/atlas.json')

    // 1. СОЗДАЕМ МЫШЬ В ECS САМОЙ ПЕРВОЙ!
    const mouseId = this.ecs.createEntity() // Гарантированно вернет 0

    // Даем ей только Transform!
    // (Без Render - она невидима. Без Velocity - она неподвижна для физики)
    this.ecs.addComponent(mouseId, ComponentMask.Transform)

    // 3. Инициализируем наш кастомный рендер-граф
    this.renderSystem = new GPURenderSystem(this.ecs, this.frames.atlasTexture!)

    // Добавляем единственный объект на сцену PixiJS
    this.app.stage.addChild(this.renderSystem.mesh)

    // 4. Запускаем Главный Цикл (Game Loop)
    this.app.ticker.add(this.update.bind(this))
  }

  private update(ticker: any): void {
    const deltaTime = ticker.deltaTime / 60 // В секундах
    const elapsedSec = ticker.elapsedMS / 1000

    const now = performance.now()
    const dt = (now - this.lastTime) / 1000 // Разница в секундах
    this.lastTime = now

    // Считаем кадры
    this.framesCount++
    this.timer += dt

    if (this.timer >= 1.0) {
      // Раз в секунду
      console.log(`Real FPS: ${this.framesCount}`)
      this.framesCount = 0
      this.timer = 0
    }

    // const mouseOffset = this.MOUSE_ENTITY_ID * STRIDE_FLOATS

    // // Записываем напрямую в память
    // this.ecs.f32[mouseOffset + OFFSET_X] = this.mouseX
    // this.ecs.f32[mouseOffset + OFFSET_Y] = this.mouseY

    // // 3. Вызываем системы с чистым интерфейсом!
    // this.interactionSystem.update(this.ecs, dt)

    // Фаза 1: Логика (работает только с RAM)
    this.physicsSystem.update(this.ecs, deltaTime)
    this.rotationSystem.update(this.ecs, deltaTime)

    this.uiSystem.update(this.ecs, elapsedSec)

    // Фаза 2: Рендер (отправляет измененный RAM в VRAM)
    this.renderSystem.update(this.ecs, deltaTime)
  }
}
