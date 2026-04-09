import type {
  ColliderData,
  DashData,
  EnemyData,
  HealthData,
  LifeTimeData,
  ManaData,
  MovementSpeedData,
  PlayerData,
  ShieldData,
  StaminaData,
  TransformData,
  VelocityData,
  ViewData,
  WeaponData
} from '../../types/component.data.types'

export const defaultComponentRegistry = {
  // Теги (void)
  Destroy: (): void => {},

  // Компоненты с данными
  Transform: (): TransformData => ({ x: 0, y: 0, rotation: 0 }),
  Velocity: (): VelocityData => ({ vx: 0, vy: 0 }),
  View: (): ViewData => ({ node: null }),
  Player: (): PlayerData => ({
    score: 0,
    moveX: 0,
    moveY: 0,
    sprintMultiplier: 2.5,
    sprintDashMultiplier: 1.5,
    intentFire: false,
    intentSprint: false,
    intentDash: false,
    aimX: 0,
    aimY: -1
  }),
  Enemy: (): EnemyData => ({ state: 0 }),
  Health: (): HealthData => ({ current: 100, max: 100 }),
  Mana: (): ManaData => ({ current: 100, max: 100 }),
  Shield: (): ShieldData => ({ current: 100, max: 100 }),
  MovementSpeed: (): MovementSpeedData => ({
    base: 250,
    current: 250
  }),
  Stamina: (): StaminaData => ({
    current: 100,
    max: 100,
    rechargeRate: 1,
    rechargeDelay: 250
  }),
  Weapon: (): WeaponData => ({
    isFiring: false,
    fireRate: 0.12,
    cooldownTimer: 0,
    aimX: 0,
    aimY: -1,
    bulletSpeed: 800
  }),
  LifeTime: (): LifeTimeData => ({ value: 1 }),
  Collider: (): ColliderData => ({ radius: 0 }),
  Dash: (): DashData => ({
    distance: 150,
    duration: 0.16,
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
  })
}

export type ComponentName = keyof typeof defaultComponentRegistry
// TypeScript автоматически берет ReturnType (то, что возвращает функция)
// Если функция возвращает void, тип будет void. Если TransformData — будет TransformData.
export type ComponentRegistry = {
  [K in ComponentName]: ReturnType<(typeof defaultComponentRegistry)[K]>
}

// Тип для аргументов в addComponent
export type ComponentDataInput<T extends ComponentName> =
  | ComponentRegistry[T]
  | (() => ComponentRegistry[T])

// Идентефикаторы id компонентов [0, 127], т.к. для хранения масок компонетов
// мы используем Uint32Array(4) 4*32 = 128 битов
export const ComponentId = Object.fromEntries(
  (Object.keys(defaultComponentRegistry) as ComponentName[]).map((key, index) => [key, index])
) as Record<ComponentName, number>

export const componentIdToName = Object.fromEntries(
  Object.entries(ComponentId).map(([name, id]) => [id, name])
) as Record<number, keyof typeof ComponentId>
