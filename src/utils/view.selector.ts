import {
  AnimatedSprite,
  Assets,
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
  Sprite,
  Text,
  Texture,
  TilingSprite,
  type FillInput
} from 'pixi.js'

const viewClasses = {
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

const inferViewType = (config: ViewConfig): ViewTypeKey | null => {
  if (config.texture) return 'sprite'
  if (config.width !== undefined && config.height !== undefined) return 'graphics'
  if (config.parent || config.layer) return 'container'
  return null
}

const buildGraphics = (config: ViewConfig): Graphics => {
  const { parent, label, ...shapeSettings } = config

  type GraphicsOpts = ConstructorParameters<typeof Graphics>[0]
  const g = new Graphics({ parent, label } as unknown as GraphicsOpts)

  const fill = shapeSettings.fill ?? 0xff_ff_ff

  if (shapeSettings.width !== undefined && shapeSettings.height !== undefined) {
    g.rect(0, 0, shapeSettings.width, shapeSettings.height).fill(fill)
  } else if (shapeSettings.radius === undefined) {
    console.warn(`[buildGraphics] У объекта ${label} нет размеров! Рисуем дефолтный квадрат.`)
    g.rect(0, 0, 50, 50).fill({ color: 0xff_ff_ff, alpha: 0.75 })
  } else {
    g.circle(0, 0, shapeSettings.radius).fill(fill)
  }

  return g
}

export const createView = (config: ViewConfig): Container | null => {
  const { type, texture, ...pixiOptions } = config
  const inferredType = type ?? inferViewType(config)

  if (!inferredType) {
    console.warn(`[createView] Ошибка: Невозможно определить type!`, config.label)
    return null
  }

  if (inferredType === 'graphics') {
    return buildGraphics(config)
  }

  if (inferredType === 'sprite' && texture) {
    pixiOptions.texture = Assets.get(texture) ?? Texture.WHITE
  }
  const TargetClass = viewClasses[inferredType] || Container
  type DynamicConstructor = new (options: typeof pixiOptions) => Container

  return new (TargetClass as DynamicConstructor)(pixiOptions)
}
