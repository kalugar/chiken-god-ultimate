import { normalizeStat } from '@utils/factory/normalize.stat'
import { Container } from 'pixi.js'

export type Component = Record<string, unknown>
export type defaultStat = number | { max: number; current: number }

export interface TransformData {
  x: number
  y: number
  rotation: number
}
export interface VelocityData {
  vx: number
  vy: number
}

export interface StatsData {
  speed?: number
  hp?: defaultStat
  mp?: defaultStat
  stamina?: defaultStat
  shield?: defaultStat
}

export interface ViewData {
  node: Container | null
  poolId?: number | string
  type?: string
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
  Player: PlayerData
  Enemy: EnemyData
  Stats: StatsData
}

export type ComponentName = keyof ComponentRegistry
export const DefaultVelocity: VelocityData = { vx: 0, vy: 0 }
export const DefaultTransform: TransformData = { x: 0, y: 0, rotation: 0 }
export const DefaultView: ViewData = { node: null }
export const DefaultPlayer: PlayerData = { score: 0 }
export const DefaultEnemy: EnemyData = { state: 0 }
export const DefaultStat: EnemyData = {
  speed: 0,
  hp: normalizeStat(1),
  mp: normalizeStat(1),
  stamina: normalizeStat(1),
  shield: normalizeStat(0)
}

export const defaultComponentRegistry = {
  Transform: DefaultTransform,
  Velocity: DefaultVelocity,
  View: DefaultView,
  Player: DefaultPlayer,
  Enemy: DefaultEnemy,
  Stats: DefaultStat
}
