import type { World } from '@ecs/world'

import { MovementSystem, RenderSystem, InputSystem } from '@ecs/systems'
import { LifeTimeSystem } from '@ecs/systems/lifetime.system'
import { PlayerCombatSystem } from '@ecs/systems/player.combat.system'
import { PlayerLocomotionSystem } from '@ecs/systems/player.locomotion.system'
import { WeaponSystem } from '@ecs/systems/weapon.system'
import FactoryService from '@services/service.factory'
import ResizeService from '@services/service.resize'
import { Assets, Spritesheet } from 'pixi.js'

import levelConfig from './level.config'

export async function startLevel(world: World) {
  await Assets.load<Spritesheet>('assets/atlas/player_idle.json')

  world.addSystem(new InputSystem())
  world.addSystem(new PlayerLocomotionSystem())
  world.addSystem(new MovementSystem())
  world.addSystem(new PlayerCombatSystem())
  world.addSystem(new WeaponSystem())
  // world.addSystem(new BoundsSystem())
  world.addSystem(new LifeTimeSystem(world.destroyEntity.bind(world)))
  // world.addSystem(new CollisionSystem(world)) // Проверяем столкновения
  // world.addSystem(new LifespanSystem(world));     // Убиваем старые пули
  world.addSystem(new RenderSystem())

  world.services.get(ResizeService).resize()

  const factory = world.services.get(FactoryService)

  factory.loadScene(levelConfig)
}
