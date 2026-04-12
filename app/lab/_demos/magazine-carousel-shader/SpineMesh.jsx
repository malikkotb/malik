'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { config } from './config';

// Vertex shader — parabolic dip to create the gutter groove
const vertexShader = `
  uniform float uSpineDepth;
  uniform float uSpineWidth;

  varying float vGrooveDepth;

  void main() {
    vec3 pos = position;
    // Normalized x across the spine strip: -1 at left edge, +1 at right edge
    float t = pos.x / (uSpineWidth * 0.5);
    // Parabolic concave dip — deepest at center
    float dip = uSpineDepth * (1.0 - t * t);
    pos.z -= dip;
    vGrooveDepth = dip / uSpineDepth; // 0 at edges, 1 at center

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// Fragment shader — dark gutter gradient
const fragmentShader = `
  varying float vGrooveDepth;

  void main() {
    // Dark at center (deepest part), lighter toward edges
    float darkness = vGrooveDepth * 0.55;
    vec3 gutterColor = vec3(0.08, 0.07, 0.06) + vec3(0.5) * (1.0 - vGrooveDepth);
    float alpha = 0.75 + vGrooveDepth * 0.2;
    gl_FragColor = vec4(gutterColor * (1.0 - darkness * 0.5), alpha);
  }
`;

export default function SpineMesh() {
  const geometry = useMemo(() => {
    // Narrow strip centered at x=0, full page height, with enough X segments for the curve
    return new THREE.PlaneGeometry(config.spineWidth, config.pageHeight, 16, 1);
  }, []);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uSpineDepth: { value: config.spineDepth },
        uSpineWidth: { value: config.spineWidth },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.FrontSide,
    });
  }, []);

  return (
    <mesh position={[0, 0, 0.002]} renderOrder={10} geometry={geometry}>
      <primitive object={material} attach="material" />
    </mesh>
  );
}
