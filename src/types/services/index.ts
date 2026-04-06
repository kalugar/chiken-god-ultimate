import type { ComponentRegistry } from '@ecs/components'
import type { ViewConfig } from '@utils/view.selector'

export type PrefabViewConfig = Omit<ViewConfig, 'parent'> & {
  parent?: string
}
type BaseComponents = Omit<Partial<ComponentRegistry>, 'View'>

export interface PrefabComponents extends BaseComponents {
  View?: PrefabViewConfig
}

export interface PrefabConfig {
  layer?: string
  poolSize?: number
  components: PrefabComponents
}
export interface SpawnOverrides {
  x?: number
  y?: number
  rotation?: number
  vx?: number
  vy?: number
  components?: PrefabComponents
}
export type SceneConfig = Record<string, PrefabConfig>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export type InputAction = 'up' | 'down' | 'left' | 'right' | 'fire' | 'dash' | 'sprint' | 'pan'

export type GlobalEvents = {
  // События UI
  'ui:score_changed': { newScore: number; delta: number }
  'ui:show_pause_menu': void // payload не нужен

  // Игровые события
  'game:player_death': { killerId: number; weaponType: string }
  'game:level_completed': { timeSeconds: number; stars: number }

  // Команды движка
  'engine:pause': void
  'engine:resume': void
  'engine:resize': void
  'engine:speed': number
}
