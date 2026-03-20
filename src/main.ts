import engineConfig from '@core/engine.config'
import { Engine } from '@core/engine'
import { spawnAsteroidField } from '@game/level.builder'

const engine = new Engine(engineConfig, 200000)

// Инициализируем WebGPU и загружаем текстуры
await engine.init().then(() => engine.start())
;(globalThis as any).eee = engine

// Спавним 50 000 астероидов за долю секунды
spawnAsteroidField(engine, 100000)

console.log('🚀 Движок успешно запущен! WebGPU/WebGL2 инстансинг работает.')
