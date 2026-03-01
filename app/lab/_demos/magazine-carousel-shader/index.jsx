'use client';

import { useRef, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import MagazineScene from './MagazineScene';
import { config } from './config';

export default function MagazineCarouselShader() {
  const containerRef = useRef();

  // Flip state ref (mutable state for performance)
  const flipState = useRef({
    currentSpread: 0,
    flipProgress: 0,
    targetProgress: 0,
    velocity: 0,
    isDragging: false,
    dragStartX: 0,
    dragStartProgress: 0,
    // New: hover/peek state
    isHovering: false,
    peekProgress: 0,
    targetPeekProgress: 0,
    // Bounce state
    isBouncing: false,
    bounceVelocity: 0,
  });

  // Check if pointer is in bottom-right peek zone
  const isInPeekZone = useCallback((clientX, clientY) => {
    const container = containerRef.current;
    if (!container) return false;

    const rect = container.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;

    // Bottom-right quadrant detection (x > 0.7 and y > 0.7)
    return x > config.peekZoneThreshold && y > config.peekZoneThreshold;
  }, []);

  // Handle pointer down - click to commit flip
  const handlePointerDown = useCallback((e) => {
    const state = flipState.current;
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const pointerX = e.clientX - rect.left;
    const containerWidth = rect.width;

    // Only start interaction from right half of screen
    if (pointerX < containerWidth / 2) return;

    // Don't start new interaction if already at last spread and fully flipped
    if (state.currentSpread >= config.totalSpreads - 1 && state.flipProgress >= 0.99) return;

    // If hovering in peek zone, click commits the flip
    if (state.isHovering && state.peekProgress > 0.05) {
      state.targetProgress = 1.0;
      state.isHovering = false;
      state.targetPeekProgress = 0;
      return;
    }

    // Otherwise, start drag
    state.isDragging = true;
    state.dragStartX = e.clientX;
    state.dragStartProgress = state.flipProgress;
    state.velocity = 0;
  }, []);

  // Handle pointer move - hover detection + drag
  const handlePointerMove = useCallback((e) => {
    const state = flipState.current;
    const container = containerRef.current;
    if (!container) return;

    // Update hover state for peek
    const inPeekZone = isInPeekZone(e.clientX, e.clientY);

    // Only activate peek if not currently flipping
    if (!state.isDragging && state.flipProgress < 0.05) {
      state.isHovering = inPeekZone;
      state.targetPeekProgress = inPeekZone ? config.peekAmount : 0;
    }

    // Handle drag
    if (!state.isDragging) return;

    const containerWidth = container.getBoundingClientRect().width;

    // Calculate drag delta (negative = dragging left = flipping forward)
    const deltaX = e.clientX - state.dragStartX;
    const normalizedDelta = -deltaX / (containerWidth * 0.5);

    // Map delta to flip progress
    const newProgress = state.dragStartProgress + normalizedDelta * config.dragSensitivity;

    // Clamp progress to [0, 1]
    state.flipProgress = Math.max(0, Math.min(1, newProgress));
    state.targetProgress = state.flipProgress;

    // Clear peek when dragging
    state.peekProgress = 0;
    state.targetPeekProgress = 0;
  }, [isInPeekZone]);

  // Handle pointer up
  const handlePointerUp = useCallback(() => {
    const state = flipState.current;
    if (!state.isDragging) return;

    state.isDragging = false;

    // Check threshold
    if (state.flipProgress > config.dragThreshold) {
      // Complete the flip
      state.targetProgress = 1.0;
    } else {
      // Spring back
      state.targetProgress = 0.0;
    }
  }, []);

  // Handle pointer leave - reset hover state
  const handlePointerLeave = useCallback(() => {
    const state = flipState.current;
    state.isHovering = false;
    state.targetPeekProgress = 0;
  }, []);

  // Add event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('pointerdown', handlePointerDown);
    container.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      container.removeEventListener('pointerdown', handlePointerDown);
      container.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handlePointerDown, handlePointerMove, handlePointerUp, handlePointerLeave]);

  return (
    <div
      ref={containerRef}
      className="h-full absolute top-0 left-0 right-0 bottom-0 w-full bg-neutral-100"
      style={{ touchAction: 'none', cursor: 'pointer' }}
    >
      <Canvas
        camera={{
          position: [0, 0, 4],
          fov: 50,
          near: 0.1,
          far: 100,
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        dpr={[1, 2]}
        frameloop="always"
      >
        <MagazineScene flipState={flipState} />
      </Canvas>

      {/* Instructions overlay */}
      <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
        <p className="text-sm text-neutral-500">
          Hover bottom-right corner to peek, click to flip
        </p>
      </div>
    </div>
  );
}
