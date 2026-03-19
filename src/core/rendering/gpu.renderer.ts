import {
  Buffer,
  Mesh,
  Geometry,
  Shader,
  GpuProgram,
  TextureSource,
  GlProgram,
  RenderGroup,
  Container
} from 'pixi.js'

import type { ECSRegistry } from '@ecs/ecs.registry'
import type { System } from '@ecs/system'

import unifiedWgsl from '@rendering/shaders/sprite.wgsl?raw'
import glslFragment from '@rendering/shaders/sprite.frag.glsl?raw'
import glslVertex from '@rendering/shaders/sprite.vert.glsl?raw'

import { ComponentMask } from '@ecs/components/component.mask'
import {
  STRIDE_BYTES,
  OFFSET_X,
  OFFSET_SCALE_X,
  OFFSET_ROTATION,
  OFFSET_ANCHOR_X,
  OFFSET_SKEW_X,
  OFFSET_UV_U,
  OFFSET_ORIG_W,
  OFFSET_COLOR_32
} from '@ecs/components/memory.layout'

export class GPURenderSystem implements System {
  public readonly mesh: Mesh<Geometry, Shader>
  private readonly gpuBuffer: Buffer

  // Система рендера берет только те сущности, которые имеют координаты и цвет
  private readonly REQUIRED_MASK = ComponentMask.Transform | ComponentMask.Render

  constructor(registry: ECSRegistry, atlasTexture: TextureSource, root: Container | RenderGroup) {
    // 1. СОЗДАЕМ БУФЕР PIXIJS ПОВЕРХ ПАМЯТИ ECS
    // Мы отдаем Pixi ссылку на f32-представление нашей памяти
    this.gpuBuffer = new Buffer({
      data: registry.f32,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    })

    // 2. БАЗОВАЯ ГЕОМЕТРИЯ (Квадрат 1x1)
    const vertexData = new Float32Array([
      -0.5,
      -0.5, // Вершина 0
      0.5,
      -0.5, // Вершина 1
      0.5,
      0.5, // Вершина 2
      -0.5,
      0.5 // Вершина 3
    ])

    const indexData = new Uint16Array([
      0,
      1,
      2, // Треугольник 1
      0,
      2,
      3 // Треугольник 2
    ])

    // 2. Формируем геометрию по новому API PixiJS 8
    const geometry = new Geometry()
    geometry.addAttribute('aPosition', { buffer: vertexData, format: 'float32x2' })
    geometry.addIndex(indexData)

    geometry.addAttribute('aPositionOffset', {
      buffer: this.gpuBuffer,
      format: 'float32x2',
      stride: STRIDE_BYTES,
      offset: OFFSET_X * 4,
      instance: true
    })

    geometry.addAttribute('aScale', {
      buffer: this.gpuBuffer,
      format: 'float32x2',
      stride: STRIDE_BYTES,
      offset: OFFSET_SCALE_X * 4,
      instance: true
    })

    geometry.addAttribute('aRotation', {
      buffer: this.gpuBuffer,
      format: 'float32',
      stride: STRIDE_BYTES,
      offset: OFFSET_ROTATION * 4,
      instance: true
    })

    geometry.addAttribute('aAnchor', {
      buffer: this.gpuBuffer,
      format: 'float32x2',
      stride: STRIDE_BYTES,
      offset: OFFSET_ANCHOR_X * 4,
      instance: true
    })

    geometry.addAttribute('aSkew', {
      buffer: this.gpuBuffer,
      format: 'float32x2',
      stride: STRIDE_BYTES,
      offset: OFFSET_SKEW_X * 4,
      instance: true
    })

    geometry.addAttribute('aUVRect', {
      buffer: this.gpuBuffer,
      format: 'float32x4',
      stride: STRIDE_BYTES,
      offset: OFFSET_UV_U * 4,
      instance: true
    })
    geometry.addAttribute('aOrigSize', {
      buffer: this.gpuBuffer,
      format: 'float32x2',
      stride: STRIDE_BYTES,
      offset: OFFSET_ORIG_W * 4,
      instance: true
    })

    geometry.addAttribute('aPackedColor', {
      buffer: this.gpuBuffer,
      format: 'unorm8x4',
      stride: STRIDE_BYTES,
      offset: OFFSET_COLOR_32 * 4,
      instance: true
    })

    // Создаем WebGPU программу из одного файла

    const glProgram = GlProgram.from({
      vertex: glslVertex,
      fragment: glslFragment
    })
    const gpuProgram = GpuProgram.from({
      vertex: {
        source: unifiedWgsl,
        entryPoint: 'vs_main' // Указываем точку входа для вершин!
      },
      fragment: {
        source: unifiedWgsl,
        entryPoint: 'fs_main' // Указываем точку входа для пикселей!
      }
    })

    const shader = new Shader({
      glProgram,
      gpuProgram,
      resources: {
        uTexture: atlasTexture,
        uSampler: atlasTexture.style
      }
    })

    this.mesh = new Mesh<Geometry, Shader>({ geometry, shader })

    root.addChild(this.mesh)
  }

  /**
   * Вызывается каждый кадр в главном цикле
   */
  public update(registry: ECSRegistry, deltaTime: number): void {
    // Мы могли бы реализовать здесь компактификацию (собрать все отфильтрованные
    // сущности в плотный массив без пустых дыр), но для начала мы просто
    // заставляем GPU пробежаться по всему массиву.
    // Если сущность мертва (aPackedColor.a == 0), GPU просто схлопнет её вершину.

    // Указываем PixiJS, сколько инстансов нужно нарисовать
    this.mesh.geometry.instanceCount = registry.highestEntityId + 1

    // ОТПРАВКА ДАННЫХ В ВИДЕОКАРТУ!
    // Это главная команда, которая льет мегабайты из RAM в VRAM.
    this.gpuBuffer.update()

    console.log()
  }
}
