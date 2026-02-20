'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { images } from './data';

// Vertex shader - creates curved surface with cosine dome
const vertexShader = `
  uniform float curveDepth;
  uniform float scrollX;
  uniform float halfWidth;

  varying vec2 vUv;

  void main() {
    vUv = uv;

    // Full-width dome: cosine curve spanning entire geometry
    float t = abs(position.x) / halfWidth;  // Normalize to 0-1
    float depth = -curveDepth * cos(t * 1.5708);  // 1.5708 = π/2

    vec3 pos = position;
    pos.z = depth;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// Fragment shader - renders tiled images with scroll
const fragmentShader = `
  uniform sampler2D textures[8];
  uniform float scrollX;
  uniform float columns;
  uniform float rows;
  uniform float gap;
  uniform float aspectRatio;
  uniform vec2 resolution;

  varying vec2 vUv;

  void main() {
    // Apply scroll offset to UV
    vec2 uv = vUv;
    uv.x = fract(uv.x + scrollX);

    // Calculate grid cell
    float cellWidth = 1.0 / columns;
    float cellHeight = 1.0 / rows;

    // Determine which cell we're in
    float col = floor(uv.x / cellWidth);
    float row = floor(uv.y / cellHeight);

    // Get local UV within the cell (0-1)
    vec2 cellUV = vec2(
      fract(uv.x / cellWidth),
      fract(uv.y / cellHeight)
    );

    // Calculate cell aspect ratio in pixels
    float cellAspect = (cellWidth * resolution.x) / (cellHeight * resolution.y);

    // Apply gap - adjust for aspect ratio to keep visual gap equal
    float gapHalf = gap * 0.5;
    vec2 gapAdjusted = vec2(gapHalf, gapHalf);

    // Scale gap based on cell aspect to maintain equal pixel spacing
    if (cellAspect > 1.0) {
      // Cell is wider - reduce horizontal gap
      gapAdjusted.x = gapHalf / cellAspect;
    } else {
      // Cell is taller - reduce vertical gap
      gapAdjusted.y = gapHalf * cellAspect;
    }

    vec2 imageUV = (cellUV - gapAdjusted) / (1.0 - gapAdjusted * 2.0);

    // Check if we're in the gap area
    if (imageUV.x < 0.0 || imageUV.x > 1.0 || imageUV.y < 0.0 || imageUV.y > 1.0) {
      discard;
    }

    // Correct aspect ratio (4:5 portrait images)
    float targetAspect = 4.0 / 5.0;

    vec2 finalUV = imageUV;
    if (cellAspect > targetAspect) {
      // Cell is wider than image - fit height, crop width
      float scale = targetAspect / cellAspect;
      finalUV.x = (imageUV.x - 0.5) * scale + 0.5;
    } else {
      // Cell is taller than image - fit width, crop height
      float scale = cellAspect / targetAspect;
      finalUV.y = (imageUV.y - 0.5) * scale + 0.5;
    }

    // Clamp UVs
    finalUV = clamp(finalUV, 0.0, 1.0);

    // Calculate which texture to use (infinite tiling)
    int totalImages = 8;
    int idx = int(mod(row * columns + col, float(totalImages)));

    // Sample the correct texture
    vec4 color;
    if (idx == 0) color = texture2D(textures[0], finalUV);
    else if (idx == 1) color = texture2D(textures[1], finalUV);
    else if (idx == 2) color = texture2D(textures[2], finalUV);
    else if (idx == 3) color = texture2D(textures[3], finalUV);
    else if (idx == 4) color = texture2D(textures[4], finalUV);
    else if (idx == 5) color = texture2D(textures[5], finalUV);
    else if (idx == 6) color = texture2D(textures[6], finalUV);
    else color = texture2D(textures[7], finalUV);

    gl_FragColor = color;
  }
`;

export default function GalleryMesh({ scrollState, config }) {
  const meshRef = useRef();
  const materialRef = useRef();
  const { size } = useThree();

  // Track smoothed velocity for curve activation
  const smoothedVelocity = useRef(0);
  const lastScrollX = useRef(0);

  // Create geometry with subdivisions for smooth curve
  // Make it responsive to viewport aspect ratio
  const geometry = useMemo(() => {
    const aspect = size.width / size.height;
    const height = 4;
    const width = height * aspect;
    return new THREE.PlaneGeometry(width, height, 96, 64);
  }, [size.width, size.height]);

  // Load all textures
  const textures = useMemo(() => {
    if (typeof window === 'undefined') return [];
    const loader = new THREE.TextureLoader();
    return images.map(img => {
      const tex = loader.load(img.src);
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      return tex;
    });
  }, []);

  // Create uniforms
  const uniforms = useMemo(() => {
    const aspect = size.width / size.height;
    const height = 4;
    const width = height * aspect;
    return {
      textures: { value: textures },
      scrollX: { value: 0 },
      curveDepth: { value: config.curveDepth },
      columns: { value: config.columns },
      rows: { value: config.rows },
      gap: { value: config.gap },
      aspectRatio: { value: 4 / 5 },
      resolution: { value: new THREE.Vector2(size.width, size.height) },
      halfWidth: { value: width / 2 },
    };
  }, [textures]);

  // Update uniforms when config changes
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.curveDepth.value = config.curveDepth;
      materialRef.current.uniforms.columns.value = config.columns;
      materialRef.current.uniforms.rows.value = config.rows;
      materialRef.current.uniforms.gap.value = config.gap;
    }
  }, [config.curveDepth, config.columns, config.rows, config.gap]);

  // Update resolution and halfWidth on resize
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.resolution.value.set(size.width, size.height);
      const aspect = size.width / size.height;
      const height = 4;
      const width = height * aspect;
      materialRef.current.uniforms.halfWidth.value = width / 2;
    }
  }, [size.width, size.height]);

  // Animation loop
  useFrame(() => {
    if (!materialRef.current) return;

    const state = scrollState.current;

    // Smooth scroll
    state.currentX += (state.targetX - state.currentX) * config.smoothing;

    // Calculate scroll velocity (how fast the scroll position is changing)
    const scrollDelta = Math.abs(state.currentX - lastScrollX.current);
    lastScrollX.current = state.currentX;

    // Smooth the velocity - ramp up quickly, decay faster
    const targetVelocity = Math.min(scrollDelta * 80, 1); // Normalize to 0-1
    const velocitySmoothing = targetVelocity > smoothedVelocity.current ? 0.15 : 0.12;
    smoothedVelocity.current += (targetVelocity - smoothedVelocity.current) * velocitySmoothing;

    // Update shader uniforms
    materialRef.current.uniforms.scrollX.value = state.currentX;
    materialRef.current.uniforms.curveDepth.value = config.curveDepth * smoothedVelocity.current;
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
