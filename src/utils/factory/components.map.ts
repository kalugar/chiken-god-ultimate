import { ComponentMask } from "@ecs/components/component.mask";

const defaultMask = ComponentMask.Transform | ComponentMask.View
const dynamicEntity = defaultMask | ComponentMask.Velocity

const componentsMap: Record<string, number> = {
  hidden:  ComponentMask.None,
  player:  dynamicEntity | ComponentMask.Player,
  enemy: dynamicEntity | ComponentMask.Enemy,
  dynamic: dynamicEntity,
}

export const getComponentsMask = (type?: string): number => {
  if (!type) return defaultMask;
  return componentsMap[type] ?? defaultMask;
};