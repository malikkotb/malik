uniform float uTime;
uniform sampler2D uTexture;
uniform sampler2D uDisplacement;
uniform vec4 resolution;
uniform vec2 uQuadOffset;    // quad center in normalized coords
uniform vec2 uQuadSize;      // quad size in normalized coords

varying vec2 vUv;

float PI = 3.14159265359;

void main() {
    // Convert local UV to screen-space for displacement sampling
    vec2 screenUv = vUv * uQuadSize + uQuadOffset;

    vec4 displacement = texture2D(uDisplacement, screenUv);
    float theta = displacement.r * 2.0 * PI; // 0 to 2*PI, an angle

    vec2 dir = vec2(sin(theta), cos(theta));

    vec2 uv = vUv + dir * displacement.r * 0.1;

    vec4 color = texture2D(uTexture, uv);

    gl_FragColor = color;
}
