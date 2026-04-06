export type RectangleSize = {
  width: number
  height: number
  scale?: number
  logicalWidth?: number
  logicalHeight?: number
}

export interface IResizable {
  resize(newSize: RectangleSize): void
}
