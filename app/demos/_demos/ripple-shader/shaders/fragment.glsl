uniform float uTime;
uniform sampler2D uTexture;
uniform sampler2D uDisplacement;
uniform vec4 resolution;

varying vec2 vUv;

float PI = 3.14159265359;

void main() {

    vec4 displacement = texture2D(uDisplacement, vUv);
    float theta = displacement.r * 2.0 * PI; // 0 to 2*PI, an angle

    vec2 dir = vec2(sin(theta), cos(theta));

    vec2 uv = vUv + dir * displacement.r * 0.1;    

    vec4 color = texture2D(uTexture, uv);

    gl_FragColor = color;
    // to debug the displacement, we can just return the displacement texture
    // gl_FragColor = displacement;
}
