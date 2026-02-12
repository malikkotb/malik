varying vec2 vUv;
varying float vDepth;

void main() {
  vUv = uv;

  // Calculate world position for depth
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * worldPosition;

  // Normalize depth - negative because camera looks down -Z
  // Closer objects have smaller negative values
  vDepth = -viewPosition.z;

  gl_Position = projectionMatrix * viewPosition;
}
