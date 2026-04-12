'use client';

import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { config } from './config';

// Vertex shader — spine-based fold with cylindrical curl
// uFlipDir = +1.0: forward flip (right page rotates left, spine at local left edge)
// uFlipDir = -1.0: backward flip (left page rotates right, spine at local right edge)
const vertexShader = `
  uniform float uFlipProgress;
  uniform float uPeekProgress;
  uniform float uCurlRadius;
  uniform float uPageWidth;
  uniform float uPageHeight;
  uniform float uFlipDir; // +1.0 forward, -1.0 backward

  varying vec2 vUv;
  varying float vDepth;
  varying float vCurlAmount;

  const float PI = 3.14159265359;

  void main() {
    vUv = uv;
    vec3 pos = position;

    float totalProgress = uFlipProgress + uPeekProgress;

    // Spine in local space: left edge for forward, right edge for backward
    float spineX = -uPageWidth * uFlipDir;

    // Distance from spine along the page (always positive, 0 at spine)
    float localX = (pos.x - spineX) * uFlipDir;

    // Rotation angle: 0 → PI as page turns
    float baseAngle = totalProgress * PI;

    // Cylindrical curl intensity peaks at mid-flip
    float curlIntensity = sin(totalProgress * PI);
    vCurlAmount = curlIntensity;

    // Cylinder cross-section angle
    float theta = min(localX / max(uCurlRadius, 0.01), PI);

    // Position on cylinder surface
    float curledX = uCurlRadius * sin(theta);
    float curledZ = uCurlRadius * (1.0 - cos(theta));

    float effectiveX = mix(localX, curledX, curlIntensity);
    float effectiveZ = mix(0.0, curledZ, curlIntensity);

    // Rotate around spine, direction determined by uFlipDir
    pos.x = spineX + effectiveX * cos(baseAngle) * uFlipDir;
    pos.z = effectiveX * sin(baseAngle) + effectiveZ;

    vDepth = pos.z;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// Fragment shader — double-sided textures with self-shadowing
const fragmentShader = `
  uniform sampler2D uFrontTexture;
  uniform sampler2D uBackTexture;
  uniform float uFlipProgress;
  uniform float uPeekProgress;

  varying vec2 vUv;
  varying float vDepth;
  varying float vCurlAmount;

  void main() {
    vec4 color;
    float totalProgress = uFlipProgress + uPeekProgress;

    if (gl_FrontFacing) {
      color = texture2D(uFrontTexture, vUv);
    } else {
      // Back side: mirror horizontally so text reads correctly
      color = texture2D(uBackTexture, vec2(1.0 - vUv.x, vUv.y));
    }

    // Self-shadow: darken inside the curl
    float shadow = 1.0 - smoothstep(0.0, 0.5, vDepth) * 0.15;
    color.rgb *= shadow;

    // Subtle darkening at the curl crease
    float creaseDark = 1.0 - vCurlAmount * 0.06;
    color.rgb *= creaseDark;

    // Paper highlight on the outside of the curl
    float highlight = smoothstep(0.1, 0.4, vDepth) * 0.08 * totalProgress;
    color.rgb += highlight;

    // Back face is slightly darker (less light reaches it)
    if (!gl_FrontFacing) {
      color.rgb *= 0.82;
    }

    gl_FragColor = color;
  }
`;

// Accepts pre-loaded THREE.Texture objects — no async loading inside this component.
// All textures are managed by the parent (MagazineScene) to avoid per-frame snap on spread change.
export default function PageMesh({
  frontTexture,
  backTexture,
  flipProgress,
  peekProgress = 0,
  position,
  curlRadius,
  flipDir = 1,
}) {
  const materialRef = useRef();

  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(
      config.pageWidth,
      config.pageHeight,
      config.segmentsX,
      config.segmentsY
    );
  }, []);

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uFlipProgress: { value: 0 },
        uPeekProgress: { value: 0 },
        uCurlRadius: { value: config.curlRadiusLoose },
        uPageWidth: { value: config.pageWidth / 2 },
        uPageHeight: { value: config.pageHeight / 2 },
        uFlipDir: { value: 1.0 },
        uFrontTexture: { value: null },
        uBackTexture: { value: null },
      },
      side: THREE.DoubleSide,
      transparent: false,
    });
  }, []);

  // Sync all uniforms — textures and flip state — every render, no async delay
  useEffect(() => {
    if (!materialRef.current) return;
    const u = materialRef.current.uniforms;
    u.uFlipProgress.value = flipProgress;
    u.uPeekProgress.value = peekProgress;
    u.uFlipDir.value = flipDir;
    if (curlRadius !== undefined) u.uCurlRadius.value = curlRadius;
    if (frontTexture) u.uFrontTexture.value = frontTexture;
    if (backTexture) u.uBackTexture.value = backTexture;
  }, [flipProgress, peekProgress, curlRadius, flipDir, frontTexture, backTexture]);

  return (
    <mesh position={position} geometry={geometry}>
      <primitive object={shaderMaterial} ref={materialRef} attach="material" />
    </mesh>
  );
}
