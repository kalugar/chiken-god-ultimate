in vec2 aPosition; 

// Атрибуты инстанса
in vec2 aPositionOffset; 
in vec2 aScale;
in float aRotation;
in vec2 aAnchor;
in vec2 aSkew;
in vec4 aUVRect;
in vec2 aOrigSize;
in vec4 aPackedColor; 

// Встроенные матрицы PixiJS
uniform mat3 uProjectionMatrix;
uniform mat3 uWorldTransformMatrix;

out vec4 vColor;
out vec2 vUV;

void main() {
  vec2 currentScale = aOrigSize * aScale * ceil(aPackedColor.a);

  vec2 pos = aPosition - aAnchor;
  pos *= currentScale;
  
  float tanX = tan(aSkew.x);
  float tanY = tan(aSkew.y);
  pos = vec2(pos.x + pos.y * tanX, pos.y + pos.x * tanY);
  
  float c = cos(aRotation);
  float s = sin(aRotation);
  pos = vec2(pos.x * c - pos.y * s, pos.x * s + pos.y * c);
  
  pos += aPositionOffset;

  gl_Position = vec4((uProjectionMatrix * uWorldTransformMatrix * vec3(pos, 1.0)).xy, 0.0, 1.0);
  
  vec2 baseUV = aPosition + 0.5; 
  vUV = aUVRect.xy + baseUV * aUVRect.zw;
  vColor = aPackedColor;
}