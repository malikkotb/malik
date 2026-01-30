"use client";

import { useRef, useCallback, useEffect, useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import HelixScene from "./HelixScene";
import { defaultConfig } from "./config";

export default function DNACarousel() {
  const containerRef = useRef();
  const [isDragging, setIsDragging] = useState(false);

  // Drag state - all refs for animation performance
  const dragState = useRef({
    isDragging: false,
    targetScroll: 0,
    currentScroll: 0,
    velocity: 0,
    lastPointerY: 0,
  });

  // Pointer handlers for drag (vertical scrolling)
  const handlePointerDown = useCallback((e) => {
    setIsDragging(true);
    dragState.current.isDragging = true;
    dragState.current.lastPointerY = e.clientY;
    dragState.current.velocity = 0;
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!dragState.current.isDragging) return;

    const deltaY = e.clientY - dragState.current.lastPointerY;
    const containerHeight = containerRef.current?.offsetHeight || window.innerHeight;

    // Calculate velocity for momentum
    dragState.current.velocity = -deltaY * defaultConfig.dragSensitivity * 0.01;

    // Update target position
    dragState.current.targetScroll -= deltaY * defaultConfig.scrollSensitivity * defaultConfig.dragSensitivity;
    dragState.current.lastPointerY = e.clientY;
  }, []);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    dragState.current.isDragging = false;
  }, []);

  // Wheel handler for scroll support
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY * defaultConfig.scrollSensitivity;
      dragState.current.targetScroll += delta;
      dragState.current.velocity = delta * 0.5;
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  // Touch handlers for mobile
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let lastTouchY = 0;

    const handleTouchStart = (e) => {
      lastTouchY = e.touches[0].clientY;
      dragState.current.isDragging = true;
      dragState.current.velocity = 0;
      setIsDragging(true);
    };

    const handleTouchMove = (e) => {
      if (!dragState.current.isDragging) return;
      e.preventDefault();

      const touchY = e.touches[0].clientY;
      const deltaY = touchY - lastTouchY;

      dragState.current.velocity = -deltaY * defaultConfig.dragSensitivity * 0.01;
      dragState.current.targetScroll -= deltaY * defaultConfig.scrollSensitivity * defaultConfig.dragSensitivity;
      lastTouchY = touchY;
    };

    const handleTouchEnd = () => {
      dragState.current.isDragging = false;
      setIsDragging(false);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Memoized camera props
  const cameraProps = useMemo(() => ({
    position: [0, 0, defaultConfig.cameraDistance],
    fov: defaultConfig.cameraFov,
    near: 0.1,
    far: 100,
  }), []);

  const glProps = useMemo(() => ({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  }), []);

  return (
    <div
      ref={containerRef}
      className="h-screen w-full"
      style={{
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <Canvas
        camera={cameraProps}
        gl={glProps}
        dpr={[1, 2]}
        frameloop="always"
      >
        <HelixScene dragState={dragState} config={defaultConfig} />
      </Canvas>
    </div>
  );
}
