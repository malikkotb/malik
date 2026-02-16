'use client';

import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';

// Shared geometry for performance - all cubes use the same geometry
const sharedGeometry = new THREE.BoxGeometry(1, 1, 1);

export default function Cube({ position, size = 1, texturePath, scale = 1 }) {
  const meshRef = useRef();
  const materialRef = useRef();

  // Load texture
  const texture = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const loader = new THREE.TextureLoader();
    const tex = loader.load(texturePath);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [texturePath]);

  // Cleanup texture on unmount
  useEffect(() => {
    return () => {
      if (texture) {
        texture.dispose();
      }
    };
  }, [texture]);

  // Combined scale: cube size * animation scale
  const finalScale = size * scale;

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={[finalScale, finalScale, finalScale]}
      geometry={sharedGeometry}
      visible={scale > 0.01} // Hide when fully scaled down
    >
      <meshStandardMaterial
        ref={materialRef}
        map={texture}
        roughness={0.5}
        metalness={0.1}
      />
    </mesh>
  );
}
