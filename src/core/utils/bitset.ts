export class BitSet {
  // eslint-disable-next-line sonarjs/public-static-readonly
  public static wordCount: number = 4 // Задается извне при старте

  public words: Uint32Array

  constructor() {
    this.words = new Uint32Array(BitSet.wordCount)
  }

  add(componentId: number): void {
    this.words[componentId >> 5] |= 1 << (componentId & 31)
  }

  remove(componentId: number): void {
    this.words[componentId >> 5] &= ~(1 << (componentId & 31))
  }

  has(componentId: number): boolean {
    return (this.words[componentId >> 5] & (1 << (componentId & 31))) !== 0
  }
  containsAll(other: BitSet): boolean {
    // 1. Кэшируем ссылки локально!
    // Обращение к локальной переменной в цикле быстрее, чем к this.words
    const w1 = this.words
    const w2 = other.words
    const limit = BitSet.wordCount

    for (let i = 0; i < limit; i++) {
      if ((w1[i] & w2[i]) !== w2[i]) {
        return false
      }
    }
    return true
  }

  intersects(other: BitSet): boolean {
    const w1 = this.words
    const w2 = other.words
    const limit = BitSet.wordCount

    for (let i = 0; i < limit; i++) {
      if ((w1[i] & w2[i]) !== 0) {
        return true
      }
    }
    return false
  }

  clear(): void {
    this.words.fill(0)
  }
}
