varying vec2 vUv;
varying float vDistanceFromCenter;

uniform sampler2D uTexture;
uniform float uTime;
uniform float uOpacity;

void main() {
  vec4 texColor = texture2D(uTexture, vUv);

  // Subtle vignette for depth
  float vignette = 1.0 - smoothstep(0.3, 0.7, length(vUv - 0.5) * 1.5);

  vec3 finalColor = texColor.rgb * (0.9 + vignette * 0.1);

  gl_FragColor = vec4(finalColor, texColor.a * uOpacity);
}
