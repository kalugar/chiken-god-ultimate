import { Assets, BitmapFont, BitmapFontManager, Cache, type TextStyleOptions } from 'pixi.js'

export interface BakedFontOptions extends Partial<TextStyleOptions> {
  alias: string
  fontFamily: string
  fontSize: string | number | undefined
  padding?: number
}

function isFontBaked(name: string): boolean {
  return Cache.has(name)
}

export function bakeTTF(style: BakedFontOptions): void {
  const { alias, fontFamily, fontSize, padding = 10 } = style
  const name = `${alias}:${fontSize}`

  if (!isFontBaked(name)) {
    BitmapFont.install({
      name,
      style: {
        fontFamily: fontFamily,
        fontSize,
        fill: 0xff_ff_ff
      },
      chars: BitmapFontManager.ALPHANUMERIC,
      padding
    })
  }
}

export function getFontFamily(desiredFamily: string): string {
  return Assets.get<FontFace>(desiredFamily)?.family
}

export function stringifyFontFamily(desiredFamily: string | string[] | undefined): string {
  return Array.isArray(desiredFamily) ? desiredFamily[0] : (desiredFamily ?? 'UnknownFont')
}
