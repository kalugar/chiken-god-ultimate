import type { RectangleSize } from '@app-types'
import { Container } from 'pixi.js'

export default class BaseLayer extends Container {
  resize(size: RectangleSize): void {
    const { width, height, scale = 1 } = size

    this.scale.set(scale)
    const x = width / 2
    const y = height / 2
    this.position.set(x, y)
  }
}
