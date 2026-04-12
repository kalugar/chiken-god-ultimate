import { BaseScreen } from '@core/services/service.screen.state'
import { Graphics, Text, Ticker } from 'pixi.js'

export default class LoadScreen extends BaseScreen {
  private bg!: Graphics
  private progressBar!: Graphics
  private progressBarFill!: Graphics
  private progressText: Text

  // === ЛОГИКА ПЛАВНОСТИ ===
  private targetProgress: number = 0 // Реальный прогресс от Assetpack
  private displayProgress: number = 0 // То, что мы рисуем сейчас

  // Коллбэк для GameMachine, который вызовется, когда анимация дойдет до 100%
  private onCompleteCallback: (() => void) | null = null
  private screenWidth = window.innerWidth
  private screenHeight = window.innerHeight

  private targetAlpha: number = 0 // Для плавного появления/исчезновения

  constructor(label: string) {
    super(label)
    this.view.visible = false
    this.view.alpha = 0
    this.view.zIndex = 9999 // Всегда поверх всего!

    // // Перехватываем все клики (чтобы нельзя было кликать сквозь ширму)
    this.view.eventMode = 'static'

    const bg = new Graphics().rect(0, 0, this.screenWidth, this.screenHeight).fill(0x00_00_00)
    this.view.addChild(bg)

    // Создаем графику для полоски
    this.progressBar = new Graphics()
    this.view.addChild(this.progressBar)

    // Создаем текст
    this.progressText = new Text({
      text: 'Загрузка... 0%',
      style: { fill: '0xffffff', fontSize: 24, fontWeight: 'bold' }
    })
    // this.progressText.anchor.set(0)
    this.progressText.position.set(this.screenWidth / 2, this.screenHeight / 1.25 - 30)
    this.view.addChild(this.progressText)

    this.view.visible = false

    // this.buildUI()

    // Подключаем плавный фейд к глобальному тикеру Pixi
    Ticker.shared.add(this.updateFade, this)
  }

  // private buildUI() {
  //   // 1. Темный фон (Затмевает старую сцену)

  //   console.log('this.build')
  //   this.bg = new Graphics()
  //   this.bg.rect(0, 0, this.screenWidth, this.screenHeight)
  //   this.bg.fill({ color: 0x11_11_11, alpha: 1 })
  //   this.view.addChild(this.bg)
  //   // 2. Фон полоски прогресса
  //   const barWidth = 400
  //   const barHeight = 20
  //   this.progressBarBg = new Graphics()
  //   this.progressBarBg.roundRect(0, 0, barWidth, barHeight, 10)
  //   this.progressBarBg.fill({ color: 0x33_33_33 })
  //   this.progressBarBg.position.set(
  //     (this.screenWidth - barWidth) / 2,
  //     (this.screenHeight - barHeight) / 1.25
  //   )
  //   this.view.addChild(this.progressBarBg)
  //   // 3. Заполняющаяся полоска
  //   this.progressBarFill = new Graphics()
  //   this.progressBarFill.roundRect(0, 0, barWidth, barHeight, 10)
  //   this.progressBarFill.fill({ color: 0x00_ff_88 }) // Зелененький киберпанк
  //   this.progressBarFill.position.copyFrom(this.progressBarBg.position)
  //   this.progressBarFill.scale.x = 0 // Изначально прогресс 0
  //   this.view.addChild(this.progressBarFill)
  //   // 4. Текст процентов
  //   this.progressText = new Text({
  //     text: '0%',
  //     style: { fill: 0xff_ff_ff, fontSize: 24, fontWeight: 'bold' }
  //   })
  //   this.progressText.anchor.set(0.5)
  //   this.progressText.position.set(width / 2, height / 2 - 30)
  //   this.view.addChild(this.progressText)

  //   console.log(this.view)
  // }

  /**
   * Обновляет полоску прогресса (p: от 0.0 до 1.0)
   */
  public updateProgress(progress: number): void {
    // // Жестко ограничиваем от 0 до 1
    // const clampedProgress = Math.max(0, Math.min(1, p))
    // // Scale.x от 0 до 1 пропорционально заполняет полоску
    // this.progressBarFill.scale.x = clampedProgress
    // this.percentText.text = `${Math.floor(clampedProgress * 100)}%`
    console.log('update progress:', progress)

    this.targetProgress = progress
  }

  /**
   * Плавный показ экрана
   */
  public show(): void {
    this.view.visible = true
    this.targetAlpha = 1
    this.updateProgress(0) // Сбрасываем перед новой загрузкой
    Ticker.shared.add(this.animate, this)
  }

  /**
   * Плавное скрытие экрана
   */
  public hide(): void {
    this.targetAlpha = 0
    Ticker.shared.remove(this.animate, this)
  }
  public async awaitAnimation(): Promise<void> {
    return new Promise((resolve) => {
      // Если анимация УЖЕ добежала (например, грузили долго), резолвим сразу
      if (this.displayProgress >= 1) {
        resolve()
      } else {
        // Иначе запоминаем resolve, чтобы дернуть его в цикле animate
        this.onCompleteCallback = resolve
      }
    })
  }

  /**
   * Анимация прозрачности (Lerp)
   */
  private updateFade = (ticker: Ticker) => {
    // // Простая линейная интерполяция для плавности
    this.view.alpha += (this.targetAlpha - this.view.alpha) * 0.1 * ticker.deltaTime
    // Если полностью прозрачный и мы хотим его скрыть — отключаем рендер
    if (this.targetAlpha === 0 && this.view.alpha < 0.01) {
      this.view.visible = false
      this.view.alpha = 0
    }
  }

  private animate = (ticker: Ticker): void => {
    // Если визуальный прогресс уже догнал таргет — ничего не делаем
    if (this.displayProgress >= this.targetProgress) return

    // Плавное приближение (Lerp).
    // Умножаем на ticker.deltaTime, чтобы скорость не зависела от герцовки монитора.
    // 0.05 - это скорость. Сделайте меньше (0.02), чтобы ползло медленнее.
    this.displayProgress += (this.targetProgress - this.displayProgress) * 0.05 * ticker.deltaTime

    // Если визуальная полоска почти дошла до цели (погрешность математики), приравниваем
    if (this.targetProgress - this.displayProgress < 0.001) {
      this.displayProgress = this.targetProgress
    }

    // Если мы достигли 100% (1.0), дергаем коллбэк для GameMachine
    if (this.displayProgress === 1 && this.onCompleteCallback) {
      this.onCompleteCallback()
      this.onCompleteCallback = null
    }

    // Отрисовываем кадр
    this.draw(this.displayProgress)
  }

  private draw(progress: number): void {
    const barWidth = 400
    const barHeight = 20
    const startX = (this.screenWidth - barWidth) / 2
    const startY = this.screenHeight / 1.25

    this.progressBar.clear()

    // Рисуем фон полоски (серый)
    this.progressBar.rect(startX, startY, barWidth, barHeight).fill(0x33_33_33)

    // Рисуем сам прогресс (зеленый)
    this.progressBar.rect(startX, startY, barWidth * progress, barHeight).fill(0x00_ff_00)

    // Обновляем текст (Math.floor отрезает дробную часть)
    this.progressText.text = `Загрузка... ${Math.floor(progress * 100)}%`
  }
}
