uniform sampler2D uTexture;
varying vec2 vUv;
varying float vCurlAmount;

void main() {
    vec2 uv = vUv;
    vec4 color;

    if (!gl_FrontFacing) {
        // Back of peeled page: mirror horizontally + darken
        uv.x = 1.0 - uv.x;
        color = texture2D(uTexture, uv) * 0.72;
    } else {
        color = texture2D(uTexture, uv);
        // Subtle darkening near the curl hinge on the front face
        color.rgb *= 1.0 - vCurlAmount * 0.12;
    }

    gl_FragColor = color;
    #include <colorspace_fragment>
}
