// import { getNWayDirection } from '@utils/get.n.way.direction'
import { snapToNWay } from '@utils/snap.to.8.way'

import type { Entity } from '../entity'

import { System } from './system'

export class PlayerCombatSystem extends System {
  constructor() {
    super(['Player', 'Weapon'])
  }

  protected update(delta: number, entity: Entity): void {
    const player = entity.get('Player')!
    const weapon = entity.get('Weapon')!

    // === ПРОВЕРКА СТАТУСОВ ===
    // Здесь в будущем добавить: if (entity.has('Stunned')) { weapon.isFiring = false; return; }

    weapon.isFiring = player.intentFire

    const snappedVector = snapToNWay(16, player.aimX, player.aimY)
    weapon.aimX = snappedVector.x
    weapon.aimY = snappedVector.y
  }
}
