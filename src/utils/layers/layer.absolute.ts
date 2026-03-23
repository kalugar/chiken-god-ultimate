import type { RectangleSize } from '@app-types'

import BaseLayer from './layer.base'

export default class AbsoluteLayer extends BaseLayer {
  resize(size: RectangleSize): void {
    const { width, height, scale } = size

    this.scale.set(scale)
    // const x = width / 2
    // const y = height / 2
    // this.position.set(x, y)
  }
}
