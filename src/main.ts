console.log('entry point')

import { Engine } from './core/engine'
import { spawnAsteroidField } from '@game/level-builder'

async function bootstrap() {
  // Выделяем память под 100 000 объектов!
  const engine = new Engine(200000)

  // Инициализируем WebGPU и загружаем текстуры
  await engine.init()

  // Спавним 50 000 астероидов за долю секунды
  spawnAsteroidField(engine, 100000)

  console.log('🚀 Движок успешно запущен! WebGPU/WebGL2 инстансинг работает.')
}

bootstrap()
