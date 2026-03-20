declare type RectangleSize = {
  width: number
  height: number
  scale?: number
  logicalWidth?: number
  logicalHeight?: number
}

declare type LayersOptions = {
  defaultList?: boolean
}

declare type GameState = {
  isRunning: boolean
  settings: Partial<import('pixi.js').ApplicationOptions>
}
