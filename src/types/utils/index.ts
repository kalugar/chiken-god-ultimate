import type { RawViewConfig } from '@utils/factory/view.selector'

export type HpData = {
  curent: number
  max: number
}

export interface PrefabConfig {
  components?: number
  layer?: string
  poolSize?: number
  hp?: number
  x?: number
  y?: number
  rotation?: number
  vx?: number
  vy?: number
  view?: RawViewConfig
}

export interface SpawnOverrides {
  x?: number
  y?: number
  vx?: number
  vy?: number
  rotation?: number
  hp?: number
}

export type SceneConfig = Record<string, PrefabConfig>
