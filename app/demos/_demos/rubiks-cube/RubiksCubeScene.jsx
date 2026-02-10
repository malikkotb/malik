'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Cube from './Cube';
import { generateCubes } from './data';
import { defaultConfig } from './config';

export default function RubiksCubeScene({ cubeSize, gap, config = defaultConfig }) {
  const groupRef = useRef();
  const spinProgress = useRef(0);
  const isSpinning = useRef(true);

  // Generate cubes with current size and gap
  const cubes = useMemo(() => {
    return generateCubes(cubeSize, gap, 42);
  }, [cubeSize, gap]);

  // Initial spin animation
  useFrame((state, delta) => {
    if (isSpinning.current && groupRef.current) {
      spinProgress.current += delta;

      // Ease-out rotation over initialSpinDuration seconds
      const duration = config.initialSpinDuration;
      const t = Math.min(spinProgress.current / duration, 1);
      const easeOut = 1 - Math.pow(1 - t, 3);

      // Full rotation on Y, half rotation on X
      groupRef.current.rotation.y = easeOut * Math.PI * 2;
      groupRef.current.rotation.x = easeOut * Math.PI * 0.5;

      if (t >= 1) {
        isSpinning.current = false;
      }
    }
  });

  return (
    <>
      {/* Soft ambient lighting */}
      <ambientLight intensity={config.ambientIntensity} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={config.directionalIntensity}
      />
      <directionalLight
        position={[-5, -5, -5]}
        intensity={config.directionalIntensity * 0.5}
      />

      {/* Orbit controls */}
      <OrbitControls
        enableDamping={config.enableDamping}
        dampingFactor={config.dampingFactor}
        minDistance={config.minDistance}
        maxDistance={config.maxDistance}
        enablePan={false}
      />

      {/* Group of cubes for rotation animation */}
      <group ref={groupRef}>
        {cubes.map((cube) => (
          <Cube
            key={cube.id}
            position={cube.position}
            size={cubeSize}
            texturePath={cube.texture}
          />
        ))}
      </group>
    </>
  );
}
