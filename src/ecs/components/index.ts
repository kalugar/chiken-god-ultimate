import { normalizeStat } from '@utils/normalize.stat'
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
  currentFrameIndex?: number
}

export interface PlayerData extends Component {
  score?: number
}
export interface ColliderData extends Component {
  radius: number
}

export interface EnemyData extends Component {
  state?: number
}
export interface LifeTimeData extends Component {
  value: number
}

export interface WeaponData extends Component {
  isFiring: boolean
  fireRate: number
  cooldownTimer: number

  aimX: number
  aimY: number
}

export interface ComponentRegistry {
  Transform: TransformData
  Velocity: VelocityData
  View: ViewData
  Player: PlayerData
  Enemy: EnemyData
  Stats: StatsData
  Weapon: WeaponData
  LifeTime: LifeTimeData
  Collider: ColliderData
}

export type ComponentName = keyof ComponentRegistry
export type ComponentFactoryRegistry = {
  [T in ComponentName]: () => ComponentRegistry[T]
}

export type ComponentDataInput<T extends ComponentName> =
  | ComponentRegistry[T]
  | (() => ComponentRegistry[T])

export const createDefaultTransform = (): TransformData => ({ x: 0, y: 0, rotation: 0 })
export const createDefaultVelocity = (): VelocityData => ({ vx: 0, vy: 0 })
export const createDefaultView = (): ViewData => ({ node: null })
export const createDefaultPlayer = (): PlayerData => ({ score: 0 })
export const createDefaultCollider = (): ColliderData => ({ radius: 0 })
export const createDefaultEnemy = (): EnemyData => ({ state: 0 })
export const createDefaultLifeTime = (): LifeTimeData => ({ value: 1000 })
export const createDefaultStat = (): StatsData => ({
  speed: 0,
  hp: normalizeStat(1),
  mp: normalizeStat(1),
  stamina: normalizeStat(1),
  shield: normalizeStat(0)
})
export const createDefaultWeapon = (): WeaponData => ({
  isFiring: false,
  fireRate: 500,
  cooldownTimer: 0,
  aimX: 0,
  aimY: -1
})

export const defaultComponentRegistry = {
  Transform: createDefaultTransform,
  Velocity: createDefaultVelocity,
  View: createDefaultView,
  Player: createDefaultPlayer,
  Enemy: createDefaultEnemy,
  Stats: createDefaultStat,
  LifeTime: createDefaultLifeTime,
  Weapon: createDefaultWeapon,
  Collider: createDefaultCollider
} satisfies ComponentFactoryRegistry
