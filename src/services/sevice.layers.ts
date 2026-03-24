import type { LayersOptions, RectangleSize } from '@app-types'

import { Container, Graphics } from 'pixi.js'

import AbsoluteLayer from '../utils/layers/layer.absolute'
import BaseLayer from '../utils/layers/layer.base'
import { BaseService } from './service.base'

export default class LayersService extends BaseService {
  #root: Container
  #layers: Map<string, BaseLayer>

  constructor(root: Container, options: LayersOptions = {}) {
    super('LayersService')
    this.#root = root
    const { defaultList } = options
    this.#layers = defaultList
      ? new Map([
          ['background', new BaseLayer({ label: 'background' })],
          ['world', new BaseLayer({ label: 'world' })],
          ['ui_low', new AbsoluteLayer({ label: 'ui_low' })],
          ['fx', new AbsoluteLayer({ label: 'fx' })],
          ['ui_top', new AbsoluteLayer({ label: 'ui_top' })]
        ])
      : new Map<string, BaseLayer>()

    if (defaultList) this.#root.addChild(...this.#layers.values())
  }

  #noopLayer(label?: string) {
    return new Proxy(new Container(), {
      get: () => {
        throw new Error(`No such layer with label: "${label}"`)
      }
    })
  }

  public add(layers?: string | BaseLayer | Array<string | BaseLayer>): void {
    if (!layers) {
      console.warn('Layer addition without layer label restricted. Set correct layer label')
      return
    }
    const items: Array<string | BaseLayer> = Array.isArray(layers) ? layers : [layers]

    for (const item of items) {
      const label = item instanceof BaseLayer ? item.label : item
      const layerInstance = item instanceof BaseLayer ? item : new BaseLayer({ label: item })

      if (this.#layers.has(label)) {
        console.warn(`Layer "${label}" already exists. Set another label for the new layer.`)
        continue
      }

      this.#layers.set(label, layerInstance)
      this.#root.addChild(layerInstance)
    }
  }

  public has(layer?: string | BaseLayer): boolean {
    if (!layer) return false
    const layerLabel = typeof layer === 'string' ? layer : layer.label
    return this.#layers.has(layerLabel)
  }

  public getLayerByLabel(label?: string): Container {
    if (!label) return this.#noopLayer()

    const layer = this.#layers.get(label)

    if (!layer) return this.#noopLayer()

    return layer
  }

  #moveLayer(subLayerLabel: string, staticLayerLabel: string, offset: number) {
    const subLayer = this.getLayerByLabel(subLayerLabel)
    const staticLayer = this.getLayerByLabel(staticLayerLabel)

    if (!subLayer || !staticLayer) return

    const staticLayerIndex = this.#root.getChildIndex(staticLayer)
    const newSubLayerIndex = staticLayerIndex - offset

    const clampedIndex = Math.max(0, Math.min(this.#root.children.length - 1, newSubLayerIndex))

    this.#root.setChildIndex(subLayer, clampedIndex)
  }

  public moveLayerAbove(subLayerLabel: string, staticLayerLabel: string): void {
    this.#moveLayer(subLayerLabel, staticLayerLabel, 0)
  }
  public moveLayerBelow(subLayerLabel: string, staticLayerLabel: string): void {
    this.#moveLayer(subLayerLabel, staticLayerLabel, -1)
  }

  setDebugArea(label?: string): void {
    if (label) {
      const layer = this.getLayerByLabel(label)
      console.log('set debug:', label)
      this.updateDebugArea(layer)
    }
  }

  updateDebugArea(layer: Container): void {
    const { width, height } = layer.getBounds()

    if (!width || !height) return

    const activeDebugZone = layer.getChildByLabel('debug') as Graphics

    const drawRect = (debugElement: Graphics) => {
      debugElement
        .rect(-width / 2, -height / 2, width, height)
        .stroke({ width: 1, color: 0xff_ff_73 })
        .fill({ color: 0x00_00_ff, alpha: 0.5 })
    }

    if (activeDebugZone) {
      activeDebugZone.clear()
      drawRect(activeDebugZone)
    } else {
      const g = new Graphics({ label: 'debug' })
      drawRect(g)
      layer.addChild(g)
    }
  }

  public remove(layers?: string | BaseLayer | Array<string | BaseLayer>): void {
    if (!layers) return
    const items: Array<string | BaseLayer> = Array.isArray(layers) ? layers : [layers]

    for (const item of items) {
      const label = item instanceof BaseLayer ? item.label : item
      const layerInstance = this.#layers.get(label)

      if (!layerInstance) {
        console.warn(`Cannot remove: Layer "${label}" not found.`)
        continue
      }

      this.#layers.delete(label)
      this.#root.removeChild(layerInstance)
    }
  }

  resize(size: RectangleSize) {
    for (const layer of this.#layers.values()) {
      layer.resize(size)
    }
  }
}
