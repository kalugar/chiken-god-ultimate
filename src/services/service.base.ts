import type Service from './service'

export class BaseService implements Service {
  public readonly label: string
  public registered: boolean = false

  constructor(label: string) {
    this.label = label
  }
}
