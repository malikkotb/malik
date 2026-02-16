'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Cube from './Cube';
import { generateCubes } from './data';
import { defaultConfig } from './config';

export default function RubiksCubeScene({
  cubeSize,
  gap,
  visibleRadius = 1,
  onControlsChange,
  config = defaultConfig,
}) {
  const groupRef = useRef();
  const controlsRef = useRef();
  const spinProgress = useRef(0);
  const isSpinning = useRef(true);

  // Track when each cube becomes visible for animation
  const cubeVisibilityTimestamps = useRef(new Map());

  // Generate all cubes once (5x5x5) - stored as grid coordinates
  const allCubes = useMemo(() => {
    return generateCubes(42);
  }, []);

  // Filter which cubes to show based on visible radius
  const visibleCubes = useMemo(() => {
    const now = Date.now();
    return allCubes.filter((cube) => {
      const isVisible = cube.gridDistance <= visibleRadius;

      // Track when this cube becomes visible (for animation)
      if (isVisible && !cubeVisibilityTimestamps.current.has(cube.id)) {
        cubeVisibilityTimestamps.current.set(cube.id, now);
      } else if (!isVisible && cubeVisibilityTimestamps.current.has(cube.id)) {
        // Remove timestamp if cube becomes invisible (shouldn't happen but just in case)
        cubeVisibilityTimestamps.current.delete(cube.id);
      }

      return isVisible;
    });
  }, [allCubes, visibleRadius]);

  // Calculate actual position from grid coordinates based on cubeSize + gap
  const getPosition = (gridCoord) => {
    const offset = cubeSize + gap;
    return [
      gridCoord[0] * offset,
      gridCoord[1] * offset,
      gridCoord[2] * offset,
    ];
  };

  // Calculate animation progress for cube flowing from center
  const getAnimationProgress = (cube) => {
    const visibleTimestamp = cubeVisibilityTimestamps.current.get(cube.id);

    // If cube was always visible (center cube), no animation needed
    if (!visibleTimestamp) {
      // Check if this is a center cube (gridDistance 0 or 1)
      if (cube.gridDistance <= 1) return 1;
      // Otherwise start animation now
      cubeVisibilityTimestamps.current.set(cube.id, Date.now());
      return 0;
    }

    const elapsed = (Date.now() - visibleTimestamp) / 1000; // seconds
    const staggerDelay = cube.entryDelay * 1.0; // 0-1000ms stagger (slower)
    const cubeElapsed = Math.max(0, elapsed - staggerDelay);
    const animDuration = 1.8; // 1800ms per cube (much slower)

    if (cubeElapsed >= animDuration) return 1;

    const t = cubeElapsed / animDuration;
    // Ease out cubic
    return 1 - Math.pow(1 - t, 3);
  };

  // Get position with animation (flows from center to final position)
  const getAnimatedPosition = (cube) => {
    const progress = getAnimationProgress(cube);
    const finalPos = getPosition(cube.gridCoord);

    if (progress >= 1) return finalPos;

    // Start from center (0,0,0) and move to final position
    return [
      finalPos[0] * progress,
      finalPos[1] * progress,
      finalPos[2] * progress,
    ];
  };

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
        ref={controlsRef}
        enableDamping={config.enableDamping}
        dampingFactor={config.dampingFactor}
        minDistance={config.minDistance}
        maxDistance={config.maxDistance}
        enablePan={false}
        onChange={onControlsChange}
      />

      {/* Group of cubes for rotation animation */}
      <group ref={groupRef}>
        {visibleCubes.map((cube) => {
          const progress = getAnimationProgress(cube);
          return (
            <Cube
              key={cube.id}
              position={getAnimatedPosition(cube)}
              size={cubeSize}
              texturePath={cube.texture}
              scale={progress} // Scale from 0 to 1 as they appear
            />
          );
        })}
      </group>
    </>
  );
}
