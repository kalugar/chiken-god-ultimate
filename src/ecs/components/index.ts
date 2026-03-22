import type { Container } from 'pixi.js'

export interface TransformData {
  x: number
  y: number
  rotation: number
}
export interface VelocityData {
  vx: number
  vy: number
}

export interface ViewData<T extends Container = Container> {
  node: T
  release?: () => void
}
