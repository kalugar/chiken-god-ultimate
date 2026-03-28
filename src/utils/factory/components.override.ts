import type { PrefabConfig, SpawnOverrides } from '@app-types'
import type { Entity } from '@ecs/entity'
import type { Container } from 'pixi.js'

import { DefaultTransform, type TransformData } from '@ecs/components'

const applyTransformOverrides = (
  entity: Entity,
  config: PrefabConfig,
  overrides?: SpawnOverrides
): TransformData => {
  if (!entity.has('Transform')) return DefaultTransform

  const transform = entity.get('Transform')!

  if (overrides?.x !== undefined) transform.x = overrides.x
  else if (config.x !== undefined) transform.x = config.x

  if (overrides?.y !== undefined) transform.y = overrides.y
  else if (config.y !== undefined) transform.y = config.y

  if (overrides?.rotation !== undefined) transform.rotation = overrides.rotation
  else if (config.rotation !== undefined) transform.rotation = config.rotation

  return transform
}

const applyVelocityOverrides = (
  entity: Entity,
  config: PrefabConfig,
  overrides?: SpawnOverrides
): void => {
  if (!entity.has('Velocity')) return

  const velocity = entity.get('Velocity')!

  if (overrides?.vx !== undefined) velocity.vx = overrides.vx
  else if (config.vx !== undefined) velocity.vx = config.vx
  if (overrides?.vy !== undefined) velocity.vy = overrides.vy
  else if (config.vy !== undefined) velocity.vy = config.vy
}

const applyStatsOverrides = (
  entity: Entity,
  config: PrefabConfig,
  overrides?: SpawnOverrides
): void => {
  if (!entity.has('Stats')) return
  
  const stats = entity.get('Stats')!

  if (overrides?.speed !== undefined) stats.speed = overrides.speed
  else if (config.speed !== undefined) stats.speed = config.speed
}

const applyHealthOverrides = (
  entity: Entity,
  config: PrefabConfig,
  overrides?: SpawnOverrides
): void => {
  if (!entity.has('Health') || config.hp === undefined) return

  const health = entity.get('Health')!
  if (overrides?.hp !== undefined) {
    health.max = overrides.hp
    health.current = overrides.hp
  }
  else if (config.hp !== undefined) {
    health.max = config.hp
    health.current = config.hp
  }
}

const applyViewOverrides = (
  entity: Entity,
  transform: TransformData,
  viewNode?: Container | null,
  poolId?: string
): void => {
  if (!entity.has('View') || !viewNode) return

  const view = entity.get('View')!
  view.node = viewNode
  view.poolId = poolId

  viewNode.x = transform.x ?? 0
  viewNode.y = transform.y ?? 0
}

export const overrideComponentData = (
  entity: Entity,
  config: PrefabConfig,
  overrides?: SpawnOverrides,
  viewNode?: Container | null,
  poolId?: string
): void => {
  const transform = applyTransformOverrides(entity, config, overrides)
  applyVelocityOverrides(entity, config, overrides)
  applyStatsOverrides(entity, config, overrides)
  applyHealthOverrides(entity, config, overrides)
  applyViewOverrides(entity, transform, viewNode, poolId)
}
