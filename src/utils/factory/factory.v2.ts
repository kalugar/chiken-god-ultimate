import type { Entity } from '@ecs/entity';

import { ComponentMask, type ComponentName } from '@ecs/components/component.mask'
import { World } from '@ecs/world'

const DefaultComponentData: Partial<Record<ComponentName, () => any>> = {
  Transform: () => ({ x: 0, y: 0, rotation: 0 }),
  Velocity:  () => ({ vx: 0, vy: 0 }),
  View:      () => ({ sprite: null }),
}

export class EntityFactory {
  constructor(private world: World) {}

  /**
   * Создает сущность на основе битовой маски из конфига
   */
  public createFromMask(configMask: number): Entity | null {
    const entity = this.world.createEntity()
    if (!entity) return null

    // Проходим по всем известным компонентам в нашем ComponentMask
    for (const key of Object.keys(ComponentMask)) {
      // Игнорируем обратный маппинг TypeScript (если ComponentMask это enum)
      // Если у тебя это const объект, эта проверка не повредит
      if (!Number.isNaN(Number(key))) continue; 

      const componentName = key as ComponentName
      const componentBit = ComponentMask[componentName]

      // Пропускаем ComponentMask.None
      if (componentBit === 0) continue

      // Проверяем, включен ли бит этого компонента в переданной маске конфига
      if ((configMask & componentBit) === componentBit) {
        
        // Получаем генератор дефолтных данных
        const dataGenerator = DefaultComponentData[componentName]
        const defaultData = dataGenerator ? dataGenerator() : {}

        // Вызываем твой метод добавления
        this.world.addComponent(entity, componentName, defaultData)
      }
    }

    return entity
  }
}