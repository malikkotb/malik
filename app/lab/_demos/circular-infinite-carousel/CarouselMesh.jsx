'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { config } from './config';
import images from './data';

// Vertex shader - curves the plane into an elliptical arc with bulge effect
const vertexShader = `
  uniform float uRadiusY;
  uniform float uRadiusZ;
  uniform float uBulgeAmount;
  uniform float uScale;
  uniform float uScaleX;
  uniform float uScaleY;
  uniform float uVisibleTiles;
  uniform float uTotalImages;

  varying vec2 vUv;

  void main() {
    vUv = uv;

    // Scale the angular range based on visible tiles ratio
    // When showing fewer tiles, we use a smaller arc of the ellipse
    float arcRange = 3.14159 * (uVisibleTiles / uTotalImages);
    float angle = (uv.y - 0.5) * arcRange;

    float y = uRadiusY * sin(angle);
    float z = uRadiusZ * cos(angle);

    // Add bulge effect: scale x based on z position (depth)
    // When z is positive (closer to camera), scale is larger
    float normalizedZ = (z - (-uRadiusZ)) / (2.0 * uRadiusZ); // 0 to 1
    float bulgeScale = 1.0 + uBulgeAmount * normalizedZ;

    vec3 pos = vec3(position.x * bulgeScale, y, z);

    // Apply image-specific scaling (independent of ellipse geometry)
    pos.x *= uScaleX;
    pos.y *= uScaleY;

    // Apply overall scale
    pos *= uScale;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// Fragment shader - tiles images with scroll offset and gaps
const fragmentShader = `
  uniform sampler2D uTextures[8];
  uniform float uScrollOffset;
  uniform float uTotalImages;
  uniform float uVisibleTiles;
  uniform float uGapFraction;

  varying vec2 vUv;

  void main() {
    // Scale scroll to account for reduced tiling
    // scrollOffset is in UV space where 1.0 = cycle through all images
    // We need to scale it so scrolling feels the same regardless of visibleTiles
    float scaledScroll = uScrollOffset * (uTotalImages / uVisibleTiles);

    // Apply scroll in UV space BEFORE tiling (this creates smooth movement)
    float scrolledV = vUv.y + scaledScroll;

    // Tile into visibleTiles slots
    float scaledV = scrolledV * uVisibleTiles;
    float tileIndexFloat = floor(scaledV);
    float localV = fract(scaledV);

    // Map tile index to global image index (cycle through all 8)
    float globalIndex = mod(tileIndexFloat, uTotalImages);
    if (globalIndex < 0.0) globalIndex += uTotalImages;
    int imageIndex = int(globalIndex);

    // Calculate gap boundaries (gap at start and end of each image tile)
    float halfGap = uGapFraction * 0.5;

    // Discard pixels in gap regions
    if (localV < halfGap || localV > 1.0 - halfGap) {
      discard;
    }

    // Remap localV to account for gap (stretch the image to fill non-gap area)
    float remappedV = (localV - halfGap) / (1.0 - uGapFraction);

    // Create UV for texture sampling
    vec2 texUv = vec2(vUv.x, remappedV);

    // Sample the correct texture based on image index
    vec4 color;
    if (imageIndex == 0) color = texture2D(uTextures[0], texUv);
    else if (imageIndex == 1) color = texture2D(uTextures[1], texUv);
    else if (imageIndex == 2) color = texture2D(uTextures[2], texUv);
    else if (imageIndex == 3) color = texture2D(uTextures[3], texUv);
    else if (imageIndex == 4) color = texture2D(uTextures[4], texUv);
    else if (imageIndex == 5) color = texture2D(uTextures[5], texUv);
    else if (imageIndex == 6) color = texture2D(uTextures[6], texUv);
    else color = texture2D(uTextures[7], texUv);

    gl_FragColor = color;
  }
`;

export default function CarouselMesh({ scrollState, imageWidth, imageHeight, bulgeAmount, imageScale, visibleTiles }) {
  const meshRef = useRef();
  const materialRef = useRef();

  // Compute scale factor: when showing fewer tiles, mesh is proportionally smaller
  const arcScale = visibleTiles / config.totalImages;

  // Load all textures
  const textures = useLoader(
    THREE.TextureLoader,
    images.map((img) => img.src)
  );

  // Configure textures
  useMemo(() => {
    textures.forEach((texture) => {
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
    });
  }, [textures]);

  // Create shader material
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uRadiusY: { value: config.radiusY },
        uRadiusZ: { value: config.radiusZ },
        uBulgeAmount: { value: bulgeAmount },
        uScale: { value: imageScale },
        uScaleX: { value: imageWidth },
        uScaleY: { value: imageHeight },
        uScrollOffset: { value: 0 },
        uTotalImages: { value: config.totalImages },
        uVisibleTiles: { value: visibleTiles },
        uGapFraction: { value: config.gapFraction },
        uTextures: { value: textures },
      },
      side: THREE.DoubleSide,
      transparent: true,
    });
  }, [textures, bulgeAmount, imageScale, imageWidth, imageHeight, visibleTiles]);

  // Animation loop - smooth scroll and update uniforms
  useFrame(() => {
    if (!materialRef.current || !scrollState.current) return;

    const state = scrollState.current;

    // Apply momentum decay when not dragging
    if (!state.isDragging) {
      state.velocity *= config.momentumDecay;
      state.targetScroll += state.velocity;
    }

    // Smooth interpolation toward target
    state.currentScroll += (state.targetScroll - state.currentScroll) * config.smoothing;

    // Update shader uniforms
    // Scale scroll to image units (divide by totalImages to maintain same sensitivity)
    materialRef.current.uniforms.uScrollOffset.value = -state.currentScroll / config.totalImages;
    materialRef.current.uniforms.uVisibleTiles.value = visibleTiles;
    materialRef.current.uniforms.uBulgeAmount.value = bulgeAmount;
    materialRef.current.uniforms.uScale.value = imageScale;
    materialRef.current.uniforms.uScaleX.value = imageWidth;
    materialRef.current.uniforms.uScaleY.value = imageHeight;
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry
        key={`geo-${visibleTiles}`}
        args={[config.meshWidth, arcScale, config.segmentsX, config.segmentsY]}
      />
      <primitive object={shaderMaterial} ref={materialRef} attach="material" />
    </mesh>
  );
}
