

attribute float aRandom;

// VARYINGS
varying float vRandom;
varying vec2 vUv;
varying float vElevation;

uniform vec2 uFrequency;
uniform float uTime;
uniform float uWaveIntensity;



void main() {


    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    float elevation = sin(modelPosition.x * uFrequency.x - uTime) * uWaveIntensity;
    elevation += sin(modelPosition.y * uFrequency.y - uTime) * uWaveIntensity;

    modelPosition.z += elevation;

    vec4 viewPosition = viewMatrix * modelPosition;

    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    vUv = uv;
    vElevation = elevation;
}