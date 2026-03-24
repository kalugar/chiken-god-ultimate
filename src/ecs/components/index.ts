import { Container } from 'pixi.js'

export type Component = Record<string, unknown>

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
  node: Container | null
  poolId?: number | string
  type?: string
}

export interface HealthData {
  current: number
  max: number
}

export interface PlayerData extends Component {
  score?: number
}
export interface EnemyData extends Component {
  state?: number
}

export interface ComponentRegistry {
  Transform: TransformData
  Velocity: VelocityData
  View: ViewData
  Health: HealthData
  Player: PlayerData
  Enemy: EnemyData
}

export type ComponentName = keyof ComponentRegistry

export const DefaultHealth: HealthData = { current: 1, max: 1 }
export const DefaultVelocity: VelocityData = { vx: 0, vy: 0 }
export const DefaultTransform: TransformData = { x: 0, y: 0, rotation: 0 }
export const DefaultView: ViewData = { node: null }
export const DefaultPlayer: PlayerData = { score: 0 }
export const DefaultEnemy: EnemyData = { state: 0 }

export const defaultComponentRegistry = {
  Transform: DefaultTransform,
  Velocity: DefaultVelocity,
  Health: DefaultHealth,
  View: DefaultView,
  Player: DefaultPlayer,
  Enemy: DefaultEnemy
}
