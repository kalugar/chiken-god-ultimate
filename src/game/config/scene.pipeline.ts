import type PoolService from '@services/service.object.pool'
import type RegistryService from '@services/service.registry'
import type { BaseScene } from '@services/service.scenes'

import GameScene from '@game/scenes/game.scene'
import MainMenuScene from '@game/scenes/main.menu.scene'
import PauseMenuScene from '@game/scenes/pause.menu.scene'
import PreloadScene from '@game/scenes/preload.scene'
import TooltipsScene from '@game/scenes/tooltips.scene'

export type ScenePipelineConfig = {
  label: string
  layer: string
  Class?: new (label: string, registry: RegistryService, pools: PoolService) => BaseScene
}

export const ScenePipeline: ScenePipelineConfig[] = [
  // {
  //   label: 'preload',
  //   layer: 'background',
  //   Class: PreloadScene
  // },
  // {
  //   label: 'mainMenu',
  //   layer: 'ui_low',
  //   Class: MainMenuScene
  // },
  {
    label: 'game',
    layer: 'world',
    Class: GameScene
  }
  // {
  //   label: 'pauseMenu',
  //   layer: 'ui_top',
  //   Class: PauseMenuScene
  // },
  // {
  //   label: 'tooltip',
  //   layer: 'ui_top',
  //   Class: TooltipsScene
  // },
  // {
  //   label: 'reward',
  //   layer: 'fx',
  //   Class: undefined
  // }
]
