import InputService from '@services/services.input'

import type { Entity } from '../entity'

import { System } from './system'

export class InputSystem extends System {
  private dirX = 0
  private dirY = 0
  private isFiring = false
  private isSprint = false
  private mouseX = 0
  private mouseY = 0

  constructor() {
    super(['Player', 'Transform'])
  }
  public execute(delta: number): void {
    const input = this.services.get(InputService)

    this.dirX = 0
    this.dirY = 0
    if (input.isActionActive('up')) this.dirY -= 1
    if (input.isActionActive('down')) this.dirY += 1
    if (input.isActionActive('left')) this.dirX -= 1
    if (input.isActionActive('right')) this.dirX += 1

    if (this.dirX !== 0 && this.dirY !== 0) {
      const length = Math.hypot(this.dirX, this.dirY)
      this.dirX /= length
      this.dirY /= length
    }

    this.isFiring = input.isActionActive('fire')
    this.isSprint = input.isActionActive('sprint')
    this.mouseX = input.mouseX
    this.mouseY = input.mouseY

    super.execute(delta)
  }

  protected update(delta: number, entity: Entity): void {
    const player = entity.get('Player')!
    const transform = entity.get('Transform')!

    player.moveX = this.dirX
    player.moveY = this.dirY
    player.intentFire = this.isFiring
    player.intentSprint = this.isSprint

    const aimDx = this.mouseX - transform.x
    const aimDy = this.mouseY - transform.y
    const length = Math.hypot(aimDx, aimDy)

    if (length > 0) {
      player.aimX = aimDx / length
      player.aimY = aimDy / length
    }
  }
}
