import type { PrefabConfig } from '@app-types'

import { Container, Ticker } from 'pixi.js'

import PoolService from './service.object.pool'
import RegistryService from './service.registry'

export interface SceneContext {
  registry: RegistryService // Реестр конкретной сцены
  pools: PoolService // Пулы конкретной сцены
  view: Container // Корневой контейнер сцены
  refs: Map<string, Container> // Локальные слои/контейнеры сцены
  schemas: Map<string, PrefabConfig> //префабы(конфиги) спрайтов
}

export abstract class BaseScene implements SceneContext {
  public view: Container
  public refs = new Map<string, Container>()
  public schemas = new Map<string, PrefabConfig>()

  constructor(
    private label: string,
    public registry: RegistryService,
    public pools: PoolService
  ) {
    this.view = new Container({ label: this.label })
  }

  // 1. Загрузка ресурсов (ассетов) для конкретной сцены
  public abstract load(): Promise<void>

  // 2. Инициализация (создание UI, запуск ECS, если это игра)
  public abstract init(): void

  // 3. Анимация появления (fadeIn, всплытие попапа)
  public async show(): Promise<void> {
    return new Promise((resolve, _reject) => {
      this.view.alpha = 1 // По умолчанию просто показываем
      this.view.visible = true
      resolve()
    })
  }

  // 4. Анимация исчезновения (fadeOut, закрытие попапа)
  public async hide(): Promise<void> {
    return new Promise((resolve, _reject) => {
      this.view.alpha = 0
      this.view.visible = false
      resolve()
    })
  }

  // 5. Игровой цикл (вызывается каждый кадр)
  public update(_delta: number): void {}

  // 6. Очистка памяти (остановка ECS, удаление текстур)
  public abstract destroy(): void
}

export class SceneService {
  // Контейнер, который мы добавим на stage (в PixiJS)
  public readonly view = new Container()

  // Стек активных сцен. Последняя в массиве — текущая активная.
  private scenes: BaseScene[] = []
  private isTransitioning = false

  constructor() {
    // Подключаем апдейт активной сцены к тикеру Pixi
    // TODO:  временная заглушка, далее подключить к gameLoop, или если это UI
    // Ticker.shared.add((ticker) => {
    //   const activeScene = this.getActiveScene()
    //   if (activeScene && !this.isTransitioning) {
    //     activeScene.update(ticker.deltaTime)
    //   }
    // })
  }

  // TODO:  продумать загрузку и организацию сцен
  addScene(scene: BaseScene): void {
    this.scenes.push(scene)
  }

  public getActiveScene(): BaseScene {
    if (this.scenes.length === 0) {
      throw new Error(
        '[SceneService: getActiveScene] вы пытаетесь получить доступ к активной сцене раньше, чем она создана. Список сцен пуст'
      )
    }
    return this.scenes.at(-1)!
  }

  // === ПЕРЕКЛЮЧЕНИЕ СЦЕН (СМЕРТЬ СТАРОЙ, РОЖДЕНИЕ НОВОЙ) ===
  public async switchScene(newScene: BaseScene): Promise<void> {
    if (this.isTransitioning) return
    this.isTransitioning = true

    const oldScene = this.getActiveScene()

    // 1. Прячем старую сцену (fadeOut)
    if (oldScene) {
      await oldScene.hide()
      this.view.removeChild(oldScene.view)
      oldScene.destroy() // Убиваем старую сцену
    }

    // Очищаем стек (это ведь полное переключение)
    this.scenes = [newScene]

    // 2. Грузим и готовим новую
    this.view.addChild(newScene.view)
    newScene.view.visible = false // Прячем до окончания загрузки

    await newScene.load()
    newScene.init()

    // 3. Показываем новую (fadeIn)
    await newScene.show()

    this.isTransitioning = false
  }

  // === ПОПАПЫ И НАЛОЖЕНИЯ (СТАВИМ ИГРУ НА ПАУЗУ) ===
  public async rollup(overlayScene: BaseScene): Promise<void> {
    if (this.isTransitioning) return
    this.isTransitioning = true

    // ВАЖНО: Мы НЕ удаляем старую сцену, просто перестаем вызывать ее update()
    // так как update() вызывается только для getActiveScene() (верхней в стеке)

    this.scenes.push(overlayScene)
    this.view.addChild(overlayScene.view)

    overlayScene.view.visible = false
    await overlayScene.load()
    overlayScene.init()
    await overlayScene.show() // Например, анимация выезда снизу вверх

    this.isTransitioning = false
  }

  // === ЗАКРЫТИЕ ПОПАПА (ВОЗВРАТ К ИГРЕ) ===
  public async rolldown(): Promise<void> {
    if (this.isTransitioning || this.scenes.length <= 1) return
    this.isTransitioning = true

    const overlayScene = this.scenes.pop()!

    // 1. Анимация закрытия
    await overlayScene.hide()

    // 2. Уничтожение попапа
    this.view.removeChild(overlayScene.view)
    overlayScene.destroy()

    this.isTransitioning = false
  }
}
