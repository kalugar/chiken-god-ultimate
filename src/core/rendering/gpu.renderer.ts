import {
  Buffer,
  Mesh,
  Geometry,
  Shader,
  GpuProgram,
  TextureSource,
  GlProgram,
  Container,
  UniformGroup,
  Matrix
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
  // private transformUniforms: UniformGroup
  // private meshMatrix: Matrix = new Matrix()

  private readonly REQUIRED_MASK = ComponentMask.Transform | ComponentMask.Render

  constructor(registry: ECSRegistry, atlasTexture: TextureSource, root: Container) {
    this.gpuBuffer = new Buffer({
      data: registry.f32,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    })

    const vertexData = new Float32Array([-0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5])
    const indexData = new Uint16Array([0, 1, 2, 0, 2, 3])

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

    const glProgram = GlProgram.from({
      vertex: glslVertex,
      fragment: glslFragment
    })
    const gpuProgram = GpuProgram.from({
      vertex: {
        source: unifiedWgsl,
        entryPoint: 'vs_main'
      },
      fragment: {
        source: unifiedWgsl,
        entryPoint: 'fs_main'
      }
    })

    // this.transformUniforms = new UniformGroup({
    //   uMyMatrix: { value: this.meshMatrix, type: 'mat3x3<f32>' }
    // })

    const shader = new Shader({
      glProgram,
      gpuProgram,
      resources: {
        uTexture: atlasTexture,
        uSampler: atlasTexture.style
        // uTransform: this.transformUniforms
      }
    })

    this.mesh = new Mesh<Geometry, Shader>({ geometry, shader })

    root.addChild(this.mesh)
  }

  public update(registry: ECSRegistry, deltaTime: number): void {
    this.mesh.geometry.instanceCount = registry.highestEntityId + 1

    this.gpuBuffer.update()
    // this.meshMatrix.copyFrom(this.mesh.worldTransform)
    // this.transformUniforms.update()
  }
}
