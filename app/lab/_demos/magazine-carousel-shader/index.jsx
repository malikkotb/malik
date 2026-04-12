'use client';

import { useRef, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import MagazineScene from './MagazineScene';
import { config } from './config';

export default function MagazineCarouselShader() {
  const containerRef = useRef();

  const flipState = useRef({
    currentSpread: 0,
    flipProgress: 0,
    targetProgress: 0,
    velocity: 0,
    isDragging: false,
    dragStartX: 0,
    dragStartProgress: 0,
    isHovering: false,
    peekProgress: 0,
    targetPeekProgress: 0,
    isBouncing: false,
    bounceVelocity: 0,
    flipDir: 1, // +1 forward (right→left), -1 backward (left→right)
  });

  // Params ref shared with MagazineScene for per-frame uniform updates
  const paramsRef = useRef({
    curlMode: config.curlMode,
    curlRadiusTight: config.curlRadiusTight,
    curlRadiusLoose: config.curlRadiusLoose,
    resolvedCurlRadius: config.curlRadiusLoose,
    spineDepth: config.spineDepth,
    springStiffness: config.springStiffness,
    springDamping: config.springDamping,
  });

  // Touch state for swipe detection
  const touchRef = useRef({
    startX: 0,
    startTime: 0,
    lastX: 0,
  });

  // lil-gui setup
  useEffect(() => {
    let gui;
    const initGui = async () => {
      const { default: GUI } = await import('lil-gui');
      gui = new GUI({ title: 'Magazine Settings' });
      gui.domElement.style.position = 'fixed';
      gui.domElement.style.top = '1rem';
      gui.domElement.style.right = '1rem';

      const p = paramsRef.current;

      gui.add(p, 'curlMode', ['tight', 'loose', 'dynamic']).name('Curl Mode');
      gui.add(p, 'curlRadiusTight', 0.05, 0.3, 0.01).name('Tight Radius');
      gui.add(p, 'curlRadiusLoose', 0.3, 1.2, 0.05).name('Loose Radius');

      const physicsFolder = gui.addFolder('Physics');
      physicsFolder.add(config, 'springStiffness', 1, 20, 0.5).name('Stiffness');
      physicsFolder.add(config, 'springDamping', 0.5, 1.0, 0.01).name('Damping');
      physicsFolder.add(config, 'bounceStrength', 0, 0.2, 0.01).name('Bounce');

      gui.close();
    };

    initGui();

    return () => {
      gui?.destroy();
    };
  }, []);

  // Peek zone: bottom-right 30% of the screen (right page area)
  const isInPeekZone = useCallback((clientX, clientY) => {
    const container = containerRef.current;
    if (!container) return false;
    const rect = container.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    return x > config.peekZoneThreshold && y > config.peekZoneThreshold;
  }, []);

  const handlePointerDown = useCallback((e) => {
    const state = flipState.current;
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const pointerX = e.clientX - rect.left;
    const containerWidth = rect.width;
    const onRightHalf = pointerX >= containerWidth / 2;
    const onLeftHalf = pointerX < containerWidth / 2;

    // Forward flip: drag from right half (and can still go forward)
    // Backward flip: drag from left half (and can go backward)
    const canForward = state.currentSpread < config.totalSpreads - 1 || state.flipProgress < 0.99;
    const canBackward = state.currentSpread > 0;

    if (onRightHalf && canForward) {
      if (state.isHovering && state.peekProgress > 0.05) {
        state.flipDir = 1;
        state.targetProgress = 1.0;
        state.isHovering = false;
        state.targetPeekProgress = 0;
        return;
      }
      state.flipDir = 1;
    } else if (onLeftHalf && canBackward) {
      state.flipDir = -1;
    } else {
      return;
    }

    state.isDragging = true;
    state.dragStartX = e.clientX;
    state.dragStartProgress = state.flipProgress;
    state.velocity = 0;
  }, []);

  const handlePointerMove = useCallback((e) => {
    const state = flipState.current;
    const container = containerRef.current;
    if (!container) return;

    const inPeekZone = isInPeekZone(e.clientX, e.clientY);

    if (!state.isDragging && state.flipProgress < 0.05) {
      state.isHovering = inPeekZone;
      state.targetPeekProgress = inPeekZone ? config.peekAmount : 0;
    }

    if (!state.isDragging) return;

    const containerWidth = container.getBoundingClientRect().width;
    const deltaX = e.clientX - state.dragStartX;
    // Forward: drag left (negative deltaX) = positive progress
    // Backward: drag right (positive deltaX) = positive progress
    const directedDelta = -deltaX * state.flipDir / (containerWidth * 0.5);
    const newProgress = state.dragStartProgress + directedDelta * config.dragSensitivity;

    state.flipProgress = Math.max(0, Math.min(1, newProgress));
    state.targetProgress = state.flipProgress;
    state.peekProgress = 0;
    state.targetPeekProgress = 0;
  }, [isInPeekZone]);

  const handlePointerUp = useCallback(() => {
    const state = flipState.current;
    if (!state.isDragging) return;

    state.isDragging = false;
    state.targetProgress = state.flipProgress > config.dragThreshold ? 1.0 : 0.0;
  }, []);

  const handlePointerLeave = useCallback(() => {
    const state = flipState.current;
    state.isHovering = false;
    state.targetPeekProgress = 0;
  }, []);

  // Touch handlers for swipe gestures
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    touchRef.current.startX = touch.clientX;
    touchRef.current.startTime = Date.now();
    touchRef.current.lastX = touch.clientX;

    const state = flipState.current;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const pointerX = touch.clientX - rect.left;
    const onRightHalf = pointerX >= rect.width / 2;
    const canForward = state.currentSpread < config.totalSpreads - 1 || state.flipProgress < 0.99;
    const canBackward = state.currentSpread > 0;

    if (onRightHalf && canForward) {
      state.flipDir = 1;
    } else if (!onRightHalf && canBackward) {
      state.flipDir = -1;
    } else {
      return;
    }

    state.isDragging = true;
    state.dragStartX = touch.clientX;
    state.dragStartProgress = state.flipProgress;
    state.velocity = 0;
    state.peekProgress = 0;
    state.targetPeekProgress = 0;
  }, []);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const state = flipState.current;
    const container = containerRef.current;
    if (!container || !state.isDragging) return;

    touchRef.current.lastX = touch.clientX;

    const containerWidth = container.getBoundingClientRect().width;
    const deltaX = touch.clientX - state.dragStartX;
    const directedDelta = -deltaX * state.flipDir / (containerWidth * 0.5);
    const newProgress = state.dragStartProgress + directedDelta * config.dragSensitivity;

    state.flipProgress = Math.max(0, Math.min(1, newProgress));
    state.targetProgress = state.flipProgress;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    const state = flipState.current;
    if (!state.isDragging) return;
    state.isDragging = false;

    const now = Date.now();
    const elapsed = now - touchRef.current.startTime;
    const deltaX = touchRef.current.lastX - touchRef.current.startX;
    const velocity = Math.abs(deltaX) / Math.max(elapsed, 1); // px/ms

    if (velocity > config.swipeVelocityThreshold) {
      // Flick: commit if swipe matches flip direction, cancel otherwise
      const swipeMatchesDir = (state.flipDir === 1 && deltaX < 0) || (state.flipDir === -1 && deltaX > 0);
      state.targetProgress = swipeMatchesDir ? 1.0 : 0.0;
    } else {
      // Threshold-based
      state.targetProgress = state.flipProgress > config.dragThreshold ? 1.0 : 0.0;
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('pointerdown', handlePointerDown);
    container.addEventListener('pointerleave', handlePointerLeave);
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      container.removeEventListener('pointerdown', handlePointerDown);
      container.removeEventListener('pointerleave', handlePointerLeave);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handlePointerDown, handlePointerMove, handlePointerUp, handlePointerLeave, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div
      ref={containerRef}
      className="h-full absolute top-0 left-0 right-0 bottom-0 w-full bg-neutral-100"
      style={{ touchAction: 'none', cursor: 'pointer' }}
    >
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50, near: 0.1, far: 100 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        dpr={[1, 2]}
        frameloop="always"
      >
        <MagazineScene flipState={flipState} paramsRef={paramsRef} />
      </Canvas>

      <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
        <p className="text-sm text-neutral-500">
          Drag right page to flip forward · Drag left page to flip back
        </p>
      </div>
    </div>
  );
}
