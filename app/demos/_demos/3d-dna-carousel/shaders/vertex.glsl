varying vec2 vUv;
varying float vDistanceFromCenter;

uniform float uCurvature;

void main() {
  vUv = uv;

  // Apply subtle curvature to match cylinder surface
  vec3 pos = position;
  float curve = (uv.x - 0.5) * uCurvature;
  pos.z += curve * curve * 0.5;

  // Calculate distance from center for effects
  vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
  vDistanceFromCenter = length(worldPosition.xz);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
