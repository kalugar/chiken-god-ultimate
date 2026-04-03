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

export interface HealthData {
  current: number
  max: number
  rechargeRate?: number
  rechargeDelay?: number
}

export interface ManaData {
  current: number
  max: number
  rechargeRate?: number
  rechargeDelay?: number
}

export interface StaminaData {
  current: number
  max: number
  rechargeRate: number
  rechargeDelay: number
}

export interface ShieldData {
  current: number
  max: number
  rechargeRate?: number
  rechargeDelay?: number
}

export interface MovementSpeedData {
  base: number
  current: number
  acceleration?: number
  deceleration?: number
}

export interface ViewData {
  node: Container | null
  poolId?: number | string
  type?: string
  currentFrameIndex?: number
}

export interface PlayerData extends Component {
  score?: number
  moveX: number
  moveY: number
  intentFire: boolean
  intentSprint: boolean
  aimX: number
  aimY: number
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
  bulletSpeed: number

  aimX: number
  aimY: number
}

export interface DashData {
  // --- Конфигурация (задается в префабе) ---
  distance: number // Дальность рывка в пикселях
  duration: number // Длительность самого перемещения (мс)
  cooldown: number // Время восстановления одного заряда (мс)
  maxCharges: number // Максимальное количество рывков

  // --- Состояние (меняется в рантайме) ---
  currentCharges: number // Доступно рывков сейчас
  cooldownTimer: number // Таймер до восстановления следующего заряда
  dashTimer: number // Таймер активного рывка (если > 0, сущность "летит")
  directionX: number // Направление текущего рывка
  directionY: number
}

export interface ComponentRegistry {
  Transform: TransformData
  Velocity: VelocityData
  View: ViewData
  Player: PlayerData
  Enemy: EnemyData
  Health: HealthData
  Mana: ManaData
  Shield: ShieldData
  MovementSpeed: MovementSpeedData
  Stamina: StaminaData
  Weapon: WeaponData
  LifeTime: LifeTimeData
  Collider: ColliderData
  Dash: DashData
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
export const createDefaultPlayer = (): PlayerData => ({
  score: 0,
  moveX: 0,
  moveY: 0,
  intentFire: false,
  intentSprint: false,
  aimX: 0,
  aimY: -1
})
export const createDefaultCollider = (): ColliderData => ({ radius: 0 })
export const createDefaultEnemy = (): EnemyData => ({ state: 0 })
export const createDefaultLifeTime = (): LifeTimeData => ({ value: 1 })
export const createDefaultHealth = (): HealthData => ({ current: 100, max: 100 })
export const createDefaultMana = (): ManaData => ({ current: 100, max: 100 })
export const createDefaultShield = (): ShieldData => ({ current: 100, max: 100 })
export const createDefaultMovementSpeed = (): MovementSpeedData => ({
  base: 250,
  current: 250
})
export const createDefaultStamina = (): StaminaData => ({
  current: 100,
  max: 100,
  rechargeRate: 1,
  rechargeDelay: 250
})

export const createDefaultWeapon = (): WeaponData => ({
  isFiring: false,
  fireRate: 0.12,
  cooldownTimer: 0,
  aimX: 0,
  aimY: -1,
  bulletSpeed: 800
})
export const createDefaultDash = (): DashData => ({
  distance: 150,
  duration: 200,
  cooldown: 2000,
  maxCharges: 2,

  currentCharges: 2,
  cooldownTimer: 0,
  dashTimer: 0,
  directionX: 0,
  directionY: 0
})

export const defaultComponentRegistry = {
  Transform: createDefaultTransform,
  Velocity: createDefaultVelocity,
  View: createDefaultView,
  Player: createDefaultPlayer,
  Enemy: createDefaultEnemy,
  LifeTime: createDefaultLifeTime,
  Weapon: createDefaultWeapon,
  Collider: createDefaultCollider,
  Health: createDefaultHealth,
  Mana: createDefaultMana,
  Shield: createDefaultShield,
  MovementSpeed: createDefaultMovementSpeed,
  Stamina: createDefaultStamina,
  Dash: createDefaultDash
} satisfies ComponentFactoryRegistry
