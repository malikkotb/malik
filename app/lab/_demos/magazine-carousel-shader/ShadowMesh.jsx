'use client';

import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { config } from './config';

// Shadow cast on the page underneath the flipping page.
// The spine-based fold creates a vertical shadow that spreads outward
// from the spine as the page lifts up, then fades as the page passes over.
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uFlipProgress;
  uniform float uPeekProgress;
  uniform float uShadowIntensity;
  uniform float uShadowSpread;
  uniform float uShadowSoftness;

  varying vec2 vUv;

  const float PI = 3.14159265359;

  void main() {
    float totalProgress = uFlipProgress + uPeekProgress;

    // UV: (0,0) = bottom-left, (1,1) = top-right of the page this shadow is on
    // Shadow comes from the spine side (left edge, u=0 for right page or u=1 for left page)

    // Distance from spine edge (left edge of right page = u=0)
    float distFromSpine = vUv.x;

    // Shadow spreads outward from spine as page lifts
    // Peak at mid-flip, symmetrical rise/fall
    float liftFactor = sin(totalProgress * PI);

    float dynamicSpread = uShadowSpread * (0.5 + liftFactor * 1.5);

    // Shadow falloff from spine
    float spineShadow = 1.0 - smoothstep(0.0, dynamicSpread, distFromSpine);

    // Also add a broad ambient darkening that peaks at mid-flip
    float broadDark = (1.0 - smoothstep(0.0, 0.8, distFromSpine)) * liftFactor * 0.4;

    float combined = max(spineShadow, broadDark);

    // Fade entirely when not flipping
    float intensity = combined * uShadowIntensity * liftFactor;

    gl_FragColor = vec4(0.0, 0.0, 0.0, intensity);
  }
`;

export default function ShadowMesh({ flipProgress, peekProgress = 0, position }) {
  const materialRef = useRef();

  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(config.pageWidth, config.pageHeight, 1, 1);
  }, []);

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
      },
      transparent: true,
      depthWrite: false,
    });
  }, []);

  useEffect(() => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uFlipProgress.value = flipProgress;
    materialRef.current.uniforms.uPeekProgress.value = peekProgress;
  }, [flipProgress, peekProgress]);

  return (
    <mesh position={position} renderOrder={5} geometry={geometry}>
      <primitive object={shaderMaterial} ref={materialRef} attach="material" />
    </mesh>
  );
}
