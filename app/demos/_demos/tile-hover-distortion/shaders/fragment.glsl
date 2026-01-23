uniform float time;
uniform sampler2D uDataTexture;
uniform sampler2D uTexture;
uniform vec4 uResolution;

varying vec2 vUv;

void main() {
    // Adjust UV for aspect ratio (object-fit: cover)
    vec2 newUV = (vUv - vec2(0.5)) * uResolution.zw + vec2(0.5);

    // Sample displacement from DataTexture
    vec4 offset = texture2D(uDataTexture, vUv);

    // Apply displacement to texture sampling (0.02 controls intensity)
    vec4 color = texture2D(uTexture, newUV - 0.02 * offset.rg);

    gl_FragColor = color;
    #include <colorspace_fragment>
}
