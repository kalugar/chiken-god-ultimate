import type Service from './service.interface'

export class BaseService implements Service {
  public readonly name: string
  public registered: boolean = false

  constructor(name: string) {
    this.name = name
  }
}
