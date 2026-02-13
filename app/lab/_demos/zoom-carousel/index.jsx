"use client";

import { useRef, useCallback, useEffect, useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import CarouselScene from "./CarouselScene";

export default function ZoomCarousel() {
  const containerRef = useRef();
  const [isDragging, setIsDragging] = useState(false);

  // Drag state - all refs for animation performance
  const dragState = useRef({
    isDragging: false,
    targetX: 0,
    currentX: 0,
    velocityX: 0,
    lastPointerX: 0,
  });

  // Mouse position for parallax effect (normalized -0.5 to 0.5)
  const mouseRef = useRef({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  });

  // Pointer handlers for drag
  const handlePointerDown = useCallback((e) => {
    setIsDragging(true);
    dragState.current.isDragging = true;
    dragState.current.lastPointerX = e.clientX;
    dragState.current.velocityX = 0;
  }, []);

  const handlePointerMove = useCallback((e) => {
    // Update mouse position for parallax (always)
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      mouseRef.current.targetX = (e.clientX - rect.left) / rect.width - 0.5;
      mouseRef.current.targetY = (e.clientY - rect.top) / rect.height - 0.5;
    }

    // Handle drag
    if (!dragState.current.isDragging) return;

    const deltaX = e.clientX - dragState.current.lastPointerX;
    const containerWidth = containerRef.current?.offsetWidth || window.innerWidth;

    // Calculate velocity for momentum
    dragState.current.velocityX = deltaX * 2;

    // Update target position
    dragState.current.targetX -= deltaX / containerWidth * 2;
    dragState.current.lastPointerX = e.clientX;
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
      const delta = e.deltaY * 0.001;
      dragState.current.targetX += delta;
      dragState.current.velocityX = e.deltaY * 0.5;
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  // Smooth mouse position animation loop
  useEffect(() => {
    let animationId;
    const animate = () => {
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.1;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.1;
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  // Memoized canvas props
  const cameraProps = useMemo(() => ({
    position: [0, 0, 5],
    fov: 50,
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
        <CarouselScene
          dragState={dragState}
          mouseRef={mouseRef}
        />
      </Canvas>
    </div>
  );
}
