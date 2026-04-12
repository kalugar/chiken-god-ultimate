import type { PrefabConfig } from '@core/types/factory.types'
import type LoadScreen from '@game/screens/load.screen'

import {
  Container,
  //  Ticker,
  Assets,
  type AssetsManifest,
  Sprite
} from 'pixi.js'

import type { Screen, ScreenPipelineConfig } from '../../types/screen.types'
import type LayersService from './sevice.layers'

export class BaseScreen implements Screen {
  public readonly view: Container
  public readonly refs = new Map<string, Container>()
  public readonly schemas = new Map<string, PrefabConfig>()

  constructor(public readonly label: string) {
    this.view = new Container({ label: this.label })
  }

  // === ЖИЗНЕННЫЙ ЦИКЛ (Опциональные хуки для переопределения) ===

  public init(): void {
    // Переопределите в наследнике для спавна сущностей и сборки UI
  }

  public enter(): void {
    // Переопределите в наследнике для запуска анимаций появления
  }

  public async exit(): Promise<void> {
    // Переопределите в наследнике для анимаций скрытия (fadeOut)
  }

  protected onDestroy(): void {
    // Переопределите в наследнике для очистки ECS (Registry) и отписки от эвентов
  }

  // === СИСТЕМНАЯ ЛОГИКА (Не переопределять без необходимости) ===

  public destroy(): void {
    // 1. Вызываем кастомную очистку наследника
    this.onDestroy()

    // 2. Чистим локальные словари
    this.refs.clear()
    this.schemas.clear()

    // 3. Безопасно уничтожаем графику Pixi
    if (!this.view.destroyed) {
      this.view.destroy({ children: true })
    }
  }
}

export default class ScreenStateService {
  private activeScreen: Screen | null = null
  private cachedOverlays: Map<string, Screen> = new Map()
  private readonly screensConfig: Map<string, ScreenPipelineConfig> = new Map()
  private inTransitioning: boolean = false

  private loadingScreen!: LoadScreen

  // Допустим, у нас есть простенький сервис для экрана загрузки
  // (он живет всегда в самом верхнем слое и просто включается/выключается)
  constructor(private layers: LayersService) {
    // Инициализируем мапу конфигов для быстрого поиска
  }
  public getActiveScreen(): Screen {
    if (!this.activeScreen) {
      throw new Error('[ScreenDirector] Активных сцен нет!')
    }
    return this.activeScreen
  }
  public inject(loadingScreen: LoadScreen) {
    this.loadingScreen = loadingScreen
  }
  /**
   * Самый первый запуск игры (вызывается в main.ts)
   */
  public async bootGame(manifest: AssetsManifest, pipeline: ScreenPipelineConfig[]): Promise<void> {
    for (const config of pipeline) {
      this.screensConfig.set(config.label, config)
    }
    // 1. Инициализируем манифест (сгенерированный Assetpack)
    await Assets.init({ manifest, basePath: 'assets' })

    // 2. Грузим самый легкий бандл для экрана загрузки (лого, шрифты)
    await Assets.loadBundle('loading')

    const logo = Sprite.from('logo_gold')
    logo.x = window.innerWidth / 2
    logo.y = window.innerHeight / 2
    logo.anchor = 0.5
    this.loadingScreen.view.addChild(logo)

    this.loadingScreen.show()

    await new Promise((res) => setTimeout(res, 1000))
    console.log(logo)
    // 3. Грузим общие элементы UI и Главное меню
    await Assets.loadBundle('shared', (progress) => {
      this.loadingScreen.updateProgress(progress)
    })

    await this.loadingScreen.awaitAnimation()

    await new Promise((res) => setTimeout(res, 1000))
    this.loadingScreen.hide()

    // 4. Запускаем сцену меню

    console.log('loadSCreen:', Assets)

    // await this.switchTo('game')
  }

