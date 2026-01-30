varying vec2 vUv;
uniform vec2 uOffset;
uniform float uTime;

#define PI 3.1415926535897932384626433832795

void main() {
  vUv = uv;
  vec3 pos = position;

  // Subtle distortion based on drag velocity
  float waveX = sin(uv.y * PI);
  float waveY = sin(uv.x * PI);
  pos.x += waveX * uOffset.x * 0.1;
  pos.y += waveY * uOffset.y * 0.1;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
