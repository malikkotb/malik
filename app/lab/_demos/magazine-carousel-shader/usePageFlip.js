import { useRef, useCallback } from 'react';
import { config } from './config';

export function usePageFlip(totalSpreads) {
  const stateRef = useRef({
    // Current spread index (0 to totalSpreads - 1)
    currentSpread: 0,

    // Flip progress (0 = flat, 1 = fully flipped)
    flipProgress: 0,

    // Target progress for spring animation
    targetProgress: 0,

    // Velocity for spring physics
    velocity: 0,

    // Drag state
    isDragging: false,
    dragStartX: 0,
    dragStartProgress: 0,

    // Animation state
    isAnimating: false,
  });

  const onPointerDown = useCallback((e, viewportWidth) => {
    const state = stateRef.current;

    // Only start drag from right half of screen
    const pointerX = e.clientX;
    if (pointerX < viewportWidth / 2) return;

    // Don't start new drag if already at last spread
    if (state.currentSpread >= totalSpreads - 1 && state.flipProgress >= 0.99) return;

    state.isDragging = true;
    state.dragStartX = pointerX;
    state.dragStartProgress = state.flipProgress;
    state.velocity = 0;
  }, [totalSpreads]);

  const onPointerMove = useCallback((e, viewportWidth) => {
    const state = stateRef.current;
    if (!state.isDragging) return;

    // Calculate drag delta (negative = dragging left = flipping forward)
    const deltaX = e.clientX - state.dragStartX;
    const normalizedDelta = -deltaX / (viewportWidth * 0.5);

    // Map delta to flip progress
    const newProgress = state.dragStartProgress + normalizedDelta * config.dragSensitivity;

    // Clamp progress to [0, 1]
    state.flipProgress = Math.max(0, Math.min(1, newProgress));
    state.targetProgress = state.flipProgress;
  }, []);

  const onPointerUp = useCallback(() => {
    const state = stateRef.current;
    if (!state.isDragging) return;

    state.isDragging = false;

    // Check threshold
    if (state.flipProgress > config.dragThreshold) {
      // Complete the flip
      state.targetProgress = 1.0;
      state.isAnimating = true;
    } else {
      // Spring back
      state.targetProgress = 0.0;
      state.isAnimating = true;
    }
  }, []);

  const updateAnimation = useCallback((delta) => {
    const state = stateRef.current;

    if (state.isDragging) return false;

    // Spring physics
    const diff = state.targetProgress - state.flipProgress;
    state.velocity += diff * config.springStiffness * delta;
    state.velocity *= config.springDamping;
    state.flipProgress += state.velocity;

    // Check if flip completed
    if (state.targetProgress === 1.0 && state.flipProgress > 0.99) {
      // Move to next spread
      if (state.currentSpread < totalSpreads - 1) {
        state.currentSpread += 1;
        state.flipProgress = 0;
        state.targetProgress = 0;
        state.velocity = 0;
      } else {
        state.flipProgress = 1;
      }
      state.isAnimating = false;
      return true; // Spread changed
    }

    // Check if spring back completed
    if (state.targetProgress === 0.0 && Math.abs(state.flipProgress) < 0.01 && Math.abs(state.velocity) < 0.01) {
      state.flipProgress = 0;
      state.velocity = 0;
      state.isAnimating = false;
    }

    return false;
  }, [totalSpreads]);

  const goToSpread = useCallback((index) => {
    const state = stateRef.current;
    state.currentSpread = Math.max(0, Math.min(totalSpreads - 1, index));
    state.flipProgress = 0;
    state.targetProgress = 0;
    state.velocity = 0;
    state.isAnimating = false;
  }, [totalSpreads]);

  return {
    stateRef,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    updateAnimation,
    goToSpread,
  };
}

export default usePageFlip;
