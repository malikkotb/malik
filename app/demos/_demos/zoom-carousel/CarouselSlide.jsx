'use client';

import { useRef, useMemo, useEffect, forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Shared geometry - created once and reused by all slides
const sharedGeometry = new THREE.PlaneGeometry(1, 1, 1, 1);

// Vertex Shader
const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment Shader with parallax, masking, and layer support
const fragmentShader = `
  varying vec2 vUv;

  uniform vec2 mouse;
  uniform vec2 resolution;
  uniform float scaleCenter;
  uniform float imageScale;
  uniform float maskScale;
  uniform float hasVideo;
  uniform float darken;
  uniform float opacity;
  uniform sampler2D texture1;
  uniform sampler2D textureVideo;
  uniform sampler2D textureOverlay;
  uniform sampler2D mask;

  void main() {
    vec2 uMouse = mouse * -0.5;
    uMouse.y *= resolution.y / resolution.x;
    uMouse *= -1.;

    vec2 newUV = (vUv - vec2(scaleCenter)) * resolution.xy + vec2(scaleCenter);
    vec2 mouseUv = vUv + uMouse;
    vec2 newUVMouse = (mouseUv - vec2(scaleCenter)) * resolution.xy + vec2(scaleCenter);

    vec2 textureUVScale = (newUV - scaleCenter) * 1.0 + scaleCenter;
    vec2 textureUVScaleMouse = (newUVMouse - scaleCenter) * imageScale + scaleCenter;
    vec2 maskUVScale = (newUV - scaleCenter) * maskScale + scaleCenter;

    vec4 textureColor = texture2D(texture1, textureUVScaleMouse);
    vec4 textureVideoColor = texture2D(textureVideo, textureUVScaleMouse);
    vec4 textureBlack = texture2D(textureOverlay, textureUVScale);
    vec4 maskColor = texture2D(mask, maskUVScale);

    vec4 combined = mix(textureColor, textureVideoColor, hasVideo);
    vec4 darkened = mix(combined, textureBlack, darken);
    vec4 maskedColor = darkened * maskColor;

    gl_FragColor = vec4(maskedColor.rgb, maskedColor.a * opacity);
  }
`;

// Default white texture for mask (fully visible)
const defaultWhiteTexture = (() => {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 4;
  canvas.height = 4;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 4, 4);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
})();

// Default black texture for overlay
const defaultBlackTexture = (() => {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 4;
  canvas.height = 4;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 4, 4);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
})();

// Default gray placeholder texture
const defaultPlaceholderTexture = (() => {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#e5e5e5';
  ctx.fillRect(0, 0, 16, 16);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
})();

const CarouselSlide = forwardRef(function CarouselSlide({
  position,
  scale,
  slideData,
  mouseRef,
}, ref) {
  const meshRef = ref || useRef();
  const materialRef = useRef();
  const texturesRef = useRef({
    texture1: null,
    textureVideo: null,
    textureOverlay: null,
    mask: null,
  });

  // Create uniforms once
  const uniforms = useMemo(() => ({
    mouse: { value: new THREE.Vector2(0, 0) },
    resolution: { value: new THREE.Vector2(1, 1) },
    scaleCenter: { value: 0.5 },
    imageScale: { value: slideData.imageScale || 1.0 },
    maskScale: { value: slideData.maskScale || 1.0 },
    hasVideo: { value: slideData.hasVideo ? 1.0 : 0.0 },
    darken: { value: slideData.darken || 0.0 },
    opacity: { value: 1.0 },
    texture1: { value: defaultPlaceholderTexture },
    textureVideo: { value: defaultPlaceholderTexture },
    textureOverlay: { value: defaultBlackTexture },
    mask: { value: defaultWhiteTexture },
  }), [slideData.imageScale, slideData.maskScale, slideData.hasVideo, slideData.darken]);

  // Load textures
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    let mounted = true;

    // Load main texture
    if (slideData.texture1) {
      loader.load(slideData.texture1, (texture) => {
        if (!mounted) return;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.colorSpace = THREE.SRGBColorSpace;
        texturesRef.current.texture1 = texture;
        if (materialRef.current) {
          materialRef.current.uniforms.texture1.value = texture;
        }
      });
    }

    // Load overlay texture if specified
    if (slideData.textureOverlay) {
      loader.load(slideData.textureOverlay, (texture) => {
        if (!mounted) return;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texturesRef.current.textureOverlay = texture;
        if (materialRef.current) {
          materialRef.current.uniforms.textureOverlay.value = texture;
        }
      });
    }

    // Load mask texture if specified
    if (slideData.mask) {
      loader.load(slideData.mask, (texture) => {
        if (!mounted) return;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texturesRef.current.mask = texture;
        if (materialRef.current) {
          materialRef.current.uniforms.mask.value = texture;
        }
      });
    }

    return () => {
      mounted = false;
      // Dispose textures on unmount
      Object.values(texturesRef.current).forEach((texture) => {
        if (texture && texture !== defaultPlaceholderTexture &&
            texture !== defaultWhiteTexture && texture !== defaultBlackTexture) {
          texture.dispose();
        }
      });
    };
  }, [slideData.texture1, slideData.textureOverlay, slideData.mask]);

  // Update uniforms in animation frame
  useFrame(() => {
    if (!materialRef.current || !mouseRef.current) return;

    // Smooth mouse position update
    const mouse = materialRef.current.uniforms.mouse.value;
    mouse.x += (mouseRef.current.x - mouse.x) * 0.1;
    mouse.y += (mouseRef.current.y - mouse.y) * 0.1;
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={scale}
      geometry={sharedGeometry}
    >
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

export default CarouselSlide;
