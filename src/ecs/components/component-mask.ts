export const ComponentMask = {
  None: 0,          
  // eslint-disable-next-line unicorn/prefer-math-trunc
  Transform: 1 << 0,     // 00000001 - Есть координаты (X, Y, Scale, Rotation)
  Velocity: 1 << 1,     // 00000010 - Есть вектор скорости (двигается)
  Render: 1 << 2,     // 00000100 - Есть текстура и цвет (рисуется на экране)
  Collider: 1 << 3,     // 00001000 - Участвует в проверке столкновений
  Player: 1 << 4,     // 00010000 - Управляется игроком
} as const;

export type ComponentMask = typeof ComponentMask[keyof typeof ComponentMask];