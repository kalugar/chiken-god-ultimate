import {
  AnimatedSprite,
  BitmapText,
  Container,
  FillGradient,
  Graphics,
  GraphicsContext,
  HTMLText,
  MeshPlane,
  MeshRope,
  MeshSimple,
  NineSliceSprite,
  ParticleContainer,
  PerspectiveMesh,
  Sprite,
  Text,
  TilingSprite,
  ViewContainer
} from "pixi.js";

const viewClasses = {
  animation: AnimatedSprite,
  bitmapText: BitmapText,
  container: Container,
  graphics: Graphics,
  // gradient: FillGradient,
  // graphicsContext: GraphicsContext,
  htmlText: HTMLText,
  mesh: MeshSimple,
  nineSlice: NineSliceSprite,
  particleContainer: ParticleContainer,
  perspective: PerspectiveMesh,
  plane: MeshPlane,
  rope: MeshRope,
  sprite: Sprite,
  text: Text,
  tile: TilingSprite,
} as const

type ViewTypeKey = keyof typeof viewClasses;
type ViewSettings<T extends ViewTypeKey> = ConstructorParameters<typeof viewClasses[T]>[0];

// type ExactConstructor<T extends ViewTypeKey> = new (
//   settings?: ViewSettings<T>
// ) => InstanceType<typeof viewClasses[T]>;

export const createView = (
  config: ViewConfig, 
  textures: Record<string, Texture>
): ViewContainer | Container => { 
  
  const { type, sprite, ...pixiOptions } = config;

  // if (type === 'sprite') {
  //   return new Sprite({
  //     ...pixiOptions,
  //     texture: sprite ? textures[sprite] : Texture.WHITE
  //   });
  // } 
  
  if (type === 'graphics') {
    const g = new Graphics(pixiOptions);
    g.circle(0, 0, 10).fill(0xff_ff_ff);
    return g;
  }

  const TargetClass = viewClasses[type] || Container;
  return new TargetClass(pixiOptions);
};