'use client';

import { useState, useMemo, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import RubiksCubeScene from './RubiksCubeScene';
import DebugUI from './DebugUI';
import { defaultConfig } from './config';

export default function RubiksCube() {
  const [cubeSize, setCubeSize] = useState(defaultConfig.cubeSize);
  const [gap, setGap] = useState(defaultConfig.gap);

  // Debug values configuration
  const debugValues = useMemo(
    () => ({
      cubeSize: {
        value: cubeSize,
        min: 0.5,
        max: 1.5,
        step: 0.05,
        label: 'Cube Size',
      },
      gap: {
        value: gap,
        min: 0.05,
        max: 0.5,
        step: 0.01,
        label: 'Gap',
      },
    }),
    [cubeSize, gap]
  );

  const handleDebugChange = useCallback((key, value) => {
    if (key === 'cubeSize') setCubeSize(value);
    if (key === 'gap') setGap(value);
  }, []);

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
          config={defaultConfig}
        />
      </Canvas>
      <DebugUI values={debugValues} onChange={handleDebugChange} />
    </div>
  );
}
