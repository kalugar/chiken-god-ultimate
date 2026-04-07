export const ComponentMask = {
  None: 0,
  // eslint-disable-next-line unicorn/prefer-math-trunc
  Transform: 1 << 0,
  Velocity: 1 << 1,
  View: 1 << 2,
  Player: 1 << 3,
  Enemy: 1 << 4,
  Dash: 1 << 5,
  Weapon: 1 << 6,
  LifeTime: 1 << 7,
  Collider: 1 << 8,
  Health: 1 << 9,
  Mana: 1 << 10,
  Shield: 1 << 11,
  MovementSpeed: 1 << 12,
  Stamina: 1 << 13,
  Destroy: 1 << 14
  // ... до 1 << 30
} as const

export type ComponentMask = (typeof ComponentMask)[keyof typeof ComponentMask]

export const MaskToName = Object.fromEntries(
  Object.entries(ComponentMask).map(([name, bit]) => [bit, name])
) as Record<number, keyof ComponentMask>
