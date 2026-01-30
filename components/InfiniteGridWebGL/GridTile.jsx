'use client';

import { forwardRef, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Shared geometry - created once and reused by all tiles
const sharedGeometry = new THREE.PlaneGeometry(1, 1, 8, 8);

// Vertex shader with subtle distortion based on velocity
const vertexShader = `
  varying vec2 vUv;
  uniform vec2 uOffset;

  #define PI 3.1415926535897932384626433832795

  void main() {
    vUv = uv;
    vec3 pos = position;

    // Subtle distortion based on drag velocity
    float waveX = sin(uv.y * PI);
    float waveY = sin(uv.x * PI);
    pos.x += waveX * uOffset.x * 0.1;
    pos.y += waveY * uOffset.y * 0.1;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// Fragment shader - simple colored tile
const fragmentShader = `
  varying vec2 vUv;
  uniform vec3 uColor;
  uniform float uOpacity;

  void main() {
    // Add subtle gradient for depth
    float gradient = 1.0 - (vUv.y * 0.1);
    vec3 finalColor = uColor * gradient;
    gl_FragColor = vec4(finalColor, uOpacity);
  }
`;

export const GridTile = forwardRef(function GridTile({ size, dragState, color = '#c9c9c9' }, ref) {
  const materialRef = useRef();

  const uniforms = useMemo(() => ({
    uColor: { value: new THREE.Color(color) },
    uOpacity: { value: 1.0 },
    uOffset: { value: new THREE.Vector2(0, 0) },
  }), [color]);

  useFrame(() => {
    if (materialRef.current && dragState.current) {
      const state = dragState.current;
      materialRef.current.uniforms.uOffset.value.set(
        state.velocityX * 0.0005,
        state.velocityY * 0.0005
      );
    }
  });

  return (
    <mesh ref={ref} scale={[size * 0.9, size * 0.9, 1]} geometry={sharedGeometry}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
});
