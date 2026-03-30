import type { Container } from 'pixi.js'

import { ObjectPool } from '@utils/object.pool'

import { BaseService } from './service.base'

export class PoolManager extends BaseService {
  private static pools = new Map<string, ObjectPool<Container>>()

  public static register(poolLabel: string | Container, pool: ObjectPool<Container>) {
    this.pools.set(typeof poolLabel === 'string' ? poolLabel : poolLabel.label, pool)
  }

  public static has(poolLabel: string | Container): boolean {
    return this.pools.has(typeof poolLabel === 'string' ? poolLabel : poolLabel.label)
  }

  public static get(id: string): Container | null {
    const pool = this.pools.get(id)
    return pool ? pool.get() : null
  }

  public static release(id: string, node: Container) {
    const pool = this.pools.get(id)
    if (pool) {
      pool.release(node)
    } else {
      node.removeFromParent()
      node.destroy()
    }
  }

  public static clearAll() {
    this.pools.clear()
  }
}
