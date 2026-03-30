import type { World } from '@ecs/world'

import { defaultComponentRegistry, type ComponentName } from '@ecs/components'
import { ComponentMask } from '@ecs/components/component.mask'
import { Entity } from '@ecs/entity'

export const attachComponents = (context: World, entity: Entity, componentMask: number): void => {
  for (const [name, bit] of Object.entries(ComponentMask)) {
    if (bit !== ComponentMask.None && (componentMask & bit) !== 0) {
      const compName = name as ComponentName

      const defaultData =
        defaultComponentRegistry[compName as keyof typeof defaultComponentRegistry]

      if (defaultData) {
        context.addComponent(entity, compName, {
          ...defaultData
        } as typeof defaultComponentRegistry)
      }
    }
  }
}
