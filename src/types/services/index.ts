import type { StatsData } from '@ecs/components'
import type { RawViewConfig } from '@utils/view.selector'

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
  lifeTime?: number
}

export interface SpawnOverrides {
  x?: number
  y?: number
  vx?: number
  vy?: number
  rotation?: number
  stats?: StatsData
  lifeTime?: number
}

export type SceneConfig = Record<string, PrefabConfig>

export type ServiceToken<T = any> = abstract new (...args: any[]) => T

export type LayersOptions = {
  defaultList?: boolean
}

export type TimeEvent = {
  callback: () => void
  delay: number
  repeat: boolean
  elapsed: number
}

export type InputAction = 'up' | 'down' | 'left' | 'right' | 'fire'
