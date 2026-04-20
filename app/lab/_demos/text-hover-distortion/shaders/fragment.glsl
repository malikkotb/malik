uniform sampler2D uTexture;
uniform vec2 uMouse;
uniform vec2 uVelocity;
uniform vec2 uResolution;
uniform float uStrength;
uniform float uRadius;
uniform float uChromaStrength;

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

    // RGB displacement: each channel offset slightly along the distortion direction
    vec2 chromaDir = length(uVelocity) > 0.0001 ? normalize(uVelocity) : vec2(1.0, 0.0);
    float chromaAmount = length(offset) * uChromaStrength;
    vec2 rOffset = chromaDir * chromaAmount;
    vec2 bOffset = -chromaDir * chromaAmount;

    vec2 uvR = clamp(vUv + offset + rOffset, 0.0, 1.0);
    vec2 uvG = clamp(vUv + offset, 0.0, 1.0);
    vec2 uvB = clamp(vUv + offset + bOffset, 0.0, 1.0);

    float r = texture2D(uTexture, uvR).r;
    float g = texture2D(uTexture, uvG).g;
    float b = texture2D(uTexture, uvB).b;
    float a = texture2D(uTexture, uvG).a;

    gl_FragColor = vec4(r, g, b, a);

    #include <colorspace_fragment>
}
