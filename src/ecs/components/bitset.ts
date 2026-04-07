export class BitSet {
  // 4 числа по 32 бита = 128 компонентов
  public words = new Uint32Array(4)

  add(componentId: number): void {
    const wordIndex = componentId >> 5
    const bitIndex = componentId & 31
    this.words[wordIndex] |= 1 << bitIndex
  }

  remove(componentId: number): void {
    const wordIndex = componentId >> 5
    const bitIndex = componentId & 31
    this.words[wordIndex] &= ~(1 << bitIndex)
  }

  has(componentId: number): boolean {
    const wordIndex = componentId >> 5
    const bitIndex = componentId & 31
    return (this.words[wordIndex] & (1 << bitIndex)) !== 0
  }

  containsAll(other: BitSet): boolean {
    return (
      (this.words[0] & other.words[0]) === other.words[0] &&
      (this.words[1] & other.words[1]) === other.words[1] &&
      (this.words[2] & other.words[2]) === other.words[2] &&
      (this.words[3] & other.words[3]) === other.words[3]
    )
  }

  intersects(other: BitSet): boolean {
    return (
      (this.words[0] & other.words[0]) !== 0 ||
      (this.words[1] & other.words[1]) !== 0 ||
      (this.words[2] & other.words[2]) !== 0 ||
      (this.words[3] & other.words[3]) !== 0
    )
  }

  clear(): void {
    this.words.fill(0)
  }
}
