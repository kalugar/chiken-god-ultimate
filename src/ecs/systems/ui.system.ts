import { Container, Text, TextStyle } from 'pixi.js'
import type { System } from '@ecs/system'
import type { ECSRegistry } from '@ecs/ecs.registry'

export class UISystem implements System {
  public cpuTime!: number
  private statsText: Text
  private updateTimer: number = 0
  private formatter = new Intl.NumberFormat('de-DE')

  constructor(root: Container) {
    const style = new TextStyle({
      fontFamily: 'monospace', // Моноширинный шрифт идеален для дебаг-цифр
      fontSize: 14,
      fill: '#00ff00',
      fontWeight: 'bold',
      dropShadow: {
        color: '#000000',
        distance: 2,
        blur: 2
      },
      lineHeight: 20 // Даем немного воздуха между строками
    })

    this.statsText = new Text({ text: 'Loading stats...', style })
    this.statsText.x = 10
    this.statsText.y = 10
    root.addChild(this.statsText)
  }

  public update(registry: ECSRegistry, deltaTime: number): void {
    this.updateTimer += deltaTime

    // Обновляем раз в полсекунды
    if (this.updateTimer > 0.5) {
      const fps = Math.round(1 / deltaTime)
      const entities = this.formatter.format(registry.activeEntityCount)

      // 1. СЧИТАЕМ ECS RAM (Точный расчет нашей архитектуры)
      // byteLength возвращает размер TypedArray в байтах
      const ecsBytes =
        registry.f32.byteLength + registry.velocityF32.byteLength + registry.masks.byteLength

      // Переводим в Мегабайты (1 МБ = 1024 * 1024 байт = 1048576)
      const ecsMb = (ecsBytes / 1048576).toFixed(2)

      // 2. СЧИТАЕМ JS HEAP (Только для Chrome/Edge)
      let heapStr = 'N/A (Non-Chromium)'
      const perf = performance as any // Обходим строгую типизацию TS для нестандартного API
      if (perf.memory) {
        const heapMb = perf.memory.usedJSHeapSize / 1048576
        heapStr = `${heapMb.toFixed(1)} MB`
      }

      // 3. ФОРМИРУЕМ ВЫВОД
      this.statsText.text =
        `Fps       : ${fps}\n` +
        `Entities  : ${entities}\n` +
        `ecs RAM   : ${ecsMb} MB\n` +
        `JS Heap   : ${heapStr}\n`

      this.updateTimer = 0
    }
  }
}
