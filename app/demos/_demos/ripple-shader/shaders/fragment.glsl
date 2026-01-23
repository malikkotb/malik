uniform float uTime;
uniform sampler2D uTexture;
uniform sampler2D uDisplacement;
uniform vec4 resolution;

varying vec2 vUv;

float PI = 3.14159265359;

void main() {

    veec2 newUV = (vUv - vec2(0.5)) * resolution.zw + vec2(0.5);
    
    gl_FragColor = vec4(vUv, 0.0, 1.0);
}
