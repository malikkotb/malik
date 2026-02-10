"use client";

import { useRef, useCallback, useEffect, useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import HelixScene from "./HelixScene";
import { defaultConfig } from "./config";

// Debug GUI Component
function DebugGUI({ values, toggles, onChange, onToggle }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '12px 16px',
        borderRadius: 8,
        fontFamily: 'monospace',
        fontSize: 12,
        color: '#fff',
        zIndex: 1000,
        minWidth: 200,
      }}
    >
      <div style={{ marginBottom: 8, fontWeight: 'bold', color: '#888' }}>Debug</div>
      {Object.entries(values).map(([key, { value, min, max, step }]) => (
        <div key={key} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span>{key}</span>
            <span style={{ color: '#4af' }}>{value.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(key, parseFloat(e.target.value))}
            style={{
              width: '100%',
              accentColor: '#4af',
            }}
          />
        </div>
      ))}
      {Object.entries(toggles).map(([key, value]) => (
        <div
          key={key}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <span>{key}</span>
          <button
            onClick={() => onToggle(key, !value)}
            style={{
              background: value ? '#4af' : '#444',
              border: 'none',
              borderRadius: 4,
              padding: '4px 12px',
              color: value ? '#000' : '#888',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: 11,
            }}
          >
            {value ? 'ON' : 'OFF'}
          </button>
        </div>
      ))}
    </div>
  );
}

export default function DNACarousel() {
  const containerRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const [cameraDistance, setCameraDistance] = useState(defaultConfig.cameraDistance);
  const [showWireframe, setShowWireframe] = useState(false);

  // Debug values configuration
  const debugValues = useMemo(() => ({
    cameraDistance: { value: cameraDistance, min: 5, max: 30, step: 0.5 },
  }), [cameraDistance]);

  const debugToggles = useMemo(() => ({
    showWireframe,
  }), [showWireframe]);

  const handleDebugChange = useCallback((key, value) => {
    if (key === 'cameraDistance') setCameraDistance(value);
  }, []);

  const handleDebugToggle = useCallback((key, value) => {
    if (key === 'showWireframe') setShowWireframe(value);
  }, []);

  // State for scroll (wheel) and rotation (drag)
  const dragState = useRef({
    // Scroll state (controlled by wheel)
    targetScroll: 0,
    scrollVelocity: 0,
    // Rotation state (controlled by drag)
    isDragging: false,
    targetRotation: 0,
    rotationVelocity: 0,
    lastPointerX: 0,
  });

  // Pointer handlers for drag (rotate the cylinder)
  const handlePointerDown = useCallback((e) => {
    setIsDragging(true);
    dragState.current.isDragging = true;
    dragState.current.lastPointerX = e.clientX;
    dragState.current.rotationVelocity = 0;
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!dragState.current.isDragging) return;

    const deltaX = e.clientX - dragState.current.lastPointerX;
    const containerWidth = containerRef.current?.offsetWidth || window.innerWidth;

    // Calculate rotation velocity for momentum
    dragState.current.rotationVelocity = deltaX * 0.01;

    // Update target rotation (horizontal drag rotates the cylinder)
    dragState.current.targetRotation += deltaX * 0.005;
    dragState.current.lastPointerX = e.clientX;
  }, []);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    dragState.current.isDragging = false;
  }, []);

  // Wheel handler for scroll (navigate through images)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY * defaultConfig.scrollSensitivity;
      dragState.current.targetScroll += delta;
      dragState.current.scrollVelocity = delta * 0.5;
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  // Touch handlers for mobile
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let lastTouchX = 0;
    let lastTouchY = 0;
    let touchStartX = 0;
    let touchStartY = 0;
    let isHorizontalSwipe = null;

    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      lastTouchX = touchStartX;
      lastTouchY = touchStartY;
      isHorizontalSwipe = null;
      dragState.current.isDragging = true;
      dragState.current.rotationVelocity = 0;
      setIsDragging(true);
    };

    const handleTouchMove = (e) => {
      if (!dragState.current.isDragging) return;
      e.preventDefault();

      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;
      const deltaX = touchX - lastTouchX;
      const deltaY = touchY - lastTouchY;

      // Determine swipe direction on first significant movement
      if (isHorizontalSwipe === null) {
        const totalDeltaX = Math.abs(touchX - touchStartX);
        const totalDeltaY = Math.abs(touchY - touchStartY);
        if (totalDeltaX > 10 || totalDeltaY > 10) {
          isHorizontalSwipe = totalDeltaX > totalDeltaY;
        }
      }

      if (isHorizontalSwipe) {
        // Horizontal swipe = rotate cylinder
        dragState.current.rotationVelocity = deltaX * 0.01;
        dragState.current.targetRotation += deltaX * 0.005;
      } else if (isHorizontalSwipe === false) {
        // Vertical swipe = scroll through images
        dragState.current.scrollVelocity = -deltaY * defaultConfig.dragSensitivity * 0.01;
        dragState.current.targetScroll -= deltaY * defaultConfig.scrollSensitivity * defaultConfig.dragSensitivity;
      }

      lastTouchX = touchX;
      lastTouchY = touchY;
    };

    const handleTouchEnd = () => {
      dragState.current.isDragging = false;
      setIsDragging(false);
      isHorizontalSwipe = null;
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
    position: [0, 0, cameraDistance],
    fov: defaultConfig.cameraFov,
    near: 0.1,
    far: 100,
  }), [cameraDistance]);

  const glProps = useMemo(() => ({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
    outputColorSpace: 'srgb-linear', // No color conversion - pass through as-is
  }), []);

  return (
    <div
      ref={containerRef}
      className="absolute top-0 left-0 w-full h-full"
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
        <HelixScene dragState={dragState} config={defaultConfig} cameraDistance={cameraDistance} showWireframe={showWireframe} />
      </Canvas>
      <DebugGUI values={debugValues} toggles={debugToggles} onChange={handleDebugChange} onToggle={handleDebugToggle} />
    </div>
  );
}
