import { viewClasses, type ViewConfig, type ViewTypeKey } from '@app-types'
import { Assets, Container, Graphics, Texture, type TextOptions } from 'pixi.js'

import { bakeTTF, getFontFamily, stringifyFontFamily } from './font.processor'

const inferViewType = (config: ViewConfig): ViewTypeKey => {
  if (config.text) return 'bitmapText'
  if (config.texture) return 'sprite'
  if (config.width !== undefined) return 'graphics'
  console.warn(
    `[createView -> inferViewType] Невозможно определить тип ${config.label}.\nView сброшен на Container по умолчанию`
  )
  return 'container'
}

const processGraphics = (config: ViewConfig): Graphics => {
  const { parent, label, ...shapeSettings } = config
  const { width, height, x = 0, y = 0, radius } = shapeSettings
  type GraphicsOpts = ConstructorParameters<typeof Graphics>[0]
  const g = new Graphics({ x, y, parent, label } as unknown as GraphicsOpts)

  const fill = shapeSettings.fill ?? 0xff_ff_ff

  if (width !== undefined) {
    if (height === undefined) {
      console.warn(
        `[createView -> buildGraphics] У объекта ${label} не задана высота.\n Высота выставлена равной ширине по умолчанию`
      )
    }
    g.rect(0, 0, width, height ?? width).fill(fill)
  } else if (radius === undefined) {
    console.warn(
      `[createView -> buildGraphics] У объекта ${label} нет размеров! Рисуем дефолтный квадрат.`
    )
    g.rect(0, 0, 50, 50).fill({ color: 0xff_ff_ff, alpha: 0.75 })
  } else {
    g.circle(0, 0, radius).fill(fill)
  }

  return g
}

const processFont = (config: Partial<TextOptions>, isBitmap: boolean): void => {
  const {
    style = {
      fontFamily: 'Arial',
      fontSize: 24
    }
  } = config

  if (config.style) {
    const targetFontName = stringifyFontFamily(style.fontFamily)
    const targetFontFamily = getFontFamily(targetFontName)
    config.style.fontFamily = targetFontFamily
    if (isBitmap) {
      bakeTTF({ alias: targetFontName, fontFamily: targetFontFamily, fontSize: style.fontSize })
    }
  } else {
    config.style = { ...style }
    console.warn(
      `[createView] У текстового объекта ${config.label} не задан style.\nНастройте стиль текста`
    )
  }
}

const processTexture = (texture?: string): Texture => {
  if (!texture) return Texture.WHITE
  return Assets.get(texture)
}

export const createView = (config: ViewConfig): Container => {
  // WARNING: shallow copy of pixiOptions
  const { type, texture, ...pixiOptions } = config
  const inferredType = type ?? inferViewType(config)
  const isText = inferredType === 'text' || inferredType === 'splitText'
  const isBitmapText = inferredType === 'bitmapText' || inferredType === 'splitBitmapText'

  if (inferredType === 'graphics') {
    return processGraphics(config)
  }
  if (inferredType === 'sprite') {
    pixiOptions.texture = processTexture(texture)
  }
  if (isText || isBitmapText) {
    processFont(config, isBitmapText)
  }

  const TargetClass = viewClasses[inferredType] || Container
  type DynamicConstructor = new (options: typeof pixiOptions) => Container

  return new (TargetClass as DynamicConstructor)(pixiOptions)
}
