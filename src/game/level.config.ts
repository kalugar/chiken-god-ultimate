import type { SceneConfig } from '@app-types'

import {
  createDefaultDash,
  createDefaultEnemy,
  createDefaultHealth,
  createDefaultMana,
  createDefaultMovementSpeed,
  createDefaultPlayer,
  createDefaultShield,
  createDefaultStamina,
  createDefaultTransform,
  createDefaultVelocity,
  createDefaultWeapon
} from '@ecs/components'

export default {
  player: {
    layer: 'world',
    components: {
      Player: createDefaultPlayer(),
      Transform: createDefaultTransform(),
      Velocity: createDefaultVelocity(),
      Health: createDefaultHealth(),
      MovementSpeed: {
        ...createDefaultMovementSpeed(),
        acceleration: 500,
        deceleration: 2000
      },
      Mana: createDefaultMana(),
      Stamina: createDefaultStamina(),
      Shield: createDefaultShield(),
      Dash: createDefaultDash(),
      Weapon: {
        ...createDefaultWeapon(),
        fireRate: 0.06,
        bulletSpeed: 600
      },
      Collider: { radius: 25 },
      View: {
        texture: 'player_idle/0',
        scale: 0.5,
        zIndex: 10
      }
    }
  },
  enemyPool: {
    layer: 'world',
    components: {
      View: {
        type: 'container',
        zIndex: 1
      }
    }
  },
  enemy: {
    poolSize: 200,
    components: {
      Enemy: createDefaultEnemy(),
      Transform: createDefaultTransform(),
      Velocity: createDefaultVelocity(),
      Health: createDefaultHealth(),
      MovementSpeed: createDefaultMovementSpeed(),
      View: {
        type: 'graphics',
        parent: 'enemyPool',
        width: 25,
        height: 25,
        fill: {
          color: 'yellow'
        }
      }
    }
  },
  bulletPool: {
    layer: 'world',
    components: {
      View: {
        type: 'container',
        zIndex: 1
      }
    }
  },
  bullet: {
    poolSize: 400,
    components: {
      Transform: createDefaultTransform(),
      Velocity: createDefaultVelocity(),
      LifeTime: { value: 1.5 },
      View: {
        type: 'graphics',
        parent: 'bulletPool',
        radius: 3,
        fill: {
          color: 0x00_00_ff
        }
      }
    }
  },
  score: {
    components: {
      View: {
        text: 'Hello Pixi',
        style: {
          fontFamily: 'PowerofDragon',
          fontSize: 128,
          fill: 0xff_10_10,
          align: 'center'
        }
      }
    }
  }
} satisfies SceneConfig
