import type { GlobalEvents, ScreenSize } from '@core/types'
import type { Application } from 'pixi.js'

import type EventService from './service.events'

export class ResizeServiceV3 {
  private readonly DESIGN_SIZE: ScreenSize = { width: 1280, height: 720, scale: 1 }
  public currentSize: ScreenSize = { width: 0, height: 0, scale: 0 }
  public scaleFactor: number = 1

  constructor(
    private app: Application,
    private events: EventService<GlobalEvents>
  ) {
    this.app.renderer.on('resize', this.handleResize)

    // Инициализируем стартовые размеры
    this.handleResize(this.app.renderer.width, this.app.renderer.height)
  }

  public requestResize(): void {
    this.events.emit('engine:resize', { ...this.currentSize, scale: this.scaleFactor })
  }

  public getOrientation(): string {
    const isLandscape = matchMedia('(orientation: landscape)').matches
    return isLandscape ? 'landscape' : 'portrait'
  }

  public destroy(): void {
    this.app.renderer.off('resize', this.handleResize)
  }

  private handleResize = (width: number, height: number): void => {
    // Если resolution > 1 (Retina), делим на него, чтобы получить логические CSS-координаты для UI
    const logicalWidth = width / this.app.renderer.resolution
    const logicalHeight = height / this.app.renderer.resolution
    const scale = Math.max(
      logicalWidth / this.DESIGN_SIZE.width,
      logicalHeight / this.DESIGN_SIZE.height
    )

    this.currentSize = { width: logicalWidth, height: logicalHeight, scale }

    // Транслируем в нашу шину событий для ECS и UI
    this.events.emit('engine:resize', this.currentSize)
  }
}
