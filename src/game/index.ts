import type { SystemDispatcher } from '@core/ecs/dispatcher'

import CameraService from '@core/services/service.camera'
import FactoryService from '@core/services/service.factory'
import PoolService from '@core/services/service.object.pool'
import RegistryService from '@core/services/service.registry'
import ResizeService from '@core/services/service.resize'
import ScreenService from '@core/services/service.screen.state'
import LayersService from '@core/services/sevice.layers'
import { SystemPipeline } from '@ecs/system.pipeline'
import { Assets } from 'pixi.js'

import levelConfig from './config/game.config'
import { ScenePipeline, type ScenePipelineConfig } from './config/screen.pipeline'
import LoadScreen from './screens/load.screen'
import manifest from './test/manifest.json'

async function assetsProcessor() {
  // await Assets.init({ manifest })
  // const bundleIds = manifest.bundles.map((bundle) => bundle.name)

  // await Assets.loadBundle(bundleIds, (progress) => {
  //   console.log(`Загрузка ресурсов: ${Math.floor(progress * 100)}%`)
  // })

  await document.fonts.ready
}

export async function startLevel(game: SystemDispatcher) {
  console.log(manifest)
  // await assetsProcessor()
  // scenesProcessor()

  const screens = game.services.get(ScreenService)
  const factory = game.services.get(FactoryService)
  const registry = game.services.get(RegistryService)
  const pools = game.services.get(PoolService)
  const layers = game.services.get(LayersService)

  // for (const settings of ScenePipeline) {
  //   const { label, layer, Class } = settings
  //   if (!Class) {
  //     console.warn(`[ScreenService: addScenes] Для сцены ${label} не зарегистровал класс.`)
  //     continue
  //   }
  //   const scene = new Class(label, registry, pools)
  //   layers.getLayerByLabel(layer).addChild(scene.view)
  //   scenes.addScene(scene)
  // }

  const loadingScreen = new LoadScreen('load')
  layers.getLayerByLabel('ui_top').addChild(loadingScreen.view)
  screens.inject(layers, loadingScreen)
  await screens.bootGame(manifest, ScenePipeline)

  // const scene = scenes.getActiveScene()
  // factory.loadScene(scene, levelConfig)

  // for (const SystemClass of SystemPipeline) {
  //   game.addSystem(new SystemClass())
  // }

  // game.services.get(ResizeService).requestResize()

  // const player = registry.getEntityByTag('player')
  // const camera = game.services.get(CameraService)

  // console.log(scene)
  // console.log(player)
  // console.log(camera)
  // if (player && camera) {
  //   const playerTransform = player.require('Transform')
  //   camera.focus(playerTransform)
  // }
}
