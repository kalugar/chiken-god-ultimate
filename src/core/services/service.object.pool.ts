import type { ObjectPool } from '@core/utils/factory.object.pool'
import type { Container } from 'pixi.js'

export default class PoolService {
  private pools = new Map<string, ObjectPool<Container>>()

  public register(poolLabel: string | Container, pool: ObjectPool<Container>): void {
    this.pools.set(typeof poolLabel === 'string' ? poolLabel : poolLabel.label, pool)
  }

  public has(poolLabel: string | Container): boolean {
    return this.pools.has(typeof poolLabel === 'string' ? poolLabel : poolLabel.label)
  }

  public get(id: string): Container | null {
    const pool = this.pools.get(id)
    return pool ? pool.get() : null
  }

  public release(id: string, node: Container): void {
    const pool = this.pools.get(id)
    if (pool) {
      pool.release(node)
    } else {
      console.warn(`[PoolService] Попытка вернуть ноду в несуществующий пул: ${id}`)
    }
  }

  public clearAll(): void {
    this.pools.clear()
  }
}
