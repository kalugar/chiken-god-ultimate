// import type { TransformData, VelocityData } from '../../types/component.data.types'

// export const defaultComponentRegistry = {
//   // Теги (void)
//   Destroy: (): void => {},

//   // Компоненты с данными
//   Transform: (): TransformData => ({ x: 0, y: 0, rotation: 0 }),
//   Velocity: (): VelocityData => ({ vx: 0, vy: 0 })
// }

// export type ComponentName = keyof typeof defaultComponentRegistry
// // TypeScript автоматически берет ReturnType (то, что возвращает функция)
// // Если функция возвращает void, тип будет void. Если TransformData — будет TransformData.
// export type ComponentRegistry = {
//   [K in ComponentName]: ReturnType<(typeof defaultComponentRegistry)[K]>
// }

// // Идентефикаторы id компонентов [0, 127], т.к. для хранения масок компонетов
// // мы используем Uint32Array(4) 4*32 = 128 битов
// export const ComponentId = Object.fromEntries(
//   (Object.keys(defaultComponentRegistry) as ComponentName[]).map((key, index) => [key, index])
// ) as Record<ComponentName, number>

// export const componentIdToName = Object.fromEntries(
//   Object.entries(ComponentId).map(([name, id]) => [id, name])
// ) as Record<number, keyof typeof ComponentId>
