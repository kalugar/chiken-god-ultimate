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

  const targetX = overrides?.x ?? config.x
  const targetY = overrides?.y ?? config.y
  const targetRotation = overrides?.rotation ?? config.rotation

  if (targetX) transform.x = targetX
  if (targetY) transform.y = targetY
  if (targetRotation) transform.rotation = targetRotation

  return transform
}

const applyVelocityOverrides = (
  entity: Entity,
  config: PrefabConfig,
  overrides?: SpawnOverrides
): void => {
  if (!entity.has('Velocity')) return

  const velocity = entity.get('Velocity')!

  const targetVelocityX = overrides?.vx ?? config.vx
  const targetVelocityY = overrides?.vy ?? config.vy

  if (targetVelocityX) velocity.vx = targetVelocityX
  if (targetVelocityY) velocity.vy = targetVelocityY
}

const applyStatsOverrides = (
  entity: Entity,
  config: PrefabConfig,
  overrides?: SpawnOverrides
): void => {
  if (!entity.has('Stats')) return

  const stats = entity.get('Stats')!

  const targetSpeed = overrides?.speed ?? config.speed

  if (targetSpeed) stats.speed = targetSpeed
}

const applyHealthOverrides = (
  entity: Entity,
  config: PrefabConfig,
  overrides?: SpawnOverrides
): void => {
  if (!entity.has('Health')) return
  const health = entity.get('Health')!

  const targetHealthCurrent = overrides?.hp ?? config.hp
  const targetHealthMax = overrides?.hp ?? config.hp

  if (targetHealthMax) health.max = targetHealthMax
  if (targetHealthCurrent) health.current = targetHealthCurrent
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
