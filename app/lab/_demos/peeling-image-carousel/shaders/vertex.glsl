uniform float uPlaneHeight;
uniform float uScrollProgress;
uniform float uCurlRadius;
uniform float uCurlMaxHeight;

varying vec2 vUv;
varying float vCurlAmount;

void main() {
    vUv = uv;
    vec3 pos = position;

    float halfH = uPlaneHeight / 2.0;
    float maxCurlDist = uPlaneHeight * uCurlMaxHeight;

    // Anti-diagonal fold line constants (x + y = 0)
    const float INV_SQRT2 = 0.70711;
    float maxDiag = halfH * 1.41421; // halfH * sqrt(2)

    // Signed distance from anti-diagonal: positive = top-right, negative = bottom-left
    float signedDist = (pos.x + pos.y) * INV_SQRT2;

    float topCurlAmount = 0.0;
    float bottomCurlAmount = 0.0;

    if (uScrollProgress < 0.0) {
        topCurlAmount = smoothstep(-0.1, -0.9, uScrollProgress);
    } else if (uScrollProgress > 0.0) {
        bottomCurlAmount = smoothstep(0.1, 0.9, uScrollProgress);
    }

    vCurlAmount = topCurlAmount + bottomCurlAmount;

    // TOP-RIGHT CORNER CURL (entering from below)
    if (topCurlAmount > 0.001) {
        float hingeDist = maxDiag - topCurlAmount * maxCurlDist * 1.41421;
        float distFromHinge = signedDist - hingeDist;

        if (distFromHinge > 0.0) {
            float angle = min(distFromHinge / uCurlRadius, 4.71239);
            float delta = uCurlRadius * sin(angle) - distFromHinge;
            pos.x += delta * INV_SQRT2;
            pos.y += delta * INV_SQRT2;
            pos.z = uCurlRadius * (1.0 - cos(angle));
        }
    }

    // BOTTOM-RIGHT CORNER CURL (leaving through top)
    if (bottomCurlAmount > 0.001) {
        // Main diagonal fold line (x - y = 0): bottom-right is the positive side
        float signedDistBR = (pos.x - pos.y) * INV_SQRT2;
        float hingeDist = maxDiag - bottomCurlAmount * maxCurlDist * 1.41421;
        float distFromHinge = signedDistBR - hingeDist;

        if (distFromHinge > 0.0) {
            float angle = min(distFromHinge / uCurlRadius, 4.71239);
            float delta = uCurlRadius * sin(angle) - distFromHinge; // negative: pulls inward
            pos.x += delta * INV_SQRT2;   // moves left (inward)
            pos.y -= delta * INV_SQRT2;   // moves up (inward), delta is negative so double-neg
            pos.z = uCurlRadius * (1.0 - cos(angle));
        }
    }

    // Z-axis tilt for visual depth
    float zRotation = topCurlAmount * -0.3 + bottomCurlAmount * 0.3;
    float cosZ = cos(zRotation);
    float sinZ = sin(zRotation);
    vec2 rotatedXY = vec2(
        pos.x * cosZ - pos.y * sinZ,
        pos.x * sinZ + pos.y * cosZ
    );
    pos.x = rotatedXY.x;
    pos.y = rotatedXY.y;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
