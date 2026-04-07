let nextComponentId = 0
const createId = () => nextComponentId++

export const ComponentId = {
  // Tags
  Destroy: createId(),
  Player: createId(),
  Enemy: createId(),
  // Components
  Transform: createId(),
  Velocity: createId(),
  View: createId(),
  Dash: createId(),
  Weapon: createId(),
  LifeTime: createId(),
  Collider: createId(),
  Health: createId(),
  Mana: createId(),
  Shield: createId(),
  MovementSpeed: createId(),
  Stamina: createId()
} as const

export type ComponentId = (typeof ComponentId)[keyof typeof ComponentId]

// Обратный маппинг для дебага останется почти таким же
export const componentIdToName = Object.fromEntries(
  Object.entries(ComponentId).map(([name, id]) => [id, name])
) as Record<number, keyof typeof ComponentId>
