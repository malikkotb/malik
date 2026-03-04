uniform float uPlaneHeight;
uniform float uScrollProgress;  // -1 (entering from below) to +1 (leaving through top)
uniform float uCurlRadius;
uniform float uCurlMaxHeight;   // 0.5 = 50% max curl

varying vec2 vUv;
varying float vCurlAmount;

void main() {
    vUv = uv;
    vec3 pos = position;

    float halfHeight = uPlaneHeight / 2.0;
    float maxCurlDist = uPlaneHeight * uCurlMaxHeight;

    // Calculate curl amount for each edge using smoothstep
    float topCurlAmount = 0.0;
    float bottomCurlAmount = 0.0;

    if (uScrollProgress < 0.0) {
        // Entering from below - curl top edge
        topCurlAmount = smoothstep(-0.1, -0.9, uScrollProgress);
    } else if (uScrollProgress > 0.0) {
        // Leaving through top - curl bottom edge
        bottomCurlAmount = smoothstep(0.1, 0.9, uScrollProgress);
    }

    vCurlAmount = topCurlAmount + bottomCurlAmount;

    // TOP EDGE CURL (entering)
    if (topCurlAmount > 0.001) {
        float hingeY = halfHeight - (topCurlAmount * maxCurlDist);

        if (pos.y > hingeY) {
            float distFromHinge = pos.y - hingeY;
            float angle = distFromHinge / uCurlRadius;
            angle = min(angle, 4.71239);  // Limit to ~270°

            // Cylindrical transformation - curl forward toward camera
            pos.y = hingeY + uCurlRadius * sin(angle);
            pos.z = uCurlRadius * (1.0 - cos(angle));
        }
    }

    // BOTTOM EDGE CURL (leaving)
    if (bottomCurlAmount > 0.001) {
        float hingeY = -halfHeight + (bottomCurlAmount * maxCurlDist);

        if (pos.y < hingeY) {
            float distFromHinge = hingeY - pos.y;
            float angle = distFromHinge / uCurlRadius;
            angle = min(angle, 4.71239);

            pos.y = hingeY - uCurlRadius * sin(angle);
            pos.z = uCurlRadius * (1.0 - cos(angle));
        }
    }

    // Rotate on Z-axis based on curl amount to reveal the peel
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
