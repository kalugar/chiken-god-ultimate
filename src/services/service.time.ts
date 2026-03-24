import type { TimeEvent } from '@app-types'

import { Ticker } from 'pixi.js'

import { BaseService } from './service.base'

export default class TimeEventManager extends BaseService {
  #ticker
  #timers: Set<TimeEvent> = new Set()

  constructor(ticker: Ticker = Ticker.shared) {
    super('TimeEventManager')
    this.#ticker = ticker
    this.#timers = new Set()
    this.#ticker.add(this.#update.bind(this))
  }

  public setDelayedCall(delay: number, callback: () => void): TimeEvent {
    const timer: TimeEvent = {
      callback,
      delay,
      repeat: false,
      elapsed: 0
    }

    this.#timers.add(timer)
    return timer
  }

  public setInterval(delay: number, callback: () => void): TimeEvent {
    const timer: TimeEvent = {
      callback,
      delay,
      repeat: true,
      elapsed: 0
    }

    this.#timers.add(timer)
    return timer
  }

  public clear(timer?: TimeEvent) {
    if (timer) {
      this.#timers.delete(timer)
    } else {
      this.#timers.clear()
    }
  }

  #update(t: Ticker): void {
    const delta = t.deltaMS

    for (const timer of this.#timers) {
      timer.elapsed += delta

      if (timer.elapsed >= timer.delay) {
        timer.callback()

        if (timer.repeat) {
          timer.elapsed = 0
        } else {
          this.#timers.delete(timer)
        }
      }
    }
  }
}
