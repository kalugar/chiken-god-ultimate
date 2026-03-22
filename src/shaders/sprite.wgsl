// Входные данные от нашего ECS (Float32Array)
struct VertexInput {
    @location(0) aPosition: vec2<f32>,
    @location(1) aPositionOffset: vec2<f32>,
    @location(2) aScale: vec2<f32>,
    @location(3) aRotation: f32,
    @location(4) aAnchor: vec2<f32>,
    @location(5) aSkew: vec2<f32>,
    @location(6) aUVRect: vec4<f32>,
    @location(7) aOrigSize: vec2<f32>,
    @location(8) aPackedColor: vec4<f32>, 
};

// Данные, которые Вершинный шейдер передает во Фрагментный.
// Объявлено ОДИН раз! Это спасает от кучи опечаток.
struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) vColor: vec4<f32>,
    @location(1) vUV: vec2<f32>,
};

// Глобальные матрицы PixiJS
struct GlobalUniforms {
    uProjectionMatrix: mat3x3<f32>,
    uWorldTransformMatrix: mat3x3<f32>,
    uWorldColorAlpha: vec4<f32>,
    uResolution: vec2<f32>,
};

@group(0) @binding(0) var<uniform> globalUniforms: GlobalUniforms;

@vertex
fn vs_main(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;

    let currentScale = input.aOrigSize * input.aScale * ceil(input.aPackedColor.a);

    var pos = input.aPosition - input.aAnchor;
    pos = pos * currentScale;
    
    let tanX = tan(input.aSkew.x);
    let tanY = tan(input.aSkew.y);
    pos = vec2<f32>(pos.x + pos.y * tanX, pos.y + pos.x * tanY);
    
    let c = cos(input.aRotation);
    let s = sin(input.aRotation);
    pos = vec2<f32>(pos.x * c - pos.y * s, pos.x * s + pos.y * c);
    
    pos = pos + input.aPositionOffset;

    let worldPos = globalUniforms.uProjectionMatrix * (globalUniforms.uWorldTransformMatrix * vec3<f32>(pos, 1.0));
    output.position = vec4<f32>(worldPos.x, worldPos.y, 0.0, 1.0);

    let baseUV = input.aPosition + vec2<f32>(0.5, 0.5);
    output.vUV = input.aUVRect.xy + baseUV * input.aUVRect.zw;
    output.vColor = input.aPackedColor;

    return output;
}

@group(1) @binding(0) var uTexture: texture_2d<f32>;
@group(1) @binding(1) var uSampler: sampler;

@fragment
// Обрати внимание: на вход идет та самая структура VertexOutput!
fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
    
    let texColor = textureSample(uTexture, uSampler, input.vUV);
    
    return vec4<f32>(
        texColor.rgb * input.vColor.rgb * input.vColor.a, 
        texColor.a * input.vColor.a
    );
}