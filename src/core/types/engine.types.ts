import type { ApplicationOptions } from 'pixi.js'

export interface EngineConfig {
  containerId: string
  maxEntities?: number // Делаем опциональным с дефолтным значением внутри движка
  maxComponents?: number // Для нашего крутого BitSet!
  appSettings: Partial<ApplicationOptions>
}
