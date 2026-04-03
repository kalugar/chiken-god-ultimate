import type { Entity } from '../entity'

import { System } from './system'

export class PlayerCombatSystem extends System {
  constructor() {
    // Нас интересует игрок, у которого есть оружие и координаты
    super(['Player', 'Weapon'])
  }

  protected update(delta: number, entity: Entity): void {
    const player = entity.get('Player')!
    const weapon = entity.get('Weapon')!

    // === ПРОВЕРКА СТАТУСОВ ===
    // Здесь в будущем ты добавишь: if (entity.has('Stunned')) { weapon.isFiring = false; return; }

    // Передаем команду "Огонь!" в оружие
    weapon.isFiring = player.intentFire

    weapon.aimX = player.aimX
    weapon.aimY = player.aimY
  }
}
