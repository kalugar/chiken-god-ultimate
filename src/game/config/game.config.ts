import type { SceneConfig } from '@app-types'

import { defaultComponentRegistry as components } from '@ecs/components'

export default {
  level: {
    entities: {
      player: {
        components: {
          Player: true,
          Transform: true,
          Velocity: true,
          Health: true,
          Mana: true,
          Stamina: true,
          Shield: true,
          Dash: true,
          MovementSpeed: {
            ...components.MovementSpeed(),
            acceleration: 500,
            deceleration: 2000
          },
          Weapon: {
            ...components.Weapon(),
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
          Enemy: true,
          Transform: true,
          Velocity: true,
          Health: true,
          MovementSpeed: true,
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
        poolSize: 800,
        components: {
          Transform: true,
          Velocity: true,
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
      }
    },
    ui: {
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
    }
  }
  // reward: {
  //   button: {},
  //   particles: {
  //     layer: 'modals',
  //     components: {
  //       View: {}
  //     }
  //   }
  // }
}
