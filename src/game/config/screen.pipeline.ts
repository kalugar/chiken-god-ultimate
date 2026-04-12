import GameScreen from '@game/screens/game.screen'
import LoadScreen from '@game/screens/load.screen'
// import MainMenuScreen from '@game/screens/main.menu.screen'
// import PauseMenuScreen from '@game/screens/pause.menu.screen'
// import PreloadScreen from '@game/screens/preload.screen'
// import TooltipsScreen from '@game/screens/tooltips.screen'

import type { ScreenPipelineConfig } from '../../types/screen.types'

export const ScenePipeline: ScreenPipelineConfig[] = [
  // {
  //   label: 'preload',
  //   layer: 'background',
  //   Class: PreloadScreen
  // },
  {
    label: 'load',
    layer: 'background',
    Class: LoadScreen
  },
  // {
  //   label: 'mainMenu',
  //   layer: 'ui_low',
  //   Class: MainMenuScreen
  // },
  {
    label: 'game',
    layer: 'world',
    Class: GameScreen
  }
  // {
  //   label: 'pauseMenu',
  //   layer: 'ui_top',
  //   Class: PauseMenuScreen
  // },
  // {
  //   label: 'tooltip',
  //   layer: 'ui_top',
  //   Class: TooltipsScreen
  // },
  // {
  //   label: 'reward',
  //   layer: 'fx',
  //   Class: undefined
  // }
]
