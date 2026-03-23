export default {
  player: {
    type: 'player',
    hp: 200,
    x: 200,
    y: 600,
    view: {
      type: 'sprite',
      texture: 'bunny',
      alpha: 0.89,
      scale: 1.2,
    }
  },
  enemy: {
    type: 'enemy',
    poolSize: 200,
    x: 0,
    y: 0,
    view: {
      type: 'graphics'
    }
  },
  bulletsPool :{
    type: 'dynamic',
    poolSize: 400,
    view: {
      type: 'graphics'
    }
  }
}