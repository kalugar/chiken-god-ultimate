import { BaseScreen } from '@services/service.screens'

export default class PauseMenuScreen extends BaseScreen {
  constructor(label: string) {
    super(label)
    this.view.eventMode = 'static'
  }
  public init(): void {}
}
