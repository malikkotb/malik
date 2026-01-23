#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform float u_noiseScale;
uniform float u_timeScale;
uniform float u_smoothMin;
uniform float u_smoothMax;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform vec3 u_color3;
uniform vec3 u_color4;
uniform float u_mouseRadius;
uniform float u_mouseStrength;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                        0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                        -0.577350269189626,  // -1.0 + 2.0 * C.x
                        0.024390243902439); // 1.0 / 41.0
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i); // Avoid truncation effects in permutation
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));

    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st.x *= u_resolution.x/u_resolution.y;

    // Calculate mouse interaction
    vec2 mousePos = u_mouse.xy / u_resolution.xy;
    mousePos.x *= u_resolution.x/u_resolution.y;

    vec2 toMouse = st - mousePos;
    float distToMouse = length(toMouse);

    // Ultra-smooth falloff with multiple easing layers
    float mouseInfluence = smoothstep(u_mouseRadius * 1.5, 0.0, distToMouse);
    // Apply smootherstep twice for even smoother falloff
    mouseInfluence = mouseInfluence * mouseInfluence * (3.0 - 2.0 * mouseInfluence);
    mouseInfluence = mouseInfluence * mouseInfluence * (3.0 - 2.0 * mouseInfluence);

    // Add subtle pulsing based on distance
    float pulse = sin(u_time * 2.0) * 0.05 + 0.95;
    mouseInfluence *= pulse;

    // Calculate angle from mouse
    float angle = atan(toMouse.y, toMouse.x);

    // Add very subtle rotation that flows with the animation
    float rotationAmount = sin(distToMouse * 8.0 - u_time) * 0.1 * mouseInfluence;
    angle += rotationAmount;

    // Create circular flow around mouse instead of pure radial push
    float tangentAngle = angle + 1.5708; // Add 90 degrees for tangent
    vec2 radialDir = vec2(cos(angle), sin(angle));
    vec2 tangentDir = vec2(cos(tangentAngle), sin(tangentAngle));

    // Mix radial and tangent for swirling motion
    float swirl = sin(distToMouse * 10.0 - u_time * 2.0) * 0.5 + 0.5;
    vec2 flowDir = mix(radialDir, tangentDir, swirl * 0.3);

    // Very subtle wave that flows with the pattern
    float wave = sin(distToMouse * 12.0 - u_time * 1.5) * 0.05;

    // Apply distortion with ultra-smooth easing
    float distortionAmount = mouseInfluence * mouseInfluence * u_mouseStrength * (1.0 + wave);
    vec2 distortion = flowDir * distortionAmount;

    vec2 distortedSt = st + distortion;

    vec3 color = vec3(0.0);
    vec2 pos = vec2(distortedSt*u_noiseScale);

    float DF = 0.0;

    // Add a random position
    float a = 0.0;
    vec2 vel = vec2(u_time*u_timeScale);
    DF += snoise(pos+vel)*.25+.25;

    // Add a random position
    a = snoise(pos*vec2(cos(u_time*0.15),sin(u_time*0.1))*0.1)*3.1415;
    vel = vec2(cos(a),sin(a));
    DF += snoise(pos+vel)*.25+.25;

    // Create pattern mask
    float pattern = smoothstep(u_smoothMin, u_smoothMax, fract(DF));

    // Create multi-color gradient based on noise for the pattern
    vec3 gradientColor;

    // Use the noise value to determine which colors to blend
    float noiseValue = fract(DF * 2.0); // Adjust multiplier for more/less color variation

    if (noiseValue < 0.33) {
        // Blend between color2 and color3
        float t = noiseValue / 0.33;
        gradientColor = mix(u_color2, u_color3, t);
    } else if (noiseValue < 0.66) {
        // Blend between color3 and color4
        float t = (noiseValue - 0.33) / 0.33;
        gradientColor = mix(u_color3, u_color4, t);
    } else {
        // Blend between color4 and color2 (loop back)
        float t = (noiseValue - 0.66) / 0.34;
        gradientColor = mix(u_color4, u_color2, t);
    }

    // Mix between gradient colors and color1 (base) based on pattern
    // When pattern = 0 (lines/pattern), show gradient colors
    // When pattern = 1 (background), show color1 (base)
    vec3 finalColor = mix(gradientColor, u_color1, pattern);

    gl_FragColor = vec4(finalColor, 1.0);
}