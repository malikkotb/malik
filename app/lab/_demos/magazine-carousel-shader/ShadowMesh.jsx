'use client';

import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { config } from './config';

// Vertex shader - simple plane
const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment shader - diagonal shadow following corner lift
const fragmentShader = `
  uniform float uFlipProgress;
  uniform float uPeekProgress;
  uniform float uShadowIntensity;
  uniform float uShadowSpread;
  uniform float uShadowSoftness;
  uniform float uPageWidth;
  uniform float uPageHeight;

  varying vec2 vUv;

  void main() {
    float totalProgress = uFlipProgress + uPeekProgress;

    // Bottom-right corner (in UV space: 1.0, 0.0)
    vec2 cornerBR = vec2(1.0, 0.0);

    // Calculate diagonal fold line position
    // The fold moves from corner toward opposite corner
    float foldProgress = totalProgress * 1.4; // Scale to cover full diagonal

    // Diagonal direction (bottom-right to top-left)
    vec2 diagonalDir = normalize(vec2(-1.0, 1.0));

    // Shadow origin moves along the diagonal
    vec2 shadowOrigin = cornerBR + diagonalDir * foldProgress * 0.7;

    // Distance from current UV to shadow origin
    float distFromOrigin = distance(vUv, shadowOrigin);

    // Distance from diagonal fold line
    vec2 toPoint = vUv - cornerBR;
    float foldLinePos = dot(toPoint, diagonalDir);
    float distFromFold = abs(foldLinePos - foldProgress * 0.5);

    // Shadow spread increases with lift
    float dynamicSpread = uShadowSpread * (1.0 + totalProgress * 1.5);

    // Softness increases with lift height
    float dynamicSoftness = uShadowSoftness * (1.0 + totalProgress * 2.0);

    // Create diagonal shadow gradient
    float foldShadow = 1.0 - smoothstep(0.0, dynamicSpread, distFromFold);

    // Add radial shadow from corner
    float cornerShadow = 1.0 - smoothstep(0.0, dynamicSpread * 1.5, distFromOrigin);

    // Combine fold and corner shadows
    float combinedShadow = max(foldShadow * 0.6, cornerShadow * 0.4);

    // Shadow is stronger when page is partially flipped (peaks at mid-flip)
    float flipFactor = sin(totalProgress * 3.14159);
    combinedShadow *= flipFactor;

    // Apply softness blur effect (simulate with gradient falloff)
    combinedShadow = smoothstep(0.0, dynamicSoftness, combinedShadow);

    // Apply intensity
    float alpha = combinedShadow * uShadowIntensity;

    // Slight color variation for depth
    vec3 shadowColor = vec3(0.0, 0.0, 0.02);

    gl_FragColor = vec4(shadowColor, alpha);
  }
`;

export default function ShadowMesh({ flipProgress, peekProgress = 0, position }) {
  const materialRef = useRef();

  // Create geometry
  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(config.pageWidth, config.pageHeight, 1, 1);
  }, []);

  // Create shader material
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uFlipProgress: { value: 0 },
        uPeekProgress: { value: 0 },
        uShadowIntensity: { value: config.shadowIntensity },
        uShadowSpread: { value: config.shadowSpread },
        uShadowSoftness: { value: config.shadowSoftness },
        uPageWidth: { value: config.pageWidth },
        uPageHeight: { value: config.pageHeight },
      },
      transparent: true,
      depthWrite: false,
    });
  }, []);

  // Update uniforms
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uFlipProgress.value = flipProgress;
      materialRef.current.uniforms.uPeekProgress.value = peekProgress;
    }
  }, [flipProgress, peekProgress]);

  return (
    <mesh position={position} renderOrder={-1} geometry={geometry}>
      <primitive object={shaderMaterial} ref={materialRef} attach="material" />
    </mesh>
  );
}
