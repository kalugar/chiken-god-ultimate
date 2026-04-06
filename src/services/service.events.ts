// src/services/service.events.ts

// Тип для функции-обработчика
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventHandler<T = any> = (payload: T) => void

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default class EventService<Events extends Record<string, any>> {
  // Храним слушателей: Имя события -> Набор(Set) функций
  private handlers = new Map<keyof Events, Set<EventHandler>>()

  // === ПОДПИСКА ===
  public on<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set())
    }
    this.handlers.get(event)!.add(handler as EventHandler)

    return () => {
      this.off(event, handler)
    }
  }

  // === ОТПИСКА ===
  public off<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): void {
    const eventHandlers = this.handlers.get(event)
    if (eventHandlers) {
      eventHandlers.delete(handler as EventHandler)
      // Очищаем память, если слушателей больше нет
      if (eventHandlers.size === 0) {
        this.handlers.delete(event)
      }
    }
  }

  // === ВЫЗОВ (ЭМИТ) ===
  // Если событие не требует payload (тип void), TypeScript позволит вызвать emit('event')
  public emit<K extends keyof Events>(
    event: K,
    ...args: Events[K] extends void ? [undefined?] : [Events[K]]
  ): void {
    const eventHandlers = this.handlers.get(event)
    if (eventHandlers) {
      const payload = args[0] as Events[K]
      for (const handler of eventHandlers) {
        handler(payload)
      }
    }
  }

  // === РАЗОВАЯ ПОДПИСКА (ONCE) ===
  public once<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): void {
    const onceWrapper: EventHandler<Events[K]> = (payload) => {
      this.off(event, onceWrapper) // Сразу же отписываемся
      handler(payload) // Вызываем оригинальный коллбек
    }
    this.on(event, onceWrapper)
  }

  // === ПОЛНАЯ ОЧИСТКА ===
  public clearAll(): void {
    this.handlers.clear()
  }

  public clearByPrefix(prefix: string): void {
    for (const key of this.handlers.keys()) {
      // Приводим ключ к строке, так как keyof Events может быть string | number | symbol
      if (String(key).startsWith(prefix)) {
        this.handlers.delete(key)
      }
    }
  }
}
