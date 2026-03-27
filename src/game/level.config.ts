import type { SceneConfig } from '@app-types'

import { getComponentsMask } from '@ecs/components/components.map'

export default {
  player: {
    components: getComponentsMask('player'),
    layer: 'world',
    hp: 200,
    x: 100,
    y: 100,
    view: {
      texture: 'bunny',
      alpha: 0.89,
      scale: 1.2
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
      type: 'container'
    }
  },
  bullet: {
    components: getComponentsMask('dynamic'),
    layer: 'world',
    poolSize: 400,
    x: 0,
    y: 0,
    view: {
      type: 'graphics',
      parent: 'bulletsPool',
      radius: 5,
      fill: {
        color: 0xff_00_00,
        alpha: 0.75
      }
    }
  }
} satisfies SceneConfig
