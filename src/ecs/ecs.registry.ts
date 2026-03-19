import { ComponentMask } from '@ecs/components/component.mask'
import { STRIDE_BYTES } from '@ecs/components/memory.layout'

export class ECSRegistry {
  private readonly availableIds: number[] = []

  public readonly maxEntities: number
  public readonly masks: Uint8Array
  public readonly buffer: ArrayBuffer
  public readonly f32: Float32Array
  public readonly u32: Uint32Array
  public readonly velocityF32: Float32Array

  public highestEntityId: number = -1
  public activeEntityCount: number = 0

  constructor(maxEntities: number) {
    this.maxEntities = maxEntities
    this.masks = new Uint8Array(maxEntities)
    this.buffer = new ArrayBuffer(maxEntities * STRIDE_BYTES)
    this.f32 = new Float32Array(this.buffer)
    this.u32 = new Uint32Array(this.buffer)
    this.velocityF32 = new Float32Array(maxEntities * 4)

    for (let index = maxEntities - 1; index >= 0; index--) {
      this.availableIds.push(index)
    }
  }

  public createEntity(): number {
    if (this.availableIds.length === 0) {
      throw new Error('ECS: Достигнут лими сущностей')
    }

    const id = this.availableIds.pop()!

    if (id > this.highestEntityId) {
      this.highestEntityId = id
    }
    this.activeEntityCount++

    this.masks[id] = ComponentMask.None

    return id
  }

  public destroyEntity(id: number): void {
    if (this.masks[id] === ComponentMask.None) return
    this.masks[id] = ComponentMask.None
    this.availableIds.push(id)
    this.activeEntityCount--
  }

  public addComponent(id: number, mask: ComponentMask): void {
    this.masks[id] |= mask
  }

  public removeComponent(id: number, mask: ComponentMask): void {
    this.masks[id] &= ~mask
  }

  public hasComponent(id: number, mask: ComponentMask): boolean {
    return (this.masks[id] & mask) === mask
  }
}
