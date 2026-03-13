import { Application, Assets, Sprite, Texture } from 'pixi.js'

// Создаем приложение
const app = new Application()

// Инициализируем приложение (Vite позволяет использовать await прямо здесь!)
// eslint-disable-next-line unicorn/prefer-global-this
await app.init({ background: '#1099bb', resizeTo: window })

// Добавляем canvas в DOM
document.querySelector('#pixi-container')!.append(app.canvas)

// 👇 МАГИЯ ТИПОВ ЗДЕСЬ: Явно указываем <Texture>, чтобы избежать any
const texture = await Assets.load<Texture>('/assets/bunny.png')

// Теперь TS точно знает, что texture - это Texture, и Sprite не будет ругаться
const bunny = new Sprite(texture)

// Центрируем
bunny.anchor.set(0.5)
bunny.position.set(app.screen.width / 2, app.screen.height / 2)
app.stage.addChild(bunny)

// Анимация
app.ticker.add((time) => {
  bunny.rotation += 0.1 * time.deltaTime
})
