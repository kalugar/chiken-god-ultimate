import type { RectangleSize, TimeEvent } from '@app-types'
import type { System } from '@ecs/system'
import type { Application } from 'pixi.js'

import { LOGICAL_SIZE, RESIZE_DEBOUNCE } from '@core/constants'
import { EngineControl } from '@core/engine.control'

import type { ServiceLocator } from './locator'

import SystemTimeService from './service.system.time'
import LayersService from './sevice.layers'
// import LayersService from './sevice.layers'

export default class ResizeService {
  private scaleFactor: number = 1
  private resizeTimeout: TimeEvent | null = null
  constructor(
    private app: Application,
    private services: ServiceLocator,
    private systems: System[]
  ) {
    if (!this.app || !this.services || !this.systems) {
      console.warn(
        '[ResizeService] ресайз не работает. Проверьте передачу аргументов в конструктор'
      )
      this.resizeDebounced = (): void => {}
      this.resize = (): void => {}
    }
  }

  public resizeDebounced(): void {
    if (this.resizeTimeout) {
      this.services.get(SystemTimeService).clear(this.resizeTimeout)
    }
    this.resizeTimeout = this.services.get(SystemTimeService).delayedCall(RESIZE_DEBOUNCE, () => {
      this.resizeHandler()
      this.resizeTimeout = null
    })
  }

  public resize(): void {
    this.resizeHandler()
  }

  private resizeHandler(): void {
    const screenWidth = this.app.screen.width
    const screenHeight = this.app.screen.height

    const engineControl = this.services.get(EngineControl)

    const logicalWidth = engineControl?.settings.width ?? LOGICAL_SIZE.width
    const logicalHeight = engineControl?.settings.height ?? LOGICAL_SIZE.height

    const cssW = Math.max(screenWidth, 1)
    const cssH = Math.max(screenHeight, 1)

    this.app.canvas.style.width = cssW + 'px'
    this.app.canvas.style.height = cssH + 'px'

    this.scaleFactor = Math.max(cssW / logicalWidth, cssH / logicalHeight)

    const newSize = {
      width: cssW,
      height: cssH,
      scale: this.scaleFactor
    }

    this.services.get(LayersService)?.resize(newSize)

    for (let i = 0; i < this.systems.length; i++) {
      this.systems[i].resize?.(newSize)
    }
  }

  public getScaleFactor(): number {
    return this.scaleFactor ?? 1
  }

  public getOrientation(): string {
    const isLandscape = matchMedia('(orientation: landscape)').matches
    return isLandscape ? 'landscape' : 'portrait'
  }

  public getScreenSize (): RectangleSize {
    const width = this.app.screen.width
    const height = this.app.screen.height
    const size = { width, height} 
    return size
  }
}
