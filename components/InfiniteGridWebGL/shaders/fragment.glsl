varying vec2 vUv;
uniform sampler2D uTexture;
uniform vec3 uColor;
uniform float uOpacity;
uniform vec2 uOffset;
uniform float uTime;

void main() {
  vec2 uv = vUv;

  // UV distortion based on drag
  uv.x += uOffset.x * 0.02 * (0.5 - abs(vUv.y - 0.5));
  uv.y += uOffset.y * 0.02 * (0.5 - abs(vUv.x - 0.5));

  vec4 texColor = texture2D(uTexture, uv);
  vec3 finalColor = mix(texColor.rgb, uColor, 0.0);

  gl_FragColor = vec4(finalColor, texColor.a * uOpacity);
}
