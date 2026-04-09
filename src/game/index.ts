import type { SystemDispatcher } from '@ecs/dispatcher'

import { SystemPipeline } from '@ecs/system.pipeline'
import CameraService from '@services/service.camera'
import FactoryService from '@services/service.factory'
import PoolService from '@services/service.object.pool'
import RegistryService from '@services/service.registry'
import ResizeService from '@services/service.resize'
import { SceneService } from '@services/service.scenes'
import LayersService from '@services/sevice.layers'
import { Assets } from 'pixi.js'

import levelConfig from './config/game.config'
import { ScenePipeline, type ScenePipelineConfig } from './config/scene.pipeline'
import manifest from './manifest.json'

async function assetsProcessor() {
  await Assets.init({ manifest })
  const bundleIds = manifest.bundles.map((bundle) => bundle.name)

  await Assets.loadBundle(bundleIds, (progress) => {
    console.log(`Загрузка ресурсов: ${Math.floor(progress * 100)}%`)
  })

  await document.fonts.ready
}

export async function startLevel(game: SystemDispatcher) {
  console.log(manifest)
  await assetsProcessor()
  // scenesProcessor()

  const scenes = game.services.get(SceneService)
  const factory = game.services.get(FactoryService)
  const registry = game.services.get(RegistryService)
  const pools = game.services.get(PoolService)
  const layers = game.services.get(LayersService)

  for (const settings of ScenePipeline) {
    const { label, layer, Class } = settings
    if (!Class) {
      console.warn(`[SceneService: addScenes] Для сцены ${label} не зарегистровал класс.`)
      continue
    }
    const scene = new Class(label, registry, pools)
    layers.getLayerByLabel(layer).addChild(scene.view)
    scenes.addScene(scene)
  }

  const scene = scenes.getActiveScene()
  factory.loadScene(scene, levelConfig)

  for (const SystemClass of SystemPipeline) {
    game.addSystem(new SystemClass())
  }

  game.services.get(ResizeService).requestResize()

  const player = registry.getEntityByTag('player')
  const camera = game.services.get(CameraService)

  console.log(scene)
  console.log(player)
  console.log(camera)
  if (player && camera) {
    const playerTransform = player.require('Transform')
    camera.focus(playerTransform)
  }
}
