import type { SceneConfig } from '@app-types'

import {
  createDefaultEnemy,
  createDefaultPlayer,
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
      Stats: { hp: 200, speed: 0.25 },
      Weapon: { ...createDefaultWeapon(), fireRate: 120 },
      Collider: { radius: 25 },
      View: {
        texture: 'player_idle/0',
        alpha: 0.89,
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
      LifeTime: { value: 650 },
      View: {
        type: 'graphics',
        parent: 'bulletPool',
        radius: 3,
        fill: {
          color: 0xff_00_00
        }
      }
    }
  }
} satisfies SceneConfig
