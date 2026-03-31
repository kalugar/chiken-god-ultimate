import { ComponentMask } from '@ecs/components/component.mask'

const defaultMask = ComponentMask.Transform | ComponentMask.View
const dynamicMask = defaultMask | ComponentMask.Velocity
const playerMask =
  ComponentMask.Player | ComponentMask.Stats | ComponentMask.Weapon | ComponentMask.Collider

const componentsMap: Record<string, number> = {
  hidden: ComponentMask.None,
  player: dynamicMask | playerMask,
  enemy: dynamicMask | ComponentMask.Enemy,
  dynamic: dynamicMask,
  default: defaultMask
}

export const getComponentsMask = (type?: string): number => {
  if (!type) return defaultMask
  return componentsMap[type] ?? defaultMask
}
