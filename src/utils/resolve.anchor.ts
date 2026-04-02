import type { Container } from 'pixi.js'

import type { ViewConfig } from './view.selector'

export const resolveAnchor = (view: Container, config?: ViewConfig): void => {
  if ('anchor' in view) {
    const targetAnchor = config?.anchor ?? 0.5
    type Anchorable = { anchor: number | { x: number; y: number } }
    ;(view as Anchorable).anchor = targetAnchor
  }
}
