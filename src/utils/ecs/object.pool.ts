export class ObjectPool<T> {
  private pool: T[] = []
  private createFn: () => T
  private resetFn?: (obj: T) => void

  /**
   * @param createFn Функция создания нового объекта (вызывается при нехватке или преаллокации)
   * @param resetFn Функция сброса состояния (вызывается при возврате в пул)
   * @param initialSize Сколько объектов создать заранее при старте игры
   */
  constructor(createFn: () => T, resetFn?: (obj: T) => void, initialSize: number = 0) {
    this.createFn = createFn
    this.resetFn = resetFn

    // Преаллокация: создаем объекты до начала игры
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn())
    }
  }

  public get(): T {
    // Если пул пуст - создаем новый (динамическое расширение), иначе берем готовый
    return this.pool.length > 0 ? this.pool.pop()! : this.createFn()
  }

  public release(obj: T): void {
    if (this.resetFn) {
      this.resetFn(obj)
    }
    this.pool.push(obj)
  }
}
