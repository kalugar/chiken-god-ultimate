import type { SystemOrchestrator } from '@ecs/orchestrator'

import { SystemPipeline } from '@ecs/system.pipeline'
import CameraService from '@services/service.camera'
import FactoryService from '@services/service.factory'
import RegistryService from '@services/service.registry'
import ResizeService from '@services/service.resize'
import { Assets } from 'pixi.js'

import levelConfig from './level.config'
import manifest from './manifest.json'

async function assetsProcessor() {
  await Assets.init({ manifest })
  const bundleIds = manifest.bundles.map((bundle) => bundle.name)

  await Assets.loadBundle(bundleIds, (progress) => {
    console.log(`Загрузка ресурсов: ${Math.floor(progress * 100)}%`)
  })

  await document.fonts.ready
}

export async function startLevel(game: SystemOrchestrator) {
  console.log(manifest)
  await assetsProcessor()

  for (const SystemClass of SystemPipeline) {
    game.addSystem(new SystemClass())
  }
  game.services.get(ResizeService).requestResize()

  const factory = game.services.get(FactoryService)

  factory.loadScene(levelConfig)

  const registry = game.services.get(RegistryService)

  const player = registry.getEntityByTag('player')
  const camera = game.services.get(CameraService)

  if (player && camera) {
    const playerTransform = player.require('Transform')
    camera.focus(playerTransform)
  }
}
