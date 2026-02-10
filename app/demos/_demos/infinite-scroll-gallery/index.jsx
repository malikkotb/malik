"use client";

import { useRef, useCallback, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import GalleryScene from "./GalleryScene";
import DebugUI from "./DebugUI";
import { config } from "./config";

export default function InfiniteScrollGallery() {
  const containerRef = useRef();

  // Debug values state
  const [debugValues, setDebugValues] = useState({
    curveDepth: config.curveDepth,
    curveWidth: config.curveWidth,
    scrollSensitivity: config.scrollSensitivity,
    smoothing: config.smoothing,
    gap: config.gap,
    columns: config.columns,
    rows: config.rows,
  });

  // Store current sensitivity in ref for wheel handler
  const sensitivityRef = useRef(debugValues.scrollSensitivity);
  useEffect(() => {
    sensitivityRef.current = debugValues.scrollSensitivity;
  }, [debugValues.scrollSensitivity]);

  const handleDebugChange = useCallback((name, value) => {
    setDebugValues(prev => ({ ...prev, [name]: value }));
  }, []);

  // Scroll state - refs for animation performance
  const scrollState = useRef({
    targetY: 0,
    currentY: 0,
    velocityY: 0,
    isDragging: false,
    lastPointerY: 0,
  });

  // Wheel handler for scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY * sensitivityRef.current;
      scrollState.current.targetY += delta;
      scrollState.current.velocityY = e.deltaY * 0.5;
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  // Pointer handlers for touch/drag
  const handlePointerDown = useCallback((e) => {
    scrollState.current.isDragging = true;
    scrollState.current.lastPointerY = e.clientY;
    scrollState.current.velocityY = 0;
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!scrollState.current.isDragging) return;

    const deltaY = e.clientY - scrollState.current.lastPointerY;
    const containerHeight = containerRef.current?.offsetHeight || window.innerHeight;

    // Calculate velocity for momentum
    scrollState.current.velocityY = -deltaY * 2;

    // Update target position (inverted for natural scroll direction)
    scrollState.current.targetY -= deltaY / containerHeight * 2;
    scrollState.current.lastPointerY = e.clientY;
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
    outputColorSpace: THREE.LinearSRGBColorSpace,
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
      >
        <GalleryScene scrollState={scrollState} config={debugValues} />
      </Canvas>
      <DebugUI values={debugValues} onChange={handleDebugChange} />
    </div>
  );
}
