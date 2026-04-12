import type { TimeEvent } from '@core/types/services.types'

export default class TimeService {
  private timers: Set<TimeEvent> = new Set()

  constructor() {
    this.timers = new Set()
  }

  public delayedCall(delay: number, callback: () => void): TimeEvent {
    const timer: TimeEvent = {
      callback,
      delay,
      repeat: false,
      elapsed: 0
    }

    this.timers.add(timer)
    return timer
  }

  public wait(delay: number): Promise<void> {
    return new Promise((resolve) => {
      this.delayedCall(delay, () => {
        resolve()
      })
    })
  }

  public interval(delay: number, callback: () => void): TimeEvent {
    const timer: TimeEvent = {
      callback,
      delay,
      repeat: true,
      elapsed: 0
    }

    this.timers.add(timer)
    return timer
  }

  public clear(timers?: TimeEvent | TimeEvent[]) {
    if (timers) {
      const clearCandidates = Array.isArray(timers) ? timers : [timers]
      for (const timer of clearCandidates) {
        this.timers.delete(timer)
      }
    } else {
      this.timers.clear()
    }
  }

  public update(delta: number): void {
    const timersToClear: TimeEvent[] = []

    for (const timer of this.timers) {
      timer.elapsed += delta

      if (timer.repeat) {
        let iterations = 0
        const MAX_ITERATIONS = 5

        while (timer.elapsed >= timer.delay && iterations < MAX_ITERATIONS) {
          timer.callback()
          timer.elapsed -= timer.delay
          iterations++
        }
        if (timer.elapsed >= timer.delay) {
          timer.elapsed = timer.elapsed % timer.delay
        }
      } else if (timer.elapsed >= timer.delay) {
        timer.callback()
        timersToClear.push(timer)
      }
    }
    if (timersToClear.length > 0) {
      this.clear(timersToClear)
    }
  }
}
