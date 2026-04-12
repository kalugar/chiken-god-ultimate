import type { EngineConfig } from '@core/types/engine.types'
import type { Application } from 'pixi.js'

export default class EngineDataService {
  constructor(
    private readonly config: EngineConfig,
    private readonly app: Application
  ) {}

  getEngineState(): EngineConfig {
    return this.config
  }

  getApp(): Application {
    return this.app
  }
}
