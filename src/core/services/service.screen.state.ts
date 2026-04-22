import type { BaseScreen, PrefabConfig, BaseWidget, ScreenPipelineConfig } from '@core/types'
import type LoadScreen from '@game/screens/load.screen'

import {
  //  Ticker,
  Assets,
  type AssetsManifest,
  Container,
  ViewContainer
} from 'pixi.js'

import type LayersService from './sevice.layers'

export class GameScreen implements BaseScreen {
  public readonly refs = new Map<string, ViewContainer>()
  public readonly schemas = new Map<string, PrefabConfig>()

  constructor(public readonly label: string) {}

  // === ЖИЗНЕННЫЙ ЦИКЛ (Опциональные хуки для переопределения) ===

  public init(): void {
    // Переопределите в наследнике для спавна сущностей и сборки UI
  }

  public async enter(): Promise<void> {
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
  }
}

export class Widget implements BaseWidget {
  public readonly view: Container
  public readonly refs = new Map<string, ViewContainer>()
  public readonly schemas = new Map<string, PrefabConfig>()

  constructor(public readonly label: string) {
    this.view = new Container({ label: this.label })
  }

  // === ЖИЗНЕННЫЙ ЦИКЛ (Опциональные хуки для переопределения) ===

  public init(): void {
    // Переопределите в наследнике для спавна сущностей и сборки UI
  }

