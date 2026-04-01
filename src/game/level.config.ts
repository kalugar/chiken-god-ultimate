import type { SceneConfig } from '@app-types'

import { DefaultWeapon } from '@ecs/components'
import { ComponentMask } from '@ecs/components/component.mask'
import { getComponentsMask } from '@ecs/components/components.map'

export default {
  player: {
    components: getComponentsMask('player'),
    layer: 'world',
    colliderRadius: 0,
    weapon: {
      ...DefaultWeapon,
      fireRate: 16.7
    },
    stats: {
      hp: 200,
      speed: 0.25
    },
    view: {
      texture: 'player_idle/0',
      alpha: 0.89,
      scale: 0.5,
      zIndex: 10
    }
  },
  enemiesPool: {
    view: {
      type: 'container'
    }
  },
  enemy: {
    components: getComponentsMask('enemy'),
    layer: 'world',
    poolSize: 200,
    x: 0,
    y: 0,
    view: {
      type: 'graphics',
      parent: 'enemiesPool',
      width: 25,
      height: 25,
      fill: {
        color: 'yellow'
      }
    }
  },
  bulletsPool: {
    view: {
      type: 'container',
      zIndex: 1
    }
  },
  bullet: {
    components: getComponentsMask('dynamic') | ComponentMask.LifeTime,
    layer: 'world',
    poolSize: 400,
    x: 0,
    y: 0,
    lifeTime: 650,
    view: {
      type: 'graphics',
      parent: 'bulletsPool',
      radius: 3,
      fill: {
        color: 0xff_00_00
        // alpha: 0.75
      }
    }
  }
} satisfies SceneConfig
