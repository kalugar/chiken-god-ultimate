import type { ViewContainer } from 'pixi.js'

export interface TransformData {
  x: number
  y: number
  rotation: number
}
export interface VelocityData {
  vx: number
  vy: number
}

export interface ViewData {
  node: ViewContainer
  release?: () => void
}
