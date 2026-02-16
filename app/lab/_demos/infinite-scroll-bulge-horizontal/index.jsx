"use client";

import { useRef, useCallback, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import GalleryScene from "./GalleryScene";
import DebugUI from "./DebugUI";
import { config } from "./config";

export default function InfiniteScrollGallery() {
  const containerRef = useRef();

  // Debug values state (only grid layout is adjustable)
  const [gridConfig, setGridConfig] = useState({
    columns: config.columns,
    rows: config.rows,
  });

  // Merge static config with dynamic grid config
  const debugValues = useMemo(() => ({
    ...config,
    ...gridConfig,
  }), [gridConfig]);

  // Store current sensitivity in ref for wheel handler
  const sensitivityRef = useRef(debugValues.scrollSensitivity);
  useEffect(() => {
    sensitivityRef.current = debugValues.scrollSensitivity;
  }, [debugValues.scrollSensitivity]);

  const handleDebugChange = useCallback((name, value) => {
    setGridConfig(prev => ({ ...prev, [name]: value }));
  }, []);

  // Scroll state - refs for animation performance
  const scrollState = useRef({
    targetX: 0,
    currentX: 0,
    velocityX: 0,
    isDragging: false,
    lastPointerX: 0,
  });

  // Wheel handler for scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY * sensitivityRef.current;
      scrollState.current.targetX += delta;
      scrollState.current.velocityX = e.deltaY * 0.5;
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  // Pointer handlers for touch/drag
  const handlePointerDown = useCallback((e) => {
    scrollState.current.isDragging = true;
    scrollState.current.lastPointerX = e.clientX;
    scrollState.current.velocityX = 0;
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!scrollState.current.isDragging) return;

    const deltaX = e.clientX - scrollState.current.lastPointerX;
    const containerWidth = containerRef.current?.offsetWidth || window.innerWidth;

    // Calculate velocity for momentum
    scrollState.current.velocityX = -deltaX * 2;

    // Update target position (inverted for natural scroll direction)
    scrollState.current.targetX -= deltaX / containerWidth * 2;
    scrollState.current.lastPointerX = e.clientX;
  }, []);

  const handlePointerUp = useCallback(() => {
    scrollState.current.isDragging = false;
  }, []);

  // Camera props - positioned to see the curved surface
  const cameraProps = useMemo(() => ({
    position: [0, 0, 4],
    fov: 60,
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
      className="h-full absolute top-0 left-0 right-0 bottom-0 w-full"
      style={{
        touchAction: 'none',
        cursor: 'grab',
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
        flat
      >
        <GalleryScene scrollState={scrollState} config={debugValues} />
      </Canvas>
      <DebugUI values={gridConfig} onChange={handleDebugChange} />
    </div>
  );
}
