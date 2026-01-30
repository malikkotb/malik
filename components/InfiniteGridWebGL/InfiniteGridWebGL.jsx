'use client';

import { Canvas } from '@react-three/fiber';
import { useRef, useCallback, useMemo } from 'react';
import { GridScene } from './GridScene';

const TILE_SIZE = 300;

export function InfiniteGridWebGL({ items = [] }) {
  const containerRef = useRef(null);

  // All drag state in a single ref to avoid re-renders
  const dragState = useRef({
    isDragging: false,
    targetX: 0,
    targetY: 0,
    currentX: 0,
    currentY: 0,
    velocityX: 0,
    velocityY: 0,
    lastPointerX: 0,
    lastPointerY: 0,
  });

  const handlePointerDown = useCallback((e) => {
    dragState.current.isDragging = true;
    dragState.current.lastPointerX = e.clientX;
    dragState.current.lastPointerY = e.clientY;
    // Reset velocity on new drag
    dragState.current.velocityX = 0;
    dragState.current.velocityY = 0;
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grabbing';
    }
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!dragState.current.isDragging) return;
    const state = dragState.current;
    const deltaX = e.clientX - state.lastPointerX;
    const deltaY = e.clientY - state.lastPointerY;
    state.targetX += deltaX;
    state.targetY += deltaY;
    // Track velocity for momentum
    state.velocityX = deltaX * 15;
    state.velocityY = deltaY * 15;
    state.lastPointerX = e.clientX;
    state.lastPointerY = e.clientY;
  }, []);

  const handlePointerUp = useCallback(() => {
    dragState.current.isDragging = false;
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }
  }, []);

  // Memoized GL props
  const glProps = useMemo(
    () => ({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    }),
    []
  );

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        cursor: 'grab',
        overflow: 'hidden',
        touchAction: 'none',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <Canvas
        orthographic
        camera={{ zoom: 1, position: [0, 0, 100], near: 0.1, far: 1000 }}
        gl={glProps}
        style={{ background: '#f0f0f0' }}
        frameloop="always"
        dpr={[1, 2]}
      >
        <GridScene
          dragState={dragState}
          tileSize={TILE_SIZE}
          items={items}
        />
      </Canvas>
    </div>
  );
}
