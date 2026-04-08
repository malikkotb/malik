uniform sampler2D uTexture;
uniform sampler2D uDataTexture;
uniform vec2 uResolution;
uniform float uStrength;

varying vec2 vUv;

void main() {
    // Sample the velocity field
    vec3 disp = texture2D(uDataTexture, vUv).rgb;

    float aspect = uResolution.x / uResolution.y;

    // RG channels store velocity direction, apply strength
    vec2 distortion = disp.xy * uStrength;
    distortion.x /= aspect;

    vec2 distortedUv = vUv - distortion;

    vec4 color = texture2D(uTexture, distortedUv);
    gl_FragColor = color;

    #include <colorspace_fragment>
}
