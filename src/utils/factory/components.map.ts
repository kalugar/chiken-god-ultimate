import { ComponentMask } from "@ecs/components/component.mask";

const defaultMask = ComponentMask.Transform | ComponentMask.View
const dynamicMask = defaultMask | ComponentMask.Velocity

const componentsMap: Record<string, number> = {
  hidden:  ComponentMask.None,
  player:  dynamicMask | ComponentMask.Player,
  enemy: dynamicMask | ComponentMask.Enemy,
  dynamic: dynamicMask,
  default: defaultMask
}

export const getComponentsMask = (type?: string): number => {
  if (!type) return defaultMask;
  return componentsMap[type] ?? defaultMask;
};