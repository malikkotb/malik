'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { images } from './data';

// Vertex shader - creates curved surface with vertical sin wave
const vertexShader = `
  uniform float curveDepth;
  uniform float curveWidth;
  uniform float scrollY;

  varying vec2 vUv;
  varying float vDepth;

  void main() {
    vUv = uv;

    // Create vertical sin curve bulge - center of viewport (Y) dips inward
    // Use Y position to create the curve along the height
    float normalizedY = abs(position.y);

    // Sin curve for depth - center is deepest
    float curveAmount = 1.0 - smoothstep(0.0, curveWidth, normalizedY);
    float depth = -curveDepth * sin(curveAmount * 3.14159 * 0.5);

    vDepth = depth;

    vec3 pos = position;
    pos.z = depth;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// Fragment shader - renders tiled images with scroll
const fragmentShader = `
  uniform sampler2D textures[8];
  uniform float scrollY;
  uniform float columns;
  uniform float rows;
  uniform float gap;
  uniform float aspectRatio;
  uniform vec2 resolution;

  varying vec2 vUv;
  varying float vDepth;

  void main() {
    // Apply scroll offset to UV
    vec2 uv = vUv;
    uv.y = fract(uv.y + scrollY);

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

    // Apply gap - shrink the image area
    float gapHalf = gap * 0.5;
    vec2 imageUV = (cellUV - gapHalf) / (1.0 - gap);

    // Check if we're in the gap area
    if (imageUV.x < 0.0 || imageUV.x > 1.0 || imageUV.y < 0.0 || imageUV.y > 1.0) {
      discard;
    }

    // Correct aspect ratio (4:5 images in variable cells)
    float targetAspect = 4.0 / 5.0;
    float cellAspect = (cellWidth * resolution.x) / (cellHeight * resolution.y);

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

    // Subtle depth-based darkening for 3D feel
    float depthShade = 1.0 + vDepth * 0.15;
    color.rgb *= depthShade;

    gl_FragColor = color;
  }
`;

export default function GalleryMesh({ scrollState, config }) {
  const meshRef = useRef();
  const materialRef = useRef();
  const { size } = useThree();

  // Create geometry with subdivisions for smooth curve
  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(4, 6, 64, 96);
  }, []);

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
  const uniforms = useMemo(() => ({
    textures: { value: textures },
    scrollY: { value: 0 },
    curveDepth: { value: config.curveDepth },
    curveWidth: { value: config.curveWidth },
    columns: { value: config.columns },
    rows: { value: config.rows },
    gap: { value: config.gap },
    aspectRatio: { value: 4 / 5 },
    resolution: { value: new THREE.Vector2(size.width, size.height) },
  }), [textures]);

  // Update uniforms when config changes
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.curveDepth.value = config.curveDepth;
      materialRef.current.uniforms.curveWidth.value = config.curveWidth;
      materialRef.current.uniforms.columns.value = config.columns;
      materialRef.current.uniforms.rows.value = config.rows;
      materialRef.current.uniforms.gap.value = config.gap;
    }
  }, [config.curveDepth, config.curveWidth, config.columns, config.rows, config.gap]);

  // Update resolution on resize
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.resolution.value.set(size.width, size.height);
    }
  }, [size.width, size.height]);

  // Animation loop
  useFrame(() => {
    if (!materialRef.current) return;

    const state = scrollState.current;

    // Smooth scroll
    state.currentY += (state.targetY - state.currentY) * config.smoothing;

    // Update shader uniform
    materialRef.current.uniforms.scrollY.value = state.currentY;
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
