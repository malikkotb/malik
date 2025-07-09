varying vec2 vUv; // varyings are used to pass data from the vertex shader to the fragment shader
uniform float time;
	void main() {

		vUv = uv;
        vec3 newPosition = position;
        newPosition.z += sin(time + position.x * 10.) * 0.5;
        // newPosition.x += sin(time) * 0.1;
        // newPosition.y += cos(time) * 0.1;

		vec4 mvPosition = modelViewMatrix * vec4( newPosition, 1.0 );

		gl_PointSize = ( 10.0 / -mvPosition.z );

		gl_Position = projectionMatrix * mvPosition;

	}