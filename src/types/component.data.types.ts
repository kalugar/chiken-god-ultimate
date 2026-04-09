import { Container } from 'pixi.js'

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
  poolId?: string
  type?: string
  currentFrameIndex?: number
}

export interface PlayerData {
  score?: number
  moveX: number
  moveY: number
  sprintMultiplier: number
  sprintDashMultiplier: number
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
  isKeyLocked?: boolean

  startX: number
  startY: number
  targetX: number
  targetY: number
}
