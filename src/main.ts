import { Engine } from '@core/engine'
import engineConfig from '@core/engine.config'
import { startLevel } from '@game/level.builder'

const engine = new Engine(engineConfig, 200_000)

try {
  await engine.init()
  await engine.start()
  console.log('🚀 Движок успешно запущен:')
} catch (error) {
  console.error('Критическая ошибка при запуске движка:', error)
  throw error
}

await startLevel(engine)
