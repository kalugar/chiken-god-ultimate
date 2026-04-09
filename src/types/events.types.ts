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
  'engine:resize': void
  'engine:speed': number
}
