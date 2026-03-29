import type { StatsData } from '@ecs/components'
import type { RawViewConfig } from '@utils/factory/view.selector'

export type HpData = {
  curent: number
  max: number
}

export interface PrefabConfig {
  components?: number
  layer?: string
  poolSize?: number
  x?: number
  y?: number
  rotation?: number
  vx?: number
  vy?: number
  view?: RawViewConfig
  stats?: StatsData
}

export interface SpawnOverrides {
  x?: number
  y?: number
  vx?: number
  vy?: number
  rotation?: number
  stats?: StatsData
}

export type SceneConfig = Record<string, PrefabConfig>
