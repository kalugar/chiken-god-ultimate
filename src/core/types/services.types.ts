export type ScreenSize = {
  width: number
  height: number
  scale: number
}

export type TimeEvent = {
  callback: () => void
  delay: number
  repeat: boolean
  elapsed: number
}

export type GlobalEvents = {
  // События UI
  'ui:score_changed': { newScore: number; delta: number }
  'ui:show_pause_menu': void

  // Игровые события
  'game:player_death': { killerId: number; weaponType: string }
  'game:level_completed': { timeSeconds: number; stars: number }

  // Команды движка
  'engine:pause': void
  'engine:resume': void
  'engine:resize': { width: number; height: number; scale: number }
  'engine:speed': number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventHandler<T = any> = (payload: T) => void

export type LayersOptions = {
  defaultList?: boolean
}
