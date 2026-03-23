import type { Engine } from '@core/engine'
import type { ViewData } from '@ecs/components'

// Системы
// import { InputSystem } from '@ecs/systems/input.system'
import { MovementSystem, RenderSystem } from '@ecs/systems'
// import { InputManager } from '@ecs/utils/input-manager'
// import { EntityFactory } from '@ecs/utils/entity-factory'
// Ядро ECS
import { World } from '@ecs/world'
import { EntityFactory } from '@utils/factory'
import { createBullet } from '@utils/factory/blueprints/bullet.blueprint'
// Чертежи (Blueprints)
import { createEnemy } from '@utils/factory/blueprints/enemy.blueprint'
import { createPlayer } from '@utils/factory/blueprints/player.blueprint'
import { Application, Assets, Container, Texture } from 'pixi.js'
// import { CollisionSystem } from '@ecs/systems/collision.system'
// import { LifespanSystem } from '@ecs/systems/lifespan.system'; // Если напишем

export async function startLevel(engine: Engine) {
  // ==========================================
  // 1. ИНИЦИАЛИЗАЦИЯ PIXI.JS V8
  // ==========================================
  // const app = new Application()
  // await app.init({
  //   width: 800,
  //   height: 600,
  //   backgroundColor: 0x1a1a1a
  // })
  // document.body.appendChild(app.canvas)

  // Оптимизированный слой рендера (секрет высокого FPS в v8)
  // const gameLayer = new Container()
  // gameLayer.isRenderGroup = true
  // app.stage.addChild(gameLayer)

  // Загрузка ресурсов
  const { layers, world } = engine
  const bunnyTexture = await Assets.load<Texture>('https://pixijs.com/assets/bunny.png')
  const textures = { player: bunnyTexture }

  // ==========================================
  // 2. ИНИЦИАЛИЗАЦИЯ ECS И ФАБРИКИ
  // ==========================================
  // const world = new World(5000) // Резервируем память под 5000 объектов
  // const inputManager = new InputManager()
  const factory = new EntityFactory(world, layers.getLayerByLabel('world'), textures)

  // Регистрируем чертежи объектов
  factory
    .register('player', createPlayer)
    .register('enemy', createEnemy)
    .register('bullet', createBullet)

  // ==========================================
  // 3. ПОДКЛЮЧЕНИЕ СИСТЕМ (Порядок важен!)
  // ==========================================
  // world.addSystem(new InputSystem(inputManager, 5)) // Читаем ввод
  world.addSystem(new MovementSystem()) // Двигаем объекты
  // world.addSystem(new CollisionSystem(world)) // Проверяем столкновения
  // world.addSystem(new LifespanSystem(world));     // Убиваем старые пули
  world.addSystem(new RenderSystem()) // Рисуем результат

  // ==========================================
  // 4. СБОРКА МУСОРА (GC-FREE ПОДХОД)
  // ==========================================
  // Когда Мир убивает сущность, мы должны вернуть её графику в пул
  // world.events.on('ON_ENTITY_DESTROYED', (entity) => {
  //   if (entity.has('View')) {
  //     const view = entity.get<ViewData>('View')
  //     if (view.release) {
  //       view.release() // Возвращаем в ObjectPool
  //     } else {
  //       // Если пула нет, удаляем навсегда (например, для уникальных боссов)
  //       view.node.removeFromParent()
  //       view.node.destroy()
  //     }
  //   }
  // })

  // ==========================================
  // 5. СОЗДАНИЕ ИГРОВОГО МИРА (СПАВН)
  // ==========================================
  const player = factory.create('player', { x: 0, y: 0 })

  // Спавним 10 врагов в случайных точках
  for (let i = 0; i < 10; i++) {
    factory.create('enemy', {
      x: Math.random() * 800,
      y: Math.random() * 600,
      speed: 1 + Math.random() * 2
    })
  }

  // ==========================================
  // 6. ИНТЕРАКТИВ (СТРЕЛЬБА ПО КЛИКУ)
  // ==========================================
  globalThis.addEventListener('mousedown', (e) => {
    if (!player || player.isDestroyed) return

    // Получаем координаты игрока для старта пули
    const pTransform = player.get<{ x: number; y: number }>('Transform')

    // Вычисляем вектор направления (от игрока к мыши)
    const dx = e.clientX - pTransform.x
    const dy = e.clientY - pTransform.y
    const length = Math.hypot(dx, dy)

    // Спавним пулю через фабрику (пулы отработают автоматически внутри чертежа)
    factory.create('bullet', {
      x: pTransform.x,
      y: pTransform.y,
      dirX: dx / length,
      dirY: dy / length,
      speed: 15
    })
  })

  // ==========================================
  // 7. ИГРОВОЙ ЦИКЛ (GAMELOOP)
  // ==========================================
  // app.ticker.add((ticker) => {
  //   // ticker.deltaTime в Pixi v8 = 1 при 60 FPS.
  //   // Передаем его в ECS, чтобы движение было плавным при любой герцовке монитора.
  //   world.update(ticker.deltaTime)
  // })
}

// Запуск
// initGame()
