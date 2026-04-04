uniform sampler2D uTexture;
uniform sampler2D uDisplacement;
uniform vec2 uResolution;
uniform float uStrength;

varying vec2 vUv;

void main() {
    vec4 disp = texture2D(uDisplacement, vUv);

    // RG channels encode velocity direction: 0.5 = neutral, 0 = negative, 1 = positive
    vec2 offset = (disp.rg - 0.5) * 2.0 * uStrength;

    vec2 distortedUv = clamp(vUv + offset, 0.0, 1.0);

    gl_FragColor = texture2D(uTexture, distortedUv);

    #include <colorspace_fragment>
}
