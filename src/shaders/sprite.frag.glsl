in vec4 vColor;
in vec2 vUV;
uniform sampler2D uTexture;
out vec4 finalColor;

void main() {
    vec4 texColor = texture(uTexture, vUV);
    finalColor = vec4(texColor.rgb * vColor.rgb * vColor.a, texColor.a * vColor.a);
}