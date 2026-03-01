'use client';

import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { config } from './config';

// Vertex shader - diagonal corner fold with S-curve
const vertexShader = `
  uniform float uFlipProgress;
  uniform float uPeekProgress;
  uniform float uCurlRadius;
  uniform float uPageWidth;
  uniform float uPageHeight;
  uniform float uCornerLag;
  uniform float uSCurve;

  varying vec2 vUv;
  varying float vDepth;
  varying float vFoldAmount;

  void main() {
    vUv = uv;
    vec3 pos = position;

    // Combined progress (peek + flip)
    float totalProgress = uFlipProgress + uPeekProgress;

    // Bottom-right corner is the origin of the flip
    vec2 cornerBR = vec2(uPageWidth, -uPageHeight);

    // Distance from bottom-right corner (normalized)
    float distFromCorner = distance(pos.xy, cornerBR) / (uPageWidth * 2.0);

    // Diagonal fold line moves from corner toward opposite corner
    // The fold line is perpendicular to the corner-to-corner diagonal
    float diagonalAngle = atan(uPageHeight, uPageWidth);

    // Project position onto fold axis
    vec2 foldDirection = normalize(vec2(-uPageHeight, uPageWidth));
    vec2 cornerToPos = pos.xy - cornerBR;
    float foldPosition = dot(cornerToPos, foldDirection);

    // Fold progress based on distance from corner
    float foldThreshold = totalProgress * (uPageWidth + uPageHeight) * 0.8;
    float distanceFromFoldLine = length(cornerToPos) - foldThreshold;

    // Only fold vertices past the fold line
    if (distanceFromFoldLine < 0.0 && totalProgress > 0.0) {
      // How far past the fold line (0 to 1)
      float foldAmount = smoothstep(0.0, uPageWidth * 0.5, -distanceFromFoldLine);

      // Corner lag: top vertices fold less than bottom vertices
      // Normalized Y position (0 at bottom, 1 at top)
      float yNorm = (pos.y + uPageHeight) / (2.0 * uPageHeight);
      float cornerLag = mix(1.0, 1.0 - uCornerLag, yNorm);
      foldAmount *= cornerLag;

      // Curl angle based on fold amount
      float angle = foldAmount * 3.14159 * totalProgress;

      // S-curve modulation - peaks at mid-flip
      float sCurveFactor = sin(totalProgress * 3.14159);
      float sCurve = sin(distFromCorner * 6.28318) * uSCurve * sCurveFactor * foldAmount;

      // Calculate lift height (Z)
      float baseHeight = sin(angle) * uCurlRadius * (1.0 + totalProgress);
      float liftHeight = baseHeight + sCurve * 0.2;

      // Curl the page backward (X movement)
      float curlBack = (1.0 - cos(angle)) * uCurlRadius * 0.5 * totalProgress;

      // Apply diagonal fold rotation
      vec2 foldPerpendicular = normalize(vec2(uPageWidth, uPageHeight));
      pos.xy -= foldPerpendicular * curlBack * foldAmount;

      // Lift in Z
      pos.z = liftHeight;

      // Add subtle wave along the fold for realism
      float waveOffset = sin(foldPosition * 4.0 + totalProgress * 2.0) * 0.02 * foldAmount * sCurveFactor;
      pos.z += waveOffset;

      vFoldAmount = foldAmount;
    } else {
      vFoldAmount = 0.0;
    }

    vDepth = pos.z;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// Fragment shader - two-sided textures with self-shadowing
const fragmentShader = `
  uniform sampler2D uFrontTexture;
  uniform sampler2D uBackTexture;
  uniform float uFlipProgress;
  uniform float uPeekProgress;

  varying vec2 vUv;
  varying float vDepth;
  varying float vFoldAmount;

  void main() {
    vec4 color;
    float totalProgress = uFlipProgress + uPeekProgress;

    if (gl_FrontFacing) {
      // Front side - normal UV
      color = texture2D(uFrontTexture, vUv);
    } else {
      // Back side - flip UV horizontally for correct orientation
      color = texture2D(uBackTexture, vec2(1.0 - vUv.x, vUv.y));
    }

    // Self-shadowing based on curl depth (darker in the curl)
    float shadow = 1.0 - smoothstep(0.0, 0.4, vDepth) * 0.25;
    color.rgb *= shadow;

    // Add slight darkening at the fold line
    float foldDarkening = 1.0 - vFoldAmount * 0.12 * totalProgress;
    color.rgb *= foldDarkening;

    // Corner shadow gradient - darker near bottom-right when lifting
    float cornerShadow = 1.0 - smoothstep(0.0, 0.3, vDepth) * 0.15 * vFoldAmount;
    color.rgb *= cornerShadow;

    // Paper highlight on lifted areas (subtle)
    float highlight = smoothstep(0.1, 0.3, vDepth) * 0.08 * totalProgress;
    color.rgb += highlight;

    gl_FragColor = color;
  }
`;

export default function PageMesh({
  frontTexturePath,
  backTexturePath,
  flipProgress,
  peekProgress = 0,
  position
}) {
  const materialRef = useRef();
  const texturesRef = useRef({ front: null, back: null });

  // Create placeholder texture
  const placeholderTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, 16, 16);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  // Create geometry with enough segments for smooth curl
  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(
      config.pageWidth,
      config.pageHeight,
      config.segmentsX,
      config.segmentsY
    );
  }, []);

  // Create shader material
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uFlipProgress: { value: 0 },
        uPeekProgress: { value: 0 },
        uCurlRadius: { value: config.curlRadius },
        uPageWidth: { value: config.pageWidth / 2 }, // Half width since page is centered
        uPageHeight: { value: config.pageHeight / 2 }, // Half height since page is centered
        uCornerLag: { value: config.cornerLagFactor },
        uSCurve: { value: config.sCurveIntensity },
        uFrontTexture: { value: placeholderTexture },
        uBackTexture: { value: placeholderTexture },
      },
      side: THREE.DoubleSide,
      transparent: false,
    });
  }, [placeholderTexture]);

  // Load textures
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    let mounted = true;

    if (frontTexturePath) {
      loader.load(frontTexturePath, (texture) => {
        if (!mounted) return;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texturesRef.current.front = texture;
        if (materialRef.current) {
          materialRef.current.uniforms.uFrontTexture.value = texture;
        }
      });
    }

    if (backTexturePath) {
      loader.load(backTexturePath, (texture) => {
        if (!mounted) return;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texturesRef.current.back = texture;
        if (materialRef.current) {
          materialRef.current.uniforms.uBackTexture.value = texture;
        }
      });
    }

    return () => {
      mounted = false;
      Object.values(texturesRef.current).forEach((texture) => {
        if (texture) texture.dispose();
      });
    };
  }, [frontTexturePath, backTexturePath]);

  // Update flip progress and peek progress uniforms
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uFlipProgress.value = flipProgress;
      materialRef.current.uniforms.uPeekProgress.value = peekProgress;
    }
  }, [flipProgress, peekProgress]);

  return (
    <mesh position={position} geometry={geometry}>
      <primitive object={shaderMaterial} ref={materialRef} attach="material" />
    </mesh>
  );
}
