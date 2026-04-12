import { BaseScreen } from '@core/services/service.screen.state'

export default class TooltipsScreen extends BaseScreen {
  constructor(label: string) {
    super(label)
    this.view.eventMode = 'static'
  }
  public init(): void {}
}
