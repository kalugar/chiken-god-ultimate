import type { defaultStat } from '@ecs/components'

export const normalizeStat = (stat?: defaultStat) => {
  if (typeof stat === 'number') return { max: stat, current: stat }
  return stat
}