  public async enter(): Promise<void> {
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

export default class ScreenDispatcher {
  private activeScreen: BaseScreen | null = null
  private readonly cachedWidgets: Map<string, BaseWidget> = new Map()
  private readonly screensConfig: Map<string, ScreenPipelineConfig> = new Map()

  private inTransitioning: boolean = false
  private loadingScreen!: LoadScreen

  constructor(private layers: LayersService) {}

  public inject(loadingScreen: LoadScreen): void {
    this.loadingScreen = loadingScreen
  }

  public getActiveScreen(): BaseScreen {
    if (!this.activeScreen) {
      throw new Error('[ScreenDispatcher] Активных сцен нет!')
    }
    return this.activeScreen
  }

  public getWidget(label: string): BaseWidget {
    const widget = this.cachedWidgets.get(label)
    if (!widget) {
      throw new Error(`[ScreenDispatcher] Виджет ${label} не инстанцирован!`)
    }
    return widget
  }

  // ============================================================================
  // ИНИЦИАЛИЗАЦИЯ
  // ============================================================================

  public async bootGame(manifest: AssetsManifest, pipeline: ScreenPipelineConfig[]): Promise<void> {
    for (const config of pipeline) {
      this.screensConfig.set(config.label, config)
    }

    // 1. Инициализируем манифест (сгенерированный Assetpack)
    await Assets.init({ manifest, basePath: 'assets' })

    // 2. Грузим бандл загрузочного экрана
    await Assets.loadBundle('loading')
    this.loadingScreen.show()

    // 3. Грузим общие элементы UI
    await Assets.loadBundle('shared', (progress) => {
      this.loadingScreen.updateProgress(progress)
    })

    await this.loadingScreen.awaitAnimation()

    // Переход на первую сцену вызывается снаружи (engine.start)
  }

  // ============================================================================
  // УПРАВЛЕНИЕ СЦЕНАМИ (ИГРОВАЯ ЛОГИКА - БЕЗ VIEW)
  // ============================================================================

  public async switchTo(
    screenLabel: string,
    dynamicBundlesToLoad?: string[],
    dynamicBundlesToUnload?: string[]
  ): Promise<void> {
    if (this.inTransitioning) {
      console.warn(`[ScreenDispatcher] Переход на ${screenLabel} отменен: уже идет переход.`)
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
        this.activeScreen.destroy() // Очистка ECS

        if (!dynamicBundlesToUnload && currentConfig?.bundles && !currentConfig.keepBundlesOnExit) {
          bundlesToUnload = currentConfig.bundles.filter((b) => !bundlesToLoad.includes(b))
        }
      }

      // 2. Вычищаем ВСЕ открытые виджеты (инвентари, тултипы)
      this.clearAllWidgets()

      // 3. Выгружаем старые текстуры из VRAM
      if (bundlesToUnload.length > 0) {
        await Assets.unloadBundle(bundlesToUnload)
        console.log(`[ScreenDispatcher] Выгружены бандлы:`, bundlesToUnload)
      }

      // 4. Грузим новые ассеты (с минимальным таймером против мерцания)
      const loadTasks: Promise<unknown>[] = [new Promise((resolve) => setTimeout(resolve, 500))]

      if (bundlesToLoad.length > 0) {
        loadTasks.push(
          Assets.loadBundle(bundlesToLoad, (progress) =>
            this.loadingScreen.updateProgress(progress)
          )
        )
      } else {
        this.loadingScreen.updateProgress(1)
      }

      await Promise.all(loadTasks)

      // 5. Запускаем новую сцену
      // ВАЖНО: Приводим к BaseScreen, т.к. сцены не имеют view и не добавляются в слои
      this.activeScreen = new nextConfig.Class(screenLabel) as BaseScreen
      this.activeScreen.init()

      // Скрываем лоадер и проигрываем анимацию появления логики (если есть)
      this.loadingScreen.hide()
      await this.activeScreen.enter()
    } catch (error) {
      console.error(`[ScreenDispatcher] Ошибка при переходе на сцену ${screenLabel}:`, error)
    } finally {
      this.inTransitioning = false
    }
  }

  // ============================================================================
  // УПРАВЛЕНИЕ ВИДЖЕТАМИ (UI / МОДАЛКИ - С VIEW)
  // ============================================================================

  public async openWidget(widgetLabel: string): Promise<void> {
    if (this.inTransitioning) return
    this.inTransitioning = true

    try {
      const config = this.screensConfig.get(widgetLabel)
      if (!config) throw new Error(`Виджет ${widgetLabel} не найден в конфиге!`)
      if (!config.layer) throw new Error(`Для виджета ${widgetLabel} не указан слой (layer)!`)

      let widget = this.cachedWidgets.get(widgetLabel)

      // Если виджет открывается первый раз за сцену — создаем его
      if (!widget) {
        // Приводим к BaseWidget, так как мы уверены, что у него есть .view
        widget = new config.Class(widgetLabel) as BaseWidget
        widget.init()

        // Кладем виджет в указанный слой Pixi (например, 'modals' или 'ui')
        const layer = this.layers.getLayerByLabel(config.layer)
        if (!layer) throw new Error(`Слой ${config.layer} не существует!`)

        layer.addChild(widget.view)
        this.cachedWidgets.set(widgetLabel, widget)
      }

      // Асинхронно ждем завершения анимации появления (например, выезд за пределы экрана)
      await widget.enter()
    } finally {
      this.inTransitioning = false
    }
  }

  public async closeWidget(widgetLabel: string): Promise<void> {
    if (this.inTransitioning) return
    this.inTransitioning = true

    try {
      const widget = this.cachedWidgets.get(widgetLabel)
      if (!widget) return

      // Вызываем exit (анимация затухания)
      await widget.exit()

      // Виджет остается в кэше и в дереве Pixi (с visible = false или alpha = 0),
      // чтобы открыться мгновенно в следующий раз
    } finally {
      this.inTransitioning = false
    }
  }

  private clearAllWidgets(): void {
    for (const widget of this.cachedWidgets.values()) {
      widget.destroy() // Внутри Widget.destroy() есть this.view.destroy()
    }
    this.cachedWidgets.clear()
  }

  // ============================================================================
  // УТИЛИТЫ
  // ============================================================================

  public async backgroundLoadBundle(bundleName: string): Promise<void> {
    console.log(`[ScreenDispatcher] Фоновая загрузка бандла: ${bundleName}`)
    await Assets.backgroundLoadBundle(bundleName)
  }
}
