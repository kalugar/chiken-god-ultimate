export const ComponentMask = {
  None: 0,
  // eslint-disable-next-line unicorn/prefer-math-trunc
  Transform: 1 << 0,
  Velocity: 1 << 1,
  View: 1 << 2,
  Player: 1 << 3,
  Enemy: 1 << 4,
  Stats: 1 << 5,
  Weapon: 1 << 6,
  LifeTime: 1 << 7
} as const

export type ComponentMask = (typeof ComponentMask)[keyof typeof ComponentMask]

export const MaskToName = Object.fromEntries(
  Object.entries(ComponentMask).map(([name, bit]) => [bit, name])
) as Record<number, keyof ComponentMask>
