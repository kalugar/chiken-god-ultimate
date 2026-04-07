import { Container } from 'pixi.js'

// ==========================================
// 1. ИНТЕРФЕЙСЫ ДАННЫХ (Строгие, без Record<string, unknown>)
// ==========================================

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
export interface ShieldData {
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
export interface MovementSpeedData {
  base: number
  current: number
  acceleration?: number
  deceleration?: number
}

export interface ViewData {
  node: Container | null
  poolId?: string
  type?: string
  currentFrameIndex?: number
}

export interface PlayerData {
  score?: number
  moveX: number
  moveY: number
  sprintMultiplier: number
  intentFire: boolean
  intentSprint: boolean
  intentDash: boolean
  aimX: number
  aimY: number
}

export interface ColliderData {
  radius: number
}
export interface EnemyData {
  state?: number
}
export interface LifeTimeData {
  value: number
}

export interface WeaponData {
  isFiring: boolean
  fireRate: number
  cooldownTimer: number
  bulletSpeed: number
  aimX: number
  aimY: number
}

export interface DashData {
  distance: number
  duration: number
  cooldown: number
  maxCharges: number
  currentCharges: number
  cooldownTimer: number
  dashTimer: number
  directionX: number
  directionY: number
  isKeyLocked?: boolean
  startX: number
  startY: number
  targetX: number
  targetY: number
}

// ==========================================
// 2. РЕЕСТР КОМПОНЕНТОВ (Связывает имя с типом данных)
// ==========================================

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
  Destroy: void // Пустой объект для тегов
}

export type ComponentName = keyof ComponentRegistry

export type ComponentFactoryRegistry = {
  [T in ComponentName]: () => ComponentRegistry[T]
}

export type ComponentDataInput<T extends ComponentName> =
  | ComponentRegistry[T]
  | (() => ComponentRegistry[T])

// ==========================================
// 3. ФАБРИКИ ПО УМОЛЧАНИЮ (Всё в одном месте)
// ==========================================

export const defaultComponentRegistry: ComponentFactoryRegistry = {
  Transform: () => ({ x: 0, y: 0, rotation: 0 }),
  Velocity: () => ({ vx: 0, vy: 0 }),
  View: () => ({ node: null }),
  Player: () => ({
    score: 0,
    moveX: 0,
    moveY: 0,
    sprintMultiplier: 2,
    intentFire: false,
    intentSprint: false,
    intentDash: false,
    aimX: 0,
    aimY: -1
  }),
  Enemy: () => ({ state: 0 }),
  LifeTime: () => ({ value: 1 }),
  Weapon: () => ({
    isFiring: false,
    fireRate: 0.12,
    cooldownTimer: 0,
    aimX: 0,
    aimY: -1,
    bulletSpeed: 800
  }),
  Collider: () => ({ radius: 0 }),
  Health: () => ({ current: 100, max: 100 }),
  Mana: () => ({ current: 100, max: 100 }),
  Shield: () => ({ current: 100, max: 100 }),
  MovementSpeed: () => ({ base: 250, current: 250 }),
  Stamina: () => ({ current: 100, max: 100, rechargeRate: 1, rechargeDelay: 250 }),
  Dash: () => ({
    distance: 150,
    duration: 0.12,
    cooldown: 2,
    maxCharges: 2,
    currentCharges: 2,
    cooldownTimer: 0,
    dashTimer: 0,
    directionX: 0,
    directionY: 0,
    startX: 0,
    startY: 0,
    targetX: 0,
    targetY: 0
  }),
  Destroy: () => ({})
}
