import { Container, Texture } from 'pixi.js'
import { World } from '@ecs/world'
import { Entity } from '@ecs/entity'
import { ObjectPool } from '@utils/ecs/object.pool'

// 1. СТРОГАЯ КАРТА АРГУМЕНТОВ
// Здесь мы описываем, что нужно передать для создания каждого типа
export type EntityArgs = {
  player: { x: number; y: number }
  enemy: { x: number; y: number; speed?: number }
  bullet: { x: number; y: number; dirX: number; dirY: number; speed: number }
}

// 2. КОНТЕКСТ ФАБРИКИ
// Это то, что передается в каждый чертеж, чтобы он мог работать с миром и пулами
export interface FactoryContext {
  world: World
  gameLayer: Container
  textures: Record<string, Texture>
  // Динамическое хранилище пулов (чтобы чертежи могли класть туда свои пулы)
  pools: Record<string, ObjectPool<any>>
}

// 3. ТИП "ЧЕРТЕЖА" (Assembler)
// Функция, которая берет контекст, аргументы и собирает Entity
export type Assembler<K extends keyof EntityArgs> = (
  ctx: FactoryContext,
  args: EntityArgs[K]
) => Entity | null
