uniform sampler2D uTexture;
uniform vec2 uMouse;
uniform vec2 uVelocity;
uniform vec2 uResolution;
uniform float uStrength;
uniform float uRadius;

varying vec2 vUv;

void main() {
    // Mouse position in UV space
    vec2 mouseUv = uMouse / uResolution;
    // Flip Y: screen Y is top-down, UV Y is bottom-up
    mouseUv.y = 1.0 - mouseUv.y;

    // Aspect-corrected distance from mouse
    float aspect = uResolution.x / uResolution.y;
    vec2 diff = vUv - mouseUv;
    diff.x *= aspect;

    float dist = length(diff);

    // Smooth falloff within radius
    float influence = smoothstep(uRadius, 0.0, dist);

    // Displace UVs along mouse velocity, amplified by strength
    vec2 offset = uVelocity * uStrength * influence;

    vec2 distortedUv = clamp(vUv + offset, 0.0, 1.0);

    gl_FragColor = texture2D(uTexture, distortedUv);

    #include <colorspace_fragment>
}
