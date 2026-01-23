#define PI 3.14159265359

varying vec2 vUv;

uniform vec2 uMovementDirection;
uniform float uDistortionStrength;
uniform float uTime;



void main() {
    vec3 pos = position;
    
    // Calculate distortion based on movement direction
    // Create a single smooth curve per side, centered on the edge
    
    // For horizontal movement (left/right): one curve along Y axis, centered vertically at y = 0
    // Use cos to create a single smooth hump that peaks at y = 0
    float curveY = cos(pos.y * PI*0.5); // PI/2, creates one curve from -1 to 1
    float distortionX = curveY * uMovementDirection.x * uDistortionStrength;
    
    // For vertical movement (up/down): one curve along X axis, centered horizontally at x = 0
    // Use cos to create a single smooth hump that peaks at x = 0
    float curveX = cos(pos.x * PI*0.5); // PI/2, creates one curve from -1 to 1
    float distortionY = curveX * uMovementDirection.y * uDistortionStrength;
    
    // Apply distortion to position
    pos.x += distortionX;
    pos.y += distortionY;

    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(pos, 1.0);
    vUv = uv;
}