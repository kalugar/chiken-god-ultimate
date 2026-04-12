import type { GlobalEvents, RectangleSize } from '@app-types'
import type { Application } from 'pixi.js'

import { LOGICAL_SIZE } from '@core/constants'

import type EventService from './service.events'

export default class ResizeService {
  private scaleFactor: number = 1
  // private resizeTimeout: TimeEvent | null = null
  constructor(
    private app: Application,
    private events: EventService<GlobalEvents>,
    private appSize: RectangleSize = { width: LOGICAL_SIZE.width, height: LOGICAL_SIZE.height }
  ) {
    if (!this.app) {
      console.warn(
        '[ResizeService] ресайз не работает. Проверьте передачу аргументов в конструктор'
      )
      this.getSize = (): RectangleSize => ({
        width: LOGICAL_SIZE.width,
        height: LOGICAL_SIZE.height
      })
    }
  }

  public requestResize(): void {
    this.events.emit('engine:resize')
  }

  public getSize(): RectangleSize {
    const screenWidth = this.app.screen.width
    const screenHeight = this.app.screen.height

    const cssW = Math.max(screenWidth, 1)
    const cssH = Math.max(screenHeight, 1)

    this.scaleFactor = Math.max(cssW / this.appSize.width, cssH / this.appSize.height)

    const newSize = {
      width: cssW,
      height: cssH,
      scale: this.scaleFactor
    }

    return newSize
  }

  public getScaleFactor(): number {
    return this.scaleFactor ?? 1
  }

  public getOrientation(): string {
    const isLandscape = matchMedia('(orientation: landscape)').matches
    return isLandscape ? 'landscape' : 'portrait'
  }

  public getScreenSize(): RectangleSize {
    const width = this.app.screen.width
    const height = this.app.screen.height
    const size = { width, height }
    return size
  }
}
