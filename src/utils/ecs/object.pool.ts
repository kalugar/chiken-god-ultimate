import type { ViewContainer } from "pixi.js"

export class ObjectPool {
  private pool: ViewContainer[] = []
  private createFn: () => ViewContainer
  private resetFn?: (obj: ViewContainer) => void

  /**
   * @param createFn Функция создания нового объекта (вызывается при нехватке или преаллокации)
   * @param resetFn Функция сброса состояния (вызывается при возврате в пул)
   * @param initialSize Сколько объектов создать заранее при старте игры
   */
  constructor(createFn: () => ViewContainer, resetFn?: (obj: ViewContainer) => void, initialSize: number = 0) {
    this.createFn = createFn
    this.resetFn = resetFn

    // Преаллокация: создаем объекты до начала игры
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn())
    }
  }

  public get(): ViewContainer {
    // Если пул пуст - создаем новый (динамическое расширение), иначе берем готовый
    return this.pool.length > 0 ? this.pool.pop()! : this.createFn()
  }

  public release(obj: ViewContainer): void {
    if (this.resetFn) {
      this.resetFn(obj)
    }
    this.pool.push(obj)
  }
}
