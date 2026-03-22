export const ComponentMask = {
  None: 0,
  Transform: 1 << 0,
  Velocity: 1 << 1,
  Static: 1 << 2,
  Collider: 1 << 3,
  View: 1 << 4,
  Lifespan: 1 << 5,
  Player: 1 << 6,
  Enemy: 1 << 7
} as const

export type ComponentMask = (typeof ComponentMask)[keyof typeof ComponentMask]

export type ComponentName = Exclude<keyof typeof ComponentMask, 'None'>
