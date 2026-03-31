import type { PrefabConfig, SpawnOverrides } from '@app-types'
import type { Entity } from '@ecs/entity'
import type { Container } from 'pixi.js'

import { DefaultTransform, type TransformData } from '@ecs/components'

import { normalizeStat } from './normalize.stat'

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

  if (targetX !== undefined) transform.x = targetX
  if (targetY !== undefined) transform.y = targetY
  if (targetRotation !== undefined) transform.rotation = targetRotation

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

  if (targetVelocityX !== undefined) velocity.vx = targetVelocityX
  if (targetVelocityY !== undefined) velocity.vy = targetVelocityY
}

const applyLifeTimeOverrides = (
  entity: Entity,
  config: PrefabConfig,
  overrides?: SpawnOverrides
): void => {
  if (!entity.has('LifeTime')) return

  const velocity = entity.get('LifeTime')!

  const targetLifeTime = overrides?.lifeTime ?? config.lifeTime

  if (targetLifeTime !== undefined) velocity.lifeTime = targetLifeTime
}

const applyColliderOverrides = (
  entity: Entity,
  config: PrefabConfig,
  overrides?: SpawnOverrides
): void => {
  if (!entity.has('Collider')) return

  const velocity = entity.get('Collider')!

  const targetColliderRadius = overrides?.colliderRadius ?? config.colliderRadius

  if (targetColliderRadius !== undefined) velocity.colliderRadius = targetColliderRadius
}

const applyStatsOverrides = (
  entity: Entity,
  config: PrefabConfig,
  overrides?: SpawnOverrides
): void => {
  if (!entity.has('Stats')) return

  const stats = entity.get('Stats')!

  const overStats = overrides?.stats
  const confStats = config?.stats

  const targetSpeed = overStats?.speed ?? confStats?.speed
  const targetHp = overStats?.hp ?? confStats?.hp
  const targetMp = overStats?.mp ?? confStats?.mp
  const targetStamina = overStats?.stamina ?? confStats?.stamina
  const targetShield = overStats?.shield ?? confStats?.shield

  if (targetSpeed !== undefined) stats.speed = targetSpeed
  if (targetHp !== undefined) stats.hp = normalizeStat(targetHp)
  if (targetMp !== undefined) stats.mp = normalizeStat(targetMp)
  if (targetStamina !== undefined) stats.stamina = normalizeStat(targetStamina)
  if (targetShield !== undefined) stats.shield = normalizeStat(targetShield)
}
const applyWeaponOverrides = (
  entity: Entity,
  config: PrefabConfig,
  overrides?: SpawnOverrides
): void => {
  if (!entity.has('Weapon')) return

  const stats = entity.get('Weapon')!

  const overWeapon = overrides?.weapon
  const confWeapon = config?.weapon

  const targetisFiring = overWeapon?.isFiring ?? confWeapon?.isFiring
  const targetFireRate = overWeapon?.fireRate ?? confWeapon?.fireRate
  const targetCooldownTimer = overWeapon?.cooldownTimer ?? confWeapon?.cooldownTimer
  const targetAimX = overWeapon?.aimX ?? confWeapon?.aimX
  const targetAimY = overWeapon?.aimY ?? confWeapon?.aimY

  if (targetisFiring !== undefined) stats.isFiring = targetisFiring
  if (targetFireRate !== undefined) stats.fireRate = targetFireRate
  if (targetCooldownTimer !== undefined) stats.cooldownTimer = targetCooldownTimer
  if (targetAimX !== undefined) stats.aimX = targetAimX
  if (targetAimY !== undefined) stats.aimY = targetAimY
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
  applyLifeTimeOverrides(entity, config, overrides)
  applyColliderOverrides(entity, config, overrides)
  applyWeaponOverrides(entity, config, overrides)
  applyViewOverrides(entity, transform, viewNode, poolId)
}
