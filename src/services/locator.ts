import type { RectangleSize, ServiceToken } from '@app-types'

export class ServiceLocator {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private services: Map<ServiceToken, any> = new Map()

  /**
   * Регистрирует экземпляр службы.
   * @param token Класс (токен), по которому будем искать
   * @param instance Сам объект службы
   */
  public register<T>(token: ServiceToken<T>, instance: T): void {
    if (this.services.has(token)) {
      console.warn(`[ServiceLocator] Служба ${token.name} уже зарегистрирована. Перезаписываем.`)
    }
    this.services.set(token, instance)
  }

  public get<T>(token: ServiceToken<T>): T {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const service = this.services.get(token)

    if (!service) {
      throw new Error(
        `[ServiceLocator] Служба ${token.name} не найдена! Вы забыли её зарегистрировать?`
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return service
  }

  public has<T>(token: ServiceToken<T>): boolean {
    return this.services.has(token)
  }

  public refuse<T>(token: ServiceToken<T>): void {
    this.services.delete(token)
  }

  public clear(): void {
    this.services.clear()
  }

  public resize(_newSize: RectangleSize): void {}
}