  /**
   * Главный метод стейт-машины: Переход между сценами
   */
  public async switchTo(
    screenLabel: string,
    dynamicBundlesToLoad?: string[],
    dynamicBundlesToUnload?: string[]
  ): Promise<void> {
    if (this.inTransitioning) {
      console.warn(`[GameMachine] Переход на ${screenLabel} отменен: уже идет другой переход.`)
      return
    }

    this.inTransitioning = true
    try {
      const nextConfig = this.screensConfig.get(screenLabel)
      if (!nextConfig) throw new Error(`Сцена ${screenLabel} не найдена!`)

      const bundlesToLoad: string[] = dynamicBundlesToLoad || nextConfig.bundles || []
      let bundlesToUnload: string[] = dynamicBundlesToUnload || []
      // 1. Закрываем текущую сцену (если есть)
      if (this.activeScreen) {
        const currentConfig = this.screensConfig.get(this.activeScreen.label)

        await this.activeScreen.exit()
        this.loadingScreen.show()
        this.activeScreen.destroy() // Уничтожаем ECS и память

        if (!dynamicBundlesToUnload && currentConfig?.bundles && !currentConfig.keepBundlesOnExit) {
          // Выгружаем только те бандлы, которые НЕ нужны в следующей сцене
          bundlesToUnload = currentConfig.bundles.filter((b) => !bundlesToLoad.includes(b))
        }
      }

      // 2. Закрываем и вычищаем ВСЕ открытые оверлеи (инвентари, тултипы)
      this.clearAllOverlays()

      // 3. Выгружаем старые текстуры из VRAM
      if (bundlesToUnload.length > 0) {
        await Assets.unloadBundle(bundlesToUnload)
        console.log(`[GameMachine] Выгружены бандлы:`, bundlesToUnload)
      }

      // 4. Грузим новые (с минимальной задержкой от моргания)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const loadTasks: Promise<any>[] = [
        new Promise((resolve) => setTimeout(resolve, 500)) // Правильный синтаксис пустого таймера
      ]

      if (bundlesToLoad.length > 0) {
        // Передаем массив в Pixi, он сам всё распараллелит и выдаст правильный общий прогресс
        loadTasks.push(
          Assets.loadBundle(bundlesToLoad, (progress) =>
            this.loadingScreen.updateProgress(progress)
          )
        )
      } else {
        this.loadingScreen.updateProgress(1)
      }

      // Ждем и загрузку, и минимальный таймер
      await Promise.all(loadTasks)

      // 5. Запускаем новую базу
      this.activeScreen = new nextConfig.Class(screenLabel)
      this.activeScreen.init()

      // Кладем в нужный слой (например, 'screens')
      const layer = this.layers.getLayerByLabel(nextConfig.layer)
      layer.addChild(this.activeScreen.view)

      this.loadingScreen.hide()
      this.activeScreen.enter()
    } catch (error) {
      // Здесь можно добавить логику обработки ошибок (например, показать окошко "Ошибка сети")
      console.error(`[GameMachine] Ошибка при переходе на сцену ${screenLabel}:`, error)
    } finally {
      // 2. Гарантированно отпираем дверь в самом конце (даже если была ошибка)
      this.inTransitioning = false
    }
  }

  /**
   * Стратегическая фоновая загрузка следующего уровня.
   * Вызывается из самой сцены (например, когда игрок прошел 50% уровня).
   */
  public async backgroundLoadBundle(bundleName: string): Promise<void> {
    console.log(`[ScreenDirector] Начинаю фоновую загрузку бандла: ${bundleName}`)
    await Assets.backgroundLoadBundle(bundleName)
  }

  /**
   * Получить текущую сцену (для дебага или глобальных эвентов)
   */

  // eslint-disable-next-line @typescript-eslint/require-await
  public async openOverlay(screenLabel: string): Promise<void> {
    if (this.inTransitioning) return
    this.inTransitioning = true
    const config = this.screensConfig.get(screenLabel)
    if (!config) throw new Error(`Оверлей ${screenLabel} не найден!`)

    let overlay = this.cachedOverlays.get(screenLabel)

    // Если открываем первый раз за игру — создаем и инициализируем
    if (!overlay) {
      overlay = new config.Class(screenLabel)
      overlay.init()

      const layer = this.layers.getLayerByLabel(config.layer) // Слой 'ui'
      layer.addChild(overlay.view)

      this.cachedOverlays.set(screenLabel, overlay)
    }

    //TODO: не забыть асинхронный код
    // Вызываем enter (там мы делаем visible = true, играем анимацию появления)
    overlay.enter()

    // ОПЦИОНАЛЬНО: Ставим саму игру на паузу через EventBus
    // ServiceLocator.get(EventService).emit('engine:pause');
    this.inTransitioning = false
  }

  public async closeOverlay(screenLabel: string): Promise<void> {
    if (this.inTransitioning) return
    this.inTransitioning = true
    const overlay = this.cachedOverlays.get(screenLabel)
    if (!overlay) return

    // Вызываем exit (анимация затухания, visible = false)
    await overlay.exit()

    // ЗАМЕТЬТЕ: Мы НЕ вызываем overlay.destroy()!
    // Он остается висеть в слое с visible = false, готовый к мгновенному показу

    // ОПЦИОНАЛЬНО: Снимаем игру с паузы
    // ServiceLocator.get(EventService).emit('engine:resume');
    this.inTransitioning = false
  }

  // Полная чистка оверлеев (вызывается при смене уровня)
  private clearAllOverlays(): void {
    for (const overlay of this.cachedOverlays.values()) {
      overlay.destroy()
    }
    this.cachedOverlays.clear()
  }
}
