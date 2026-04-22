import type { ComponentName, ComponentRegistry } from '@ecs/components'

import {
  AnimatedSprite,
  BitmapText,
  Container,
  Graphics,
  HTMLText,
  MeshPlane,
  MeshRope,
  MeshSimple,
  NineSliceSprite,
  ParticleContainer,
  PerspectiveMesh,
  SplitBitmapText,
  SplitText,
  Sprite,
  Text,
  TilingSprite,
  ViewContainer,
  type FillInput,
  type ViewContainerOptions
} from 'pixi.js'

// import { bakeTTF, getFontFamily, stringifyFontFamily } from './font.processor'

export const viewClasses = {
  animation: AnimatedSprite,
  bitmapText: BitmapText,
  container: Container,
  graphics: Graphics,
  htmlText: HTMLText,
  mesh: MeshSimple,
  nineSlice: NineSliceSprite,
  particleContainer: ParticleContainer,
  perspective: PerspectiveMesh,
  plane: MeshPlane,
  rope: MeshRope,
  splitBitmapText: SplitBitmapText,
  splitText: SplitText,
  sprite: Sprite,
  text: Text,
  tile: TilingSprite
} as const

export type ViewTypeKey = keyof typeof viewClasses

type ExtractOptions<T> = T extends abstract new (...args: infer Args) => unknown
  ? NonNullable<Args[0]>
  : never

type CustomExtensions = {
  type?: ViewTypeKey
  label?: string
  layer?: string
  parent?: Container
  texture?: string
  width?: number
  height?: number
  radius?: number
  fill?: FillInput
  anchor?: number | { x: number; y: number }

  [key: string]: unknown
}
export type ViewConfig = {
  [K in ViewTypeKey]: Omit<ExtractOptions<(typeof viewClasses)[K]>, keyof CustomExtensions> &
    CustomExtensions
}[ViewTypeKey]

export type PrefabViewConfig = Omit<ViewConfig, 'parent'> & {
  parent?: string
}

export type BaseComponents = Omit<Partial<ComponentRegistry>, 'View'>

// 2. Умный тип для компонентов префаба
export type PrefabComponents = {
  [K in ComponentName]?: K extends 'View'
    ? PrefabViewConfig
    : ComponentRegistry[K] extends void
      ? true
      : Partial<ComponentRegistry[K]> | true
}

export interface PrefabConfig {
  layer?: string
  poolSize?: number
  components: PrefabComponents
}

export interface WidgetConfig extends ViewContainerOptions {
  layer?: string
}

export interface SpawnOverrides {
  x?: number
  y?: number
  rotation?: number
  vx?: number
  vy?: number
  components?: PrefabComponents
}

// export type SceneConfig = Record<string, PrefabConfig>

export interface ScreenConfig {
  entities?: Record<string, PrefabConfig>
  ui?: Record<string, WidgetConfig>
}

export type GameConfig = Record<string, ScreenConfig>

export interface BaseScreen {
  readonly label: string
  refs: Map<string, ViewContainer>
  schemas: Map<string, PrefabConfig>

  init(): void
  enter(): Promise<void>
  exit(): Promise<void>
  destroy(): void
}

export interface BaseWidget extends BaseScreen {
  readonly view: Container
}

export interface LoadScreen extends BaseWidget {
  show(): void
  hide(): void
  updateProgress(progress: number): void
  awaitAnimation(): Promise<void>
}

export type ScreenPipelineConfig = {
  label: string
  layer: string
  Class: new (label: string) => BaseScreen | BaseWidget
  bundles?: string[]
  keepBundlesOnExit?: boolean
}
