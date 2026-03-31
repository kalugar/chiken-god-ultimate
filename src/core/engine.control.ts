import type { ApplicationOptions } from 'pixi.js'

export abstract class EngineControl {
  abstract pause(): void
  abstract resume(): void
  abstract setSpeed(value: number): void
  abstract get isPaused(): boolean
  abstract get settings(): Partial<ApplicationOptions>
}
