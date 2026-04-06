import type { World } from '@ecs/world'

import { MovementSystem, RenderSystem, InputSystem } from '@ecs/systems'
import { DashSystem } from '@ecs/systems/dash.system'
import { LifeTimeSystem } from '@ecs/systems/lifetime.system'
import { PlayerCombatSystem } from '@ecs/systems/player.combat.system'
import { PlayerLocomotionSystem } from '@ecs/systems/player.locomotion.system'
import { WeaponSystem } from '@ecs/systems/weapon.system'
import CameraService from '@services/service.camera'
import FactoryService from '@services/service.factory'
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

export async function startLevel(world: World) {
  console.log(manifest)
  await assetsProcessor()

  world.addSystem(new InputSystem())
  world.addSystem(new PlayerLocomotionSystem())
  world.addSystem(new DashSystem())
  world.addSystem(new MovementSystem())
  world.addSystem(new PlayerCombatSystem())
  world.addSystem(new WeaponSystem())
  // world.addSystem(new BoundsSystem())
  world.addSystem(new LifeTimeSystem(world.destroyEntity.bind(world)))
  // world.addSystem(new CollisionSystem(world)) // Проверяем столкновения
  // world.addSystem(new LifespanSystem(world));     // Убиваем старые пули
  world.addSystem(new RenderSystem())

  world.services.get(ResizeService).requestResize()

  const factory = world.services.get(FactoryService)

  factory.loadScene(levelConfig)

  const player = world.getEntityByTag('player')!
  const playerTransform = player.get('Transform')!

  const camera = world.services.get(CameraService)

  camera.focus(playerTransform)
}
