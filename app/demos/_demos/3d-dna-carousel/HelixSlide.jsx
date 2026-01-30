'use client';

import { useRef, useMemo, useEffect, forwardRef } from 'react';
import * as THREE from 'three';

// Shared geometry - created once and reused by all slides
const sharedGeometry = new THREE.PlaneGeometry(1, 1, 16, 16);

// Vertex Shader
const vertexShader = `
  varying vec2 vUv;
  varying float vDistanceFromCenter;

  uniform float uCurvature;

  void main() {
    vUv = uv;

    // Apply subtle curvature to match cylinder surface
    vec3 pos = position;
    float curve = (uv.x - 0.5) * uCurvature;
    pos.z += curve * curve * 0.5;

    // Calculate distance from center for effects
    vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
    vDistanceFromCenter = length(worldPosition.xz);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// Fragment Shader
const fragmentShader = `
  varying vec2 vUv;
  varying float vDistanceFromCenter;

  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uOpacity;

  void main() {
    vec4 texColor = texture2D(uTexture, vUv);

    // Subtle vignette for depth
    float vignette = 1.0 - smoothstep(0.3, 0.7, length(vUv - 0.5) * 1.5);

    vec3 finalColor = texColor.rgb * (0.9 + vignette * 0.1);

    gl_FragColor = vec4(finalColor, texColor.a * uOpacity);
  }
`;

// Default placeholder texture
const defaultPlaceholderTexture = (() => {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#333333';
  ctx.fillRect(0, 0, 16, 16);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
})();

const HelixSlide = forwardRef(function HelixSlide({
  slideData,
  opacity = 1,
}, ref) {
  const meshRef = ref || useRef();
  const materialRef = useRef();
  const textureRef = useRef(null);

  // Create uniforms once
  const uniforms = useMemo(() => ({
    uTexture: { value: defaultPlaceholderTexture },
    uTime: { value: 0 },
    uOpacity: { value: opacity },
    uCurvature: { value: 0.3 },
  }), []);

  // Update opacity uniform when it changes
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uOpacity.value = opacity;
    }
  }, [opacity]);

  // Load texture
  useEffect(() => {
    if (!slideData.texture) return;

    const loader = new THREE.TextureLoader();
    let mounted = true;

    loader.load(slideData.texture, (texture) => {
      if (!mounted) return;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.colorSpace = THREE.SRGBColorSpace;
      textureRef.current = texture;
      if (materialRef.current) {
        materialRef.current.uniforms.uTexture.value = texture;
      }
    });

    return () => {
      mounted = false;
      if (textureRef.current && textureRef.current !== defaultPlaceholderTexture) {
        textureRef.current.dispose();
      }
    };
  }, [slideData.texture]);

  return (
    <mesh
      ref={meshRef}
      geometry={sharedGeometry}
    >
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
});

export default HelixSlide;
