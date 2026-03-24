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

type ViewTypeKey = keyof typeof viewClasses
type ViewSettings<T extends ViewTypeKey> = NonNullable<
  ConstructorParameters<(typeof viewClasses)[T]>[0]
>
type SafeContainerConstructor = new (options?: Record<string, unknown>) => Container

export type RawViewConfig<T extends ViewTypeKey = ViewTypeKey> = Omit<
  ViewSettings<T>,
  'texture'
> & {
  type?: T
  label?: string
  texture?: string
  parent?: string
  layer?: string
  width?: number
  height?: number
  radius?: number
  fill?: FillInput
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export type ViewConfig<T extends ViewTypeKey = ViewTypeKey> = Omit<RawViewConfig<T>, 'parent'> & {
  parent?: Container
}

const inferViewType = <T extends ViewTypeKey>(config: ViewConfig<T>): ViewTypeKey | null => {
  if (config.texture) return 'sprite'
  if (config.width !== undefined && config.height !== undefined) return 'graphics'
  if (config.parent || config.layer) return 'container'
  return null
}

const buildGraphics = <T extends ViewTypeKey>(config: ViewConfig<T>): Graphics => {
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

export const createView = <T extends ViewTypeKey>(config: ViewConfig<T>): Container | null => {
  const { type, texture, ...pixiSettings } = config
  const finalSettings: Record<string, unknown> = { ...pixiSettings }

  const inferredType = type ?? inferViewType(config)

  if (!inferredType) {
    console.warn(
      `[createView] Ошибка: Невозможно определить type! Нет ни texture, ни width/height.`,
      config.label
    )
    return null
  }

  if (inferredType === 'sprite' && texture) {
    finalSettings.texture = Assets.get(texture) ?? Texture.WHITE
  }

  if (inferredType === 'graphics') {
    return buildGraphics(finalSettings)
  }
  const TargetClass = viewClasses[inferredType] || Container
  const Constructor = TargetClass as unknown as SafeContainerConstructor

  return new Constructor(finalSettings)
}
