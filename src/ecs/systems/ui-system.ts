import { Text, TextStyle } from 'pixi.js'
import type { System } from '@ecs/system'
import type { ECSRegistry } from '@ecs/ecs-registry'

export class UISystem implements System {
  private fpsText: Text
  private updateTimer: number = 0
  private formatter: Intl.NumberFormat = new Intl.NumberFormat('ru-RU')

  constructor(stage: any) {
    // Настраиваем стиль текста
    const style = new TextStyle({
      fontFamily: 'Arial',
      fontSize: 18,
      fill: '#00ff00', // Ядовито-зеленый, как в старых консолях
      fontWeight: 'bold',
      dropShadow: {
        color: '#000000',
        blur: 4,
        distance: 2
      }
    })

    this.fpsText = new Text({ text: 'FPS: 0', style })
    this.fpsText.x = 10
    this.fpsText.y = 10

    stage.addChild(this.fpsText)
  }

  public update(registry: ECSRegistry, deltaTime: number): void {
    this.updateTimer += deltaTime

    // Обновляем текст 2 раза в секунду (чтобы не мельтешило)
    if (this.updateTimer > 0.5) {
      // В PixiJS 8 мы можем получить FPS напрямую из глобального тикера,
      // но так как мы передаем deltaTime, можем использовать его.
      // Если deltaTime в секундах, то FPS = 1 / deltaTime
      const fps = Math.round(1 / deltaTime)

      // Также выведем количество активных объектов из ECS
      const entityCount = this.formatter.format(registry.activeEntityCount)

      this.fpsText.text = `FPS: ${fps}\nEntities: ${entityCount}`
      this.updateTimer = 0
    }
  }
}
