import type { Container } from 'pixi.js'

import type { PrefabConfig } from './factory.types'

export interface Screen {
  readonly label: string
  readonly view: Container
  readonly refs: Map<string, Container>
  readonly schemas: Map<string, PrefabConfig>

  init(): void
  enter(): void
  exit(): Promise<void>
  destroy(): void
}

export type ScreenPipelineConfig = {
  label: string
  layer: string
  Class: new (label: string) => Screen
  bundles?: string[]
  keepBundlesOnExit?: boolean
}
