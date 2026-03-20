import { Container, Graphics } from 'pixi.js'
import { BaseService } from './service.base'
import AbsoluteLayer from '../utils/layers/layer.absolute'
import BaseLayer from '../utils/layers/layer.base'

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
          ['fx', new AbsoluteLayer({ label: 'fxui_bottom' })],
          ['ui_top', new AbsoluteLayer({ label: 'ui_top' })]
        ])
      : new Map()

    if (defaultList) this.#root.addChild(...this.#layers.values())
  }

  #noopLayer(name?: string) {
    return new Proxy(new Container(), {
      get: () => {
        throw new Error(`No such layer with name: "${name}"`)
      }
    })
  }

  public add(layers?: string | BaseLayer): void {
    if (layers) {
      const newLayers = Array.isArray(layers) ? layers : [layers]

      for (const layer of newLayers) {
        if (this.#layers.has(layer)) {
          console.warn(`Layer ${layer} already exists. Set other label for new layer`)
          continue
        }
        const targetLayer = layer instanceof BaseLayer ? layer : new BaseLayer({ label: layer })
        const targetLayerName = layer instanceof BaseLayer ? layer.label : layer

        this.#layers.set(targetLayerName, targetLayer)
        this.#root.addChild(layer)
      }
    } else {
      console.warn('Layer addition without layer label restricted. Set correct layer name')
    }
  }

  public getLayerByName(name?: string): Container {
    if (!name) return this.#noopLayer()

    const layer = this.#layers.get(name)

    if (!layer) return this.#noopLayer()

    return layer
  }

  #moveLayer(subLayerName: string, staticLayerName: string, offset: number) {
    const subLayer = this.getLayerByName(subLayerName)
    const staticLayer = this.getLayerByName(staticLayerName)

    if (!subLayer || !staticLayer) return

    const staticLayerIndex = this.#root.getChildIndex(staticLayer)
    const newSubLayerIndex = staticLayerIndex - offset

    const clampedIndex = Math.max(0, Math.min(this.#root.children.length - 1, newSubLayerIndex))

    this.#root.setChildIndex(subLayer, clampedIndex)
  }

  public moveLayerAbove(subLayerName: string, staticLayerName: string): void {
    this.#moveLayer(subLayerName, staticLayerName, 0)
  }
  public moveLayerBelow(subLayerName: string, staticLayerName: string): void {
    this.#moveLayer(subLayerName, staticLayerName, -1)
  }

  setDebugArea(name?: string): void {
    if (name) {
      const layer = this.getLayerByName(name)
      console.log('set debug: ', name)
      this.updateDebugArea(layer)
    }
  }

  updateDebugArea(layer: Container): void {
    console.log(layer.getBounds())

    const { x, y, width, height } = layer.getBounds()

    if (!width || !height) return

    const activeDebugZone = layer.getChildByLabel('debug') as Graphics

    const drawRect = (debugElement: Graphics) => {
      debugElement
        .rect(-width / 2, -height / 2, width, height)
        .stroke({ width: 1, color: 0xffff73 })
        .fill({ color: 0x0000ff, alpha: 0.5 })
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

  public remove(layers?: string): void {
    if (layers) {
      const target = Array.isArray(layers) ? layers : [layers]

      for (const layer of target) {
        this.#layers.delete(layer)
      }
      this.#root.removeChild(...target)
    }
  }

  resize(size: RectangleSize) {
    this.#layers.values().forEach((layer) => {
      layer.resize(size)
    })
  }
}
