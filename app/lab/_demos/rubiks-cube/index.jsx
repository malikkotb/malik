'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import RubiksCubeScene from './RubiksCubeScene';
import { defaultConfig } from './config';

export default function RubiksCube() {
  const [gap, setGap] = useState(defaultConfig.minGap); // Start with minimal gap
  const [visibleRadius, setVisibleRadius] = useState(1); // Start with radius 1 (3x3x3)

  // Fixed cube size (doesn't change)
  const cubeSize = defaultConfig.fixedCubeSize;

  // Calculate gap from camera distance
  const calculateGap = useCallback((distance) => {
    const { minDistance, maxDistance, minGap, maxGap, gapExponent } =
      defaultConfig;
    const normalizedZoom = Math.max(
      0,
      Math.min(1, (maxDistance - distance) / (maxDistance - minDistance))
    );
    return minGap + (maxGap - minGap) * Math.pow(normalizedZoom, gapExponent);
  }, []);

  // Calculate visible radius from camera distance (continuous)
  // Maps distance 40->5 to radius 1->2 (1=3x3x3, 2=5x5x5)
  const calculateVisibleRadius = useCallback((distance) => {
    const { minDistance, maxDistance } = defaultConfig;
    const normalizedZoom = Math.max(
      0,
      Math.min(1, (maxDistance - distance) / (maxDistance - minDistance))
    );

    // Smooth transition from radius 1 to 2
    // Use very high exponential curve for extremely gradual growth
    const minRadius = 1; // 3x3x3
    const maxRadius = 2; // 5x5x5
    return minRadius + (maxRadius - minRadius) * Math.pow(normalizedZoom, 4.5);
  }, []);

  // Handle OrbitControls changes
  const handleControlsChange = useCallback(
    (event) => {
      if (!event || !event.target) return;

      const distance = event.target.getDistance();

      // Calculate new gap
      const newGap = calculateGap(distance);
      setGap(newGap);

      // Calculate visible radius (continuous)
      const newRadius = calculateVisibleRadius(distance);
      setVisibleRadius(newRadius);
    },
    [calculateGap, calculateVisibleRadius]
  );


  // Camera props
  const cameraProps = useMemo(
    () => ({
      position: defaultConfig.cameraPosition,
      fov: defaultConfig.cameraFov,
      near: 0.1,
      far: 100,
    }),
    []
  );

  // WebGL props
  const glProps = useMemo(
    () => ({
      antialias: true,
      powerPreference: 'high-performance',
    }),
    []
  );

  return (
    <div
      className="absolute top-0 left-0 w-full h-full"
      style={{ backgroundColor: defaultConfig.backgroundColor }}
    >
      <Canvas camera={cameraProps} gl={glProps} dpr={[1, 2]}>
        <color attach="background" args={[defaultConfig.backgroundColor]} />
        <RubiksCubeScene
          cubeSize={cubeSize}
          gap={gap}
          visibleRadius={visibleRadius}
          onControlsChange={handleControlsChange}
          config={defaultConfig}
        />
      </Canvas>
    </div>
  );
}
