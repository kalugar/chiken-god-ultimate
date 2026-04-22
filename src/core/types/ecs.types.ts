import { Container } from 'pixi.js'

export interface ComponentRegistry {
  // Базовые компоненты, которые движок предоставляет "из коробки"
  Transform: { x: number; y: number; rotation: number }
  View: { node: Container; poolId?: string; type?: string; currentFrameIndex?: number }
}

export type ComponentName = keyof ComponentRegistry

export type ComponentData<K extends ComponentName> = ComponentRegistry[K]
