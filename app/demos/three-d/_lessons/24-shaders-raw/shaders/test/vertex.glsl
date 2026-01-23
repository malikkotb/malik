// matrices are uniform variables bc. they are the same for all vertices
// to apply a matrix we multiply

// projectionMatrix transforms the coordinats into clip space coordinates

// viewMatrix applies transformations relative to the camera
// (position, rotation, field of view, near, far)

// modelMatrix apply transformations relative to the Mesh (position, rotation, scale)

uniform mat4 projectionMatrix;

uniform mat4 viewMatrix;

uniform mat4 modelMatrix;

// attributes are data that changes between each vertex
// by default we have position attribute
// sent by three.js through the geometry
// geometry, i.e. BufferGeometry, has following attributes:
// position = positions of the vertives
// normal = normals of the vertices (the outsides of the vertices), for lighting
// uv = texture coordinates of the vertices
attribute vec3 position;
attribute vec2 uv;

attribute float aRandom;

// gl_Position is the position of the vertex (on the screen)
// vec4 because its in clip space
// z index is always for depth
// we transform vec3 position to vec4 by adding a 1.0 for the w component

// we are going to color the fragments with the aRandom but we cannot use attributes in the fragment shader

// VARYINGS
// we can use varying to send data from the vertex shader to the fragment shader
varying float vRandom;
varying vec2 vUv;
varying float vElevation;

// Uniforms
// useful for having the same shader but with different results
// useful for being able to tweak values or animating the value
// can be used in both vertex and fragment shader

// e.g. we can use a uniform to control the frequency of the waves
// uniform float uFrequency;

// use a vec2 to control each axis of the plane
uniform vec2 uFrequency;
// time uniform for animation
uniform float uTime;
// wave intensity uniform
uniform float uWaveIntensity;



void main() {


    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    // modelPosition.z += aRandom * 0.1; // terrain effect or spikes effect

    float elevation = sin(modelPosition.x * uFrequency.x - uTime) * uWaveIntensity;
    elevation += sin(modelPosition.y * uFrequency.y - uTime) * uWaveIntensity;

    modelPosition.z += elevation;

    // Animate waves using time
    // modelPosition.z += sin(modelPosition.x * uFrequency.x - uTime) * 0.1; // get waves
    // modelPosition.z += sin(modelPosition.y * uFrequency.y - uTime) * 0.1; // get waves

    vec4 viewPosition = viewMatrix * modelPosition;

    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    vUv = uv;
    vElevation = elevation;
    // vRandom = aRandom;

//   gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0); 
}