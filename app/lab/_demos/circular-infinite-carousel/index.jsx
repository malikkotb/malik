'use client';

import { Suspense, useRef, useCallback, useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import CarouselMesh from './CarouselMesh';
import { config } from './config';
import GUI from 'lil-gui';

// Camera controller component to update camera zoom
function CameraController({ cameraZ }) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.z = cameraZ;
  }, [camera, cameraZ]);

  return null;
}

export default function CircularInfiniteCarousel() {
  const containerRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const [cameraZ, setCameraZ] = useState(config.cameraZ);
  const [imageWidth, setImageWidth] = useState(1.0);
  const [imageHeight, setImageHeight] = useState(1.0);
  const [bulgeAmount, setBulgeAmount] = useState(config.bulgeAmount);
  const [imageScale, setImageScale] = useState(1.0);
  const [visibleTiles, setVisibleTiles] = useState(config.visibleImages);

  // Scroll state ref (shared with CarouselMesh)
  const scrollState = useRef({
    targetScroll: 0,
    currentScroll: 0,
    velocity: 0,
    isDragging: false,
    lastPointerY: 0,
  });

  // Wheel handler
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY * config.scrollSensitivity;
    scrollState.current.targetScroll += delta;
    scrollState.current.velocity = delta * 0.5;
  }, []);

  // Pointer handlers for drag
  const handlePointerDown = useCallback((e) => {
    setIsDragging(true);
    scrollState.current.isDragging = true;
    scrollState.current.lastPointerY = e.clientY;
    scrollState.current.velocity = 0;
    containerRef.current?.setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!scrollState.current.isDragging) return;

    const deltaY = e.clientY - scrollState.current.lastPointerY;
    scrollState.current.lastPointerY = e.clientY;

    // Update target scroll based on drag
    scrollState.current.targetScroll -= deltaY * config.dragSensitivity;
    scrollState.current.velocity = -deltaY * config.dragSensitivity * 0.5;
  }, []);

  const handlePointerUp = useCallback((e) => {
    setIsDragging(false);
    scrollState.current.isDragging = false;
    containerRef.current?.releasePointerCapture(e.pointerId);
  }, []);

  // Set up wheel listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // Touch handlers for mobile
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let lastTouchY = 0;

    const handleTouchStart = (e) => {
      lastTouchY = e.touches[0].clientY;
      scrollState.current.isDragging = true;
      scrollState.current.velocity = 0;
      setIsDragging(true);
    };

    const handleTouchMove = (e) => {
      if (!scrollState.current.isDragging) return;
      e.preventDefault();

      const touchY = e.touches[0].clientY;
      const deltaY = touchY - lastTouchY;
      lastTouchY = touchY;

      scrollState.current.targetScroll -= deltaY * config.dragSensitivity;
      scrollState.current.velocity = -deltaY * config.dragSensitivity * 0.5;
    };

    const handleTouchEnd = () => {
      scrollState.current.isDragging = false;
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

  // Set up lil-gui debug panel
  useEffect(() => {
    const gui = new GUI({ title: 'Carousel Controls' });

    // Position GUI in bottom left corner
    gui.domElement.style.position = 'fixed';
    gui.domElement.style.top = 'auto';
    gui.domElement.style.right = 'auto';
    gui.domElement.style.bottom = '0';
    gui.domElement.style.left = '0';

    const settings = {
      zoom: cameraZ,
      width: imageWidth,
      height: imageHeight,
      bulge: bulgeAmount,
      scale: imageScale,
      visibleTiles: visibleTiles,
    };

    gui
      .add(settings, 'zoom', 6, 14, 0.1)
      .name('Camera Zoom')
      .onChange((value) => {
        setCameraZ(value);
      });

    gui
      .add(settings, 'width', 0.5, 10, 0.1)
      .name('Image Width')
      .onChange((value) => {
        setImageWidth(value);
      });

    gui
      .add(settings, 'height', 0.5, 10, 0.1)
      .name('Image Height')
      .onChange((value) => {
        setImageHeight(value);
      });

    gui
      .add(settings, 'bulge', 0, 1, 0.05)
      .name('Bulge Amount')
      .onChange((value) => {
        setBulgeAmount(value);
      });

    gui
      .add(settings, 'scale', 0.5, 3, 0.1)
      .name('Image Scale')
      .onChange((value) => {
        setImageScale(value);
      });

    gui
      .add(settings, 'visibleTiles', 1.5, 5, 0.5)
      .name('Visible Images')
      .onChange((value) => {
        setVisibleTiles(value);
      });

    return () => {
      gui.destroy();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute top-0 left-0 w-full h-full"
      style={{
        backgroundColor: config.backgroundColor,
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <Canvas
        camera={{
          position: [0, 0, cameraZ],
          fov: config.cameraFov,
          near: 0.1,
          far: 100,
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
        frameloop="always"
      >
        <color attach="background" args={[config.backgroundColor]} />
        <CameraController cameraZ={cameraZ} />
        <Suspense fallback={null}>
          <CarouselMesh
            scrollState={scrollState}
            imageWidth={imageWidth}
            imageHeight={imageHeight}
            bulgeAmount={bulgeAmount}
            imageScale={imageScale}
            visibleTiles={visibleTiles}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
