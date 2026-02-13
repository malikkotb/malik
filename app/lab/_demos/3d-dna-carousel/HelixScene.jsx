'use client';

import { useRef, useMemo, memo, createRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import HelixSlide from './HelixSlide';
import { slides } from './data';
import { defaultConfig } from './config';
import { calculateHelixPosition, wrap, isVisible } from './utils';

const HelixScene = memo(function HelixScene({ dragState, config = defaultConfig, cameraDistance, showWireframe }) {
  const { camera } = useThree();
  const slideRefs = useRef([]);
  const groupRef = useRef();
  const wireframeRef = useRef();
  const smoothScroll = useRef(0);
  const smoothRotation = useRef(0);

  // Calculate the total height of one set
  const totalHeight = useMemo(() => {
    return slides.length * config.itemSpacing;
  }, [config.itemSpacing]);

  // Calculate how many sets we need based on camera distance
  const numSets = useMemo(() => {
    const dist = cameraDistance ?? config.cameraDistance;
    // Calculate visible height based on FOV and distance
    const fovRad = (config.cameraFov * Math.PI) / 180;
    const visibleHeight = 2 * dist * Math.tan(fovRad / 2);
    // Add extra buffer for smooth scrolling
    const requiredHeight = visibleHeight * 1.5;
    // Calculate sets needed (minimum 3, scale with distance)
    const setsNeeded = Math.ceil(requiredHeight / totalHeight) + 2;
    return Math.max(3, setsNeeded);
  }, [cameraDistance, config.cameraDistance, config.cameraFov, totalHeight]);

  // Create items for multiple sets for seamless looping
  const items = useMemo(() => {
    const allItems = [];
    const halfSets = Math.floor(numSets / 2);

    // Create copies from -halfSets to +halfSets
    for (let setIndex = -halfSets; setIndex <= halfSets; setIndex++) {
      slides.forEach((slide, idx) => {
        const globalIndex = setIndex * slides.length + idx;
        allItems.push({
          ...slide,
          key: `${setIndex}-${idx}`,
          globalIndex,
          localIndex: idx,
          setIndex,
        });
      });
    }

    // Initialize refs array
    slideRefs.current = allItems.map((_, i) => slideRefs.current[i] || createRef());

    return allItems;
  }, [numSets]);

  // Calculate dynamic visible range based on camera distance
  const dynamicVisibleRange = useMemo(() => {
    const dist = cameraDistance ?? config.cameraDistance;
    const fovRad = (config.cameraFov * Math.PI) / 180;
    const visibleHeight = 2 * dist * Math.tan(fovRad / 2);
    return Math.ceil(visibleHeight / config.itemSpacing) + 4;
  }, [cameraDistance, config.cameraDistance, config.cameraFov, config.itemSpacing]);

  // Animation loop with momentum decay
  useFrame((_, delta) => {
    const state = dragState.current;
    const decay = config.momentumDecay;

    // Apply scroll momentum when not dragging
    state.scrollVelocity *= decay;
    if (Math.abs(state.scrollVelocity) < 0.001) state.scrollVelocity = 0;
    state.targetScroll += state.scrollVelocity * delta;

    // Apply rotation momentum when not dragging
    if (!state.isDragging) {
      state.rotationVelocity *= decay;
      if (Math.abs(state.rotationVelocity) < 0.001) state.rotationVelocity = 0;
      state.targetRotation += state.rotationVelocity * delta;
    }

    // Smooth the scroll
    smoothScroll.current += (state.targetScroll - smoothScroll.current) * config.smoothing;

    // Smooth the rotation
    smoothRotation.current += (state.targetRotation - smoothRotation.current) * config.smoothing;

    // Apply rotation to the entire helix group
    if (groupRef.current) {
      groupRef.current.rotation.y = smoothRotation.current;
    }

    // Wrap scroll value for infinite looping
    const wrappedScroll = wrap(0, totalHeight, smoothScroll.current);

    // Calculate camera Y position (follows scroll)
    const cameraY = wrappedScroll;
    camera.position.y = cameraY;
    camera.position.z = cameraDistance ?? config.cameraDistance;
    camera.lookAt(0, cameraY, 0);

    // Update wireframe position to follow camera
    if (wireframeRef.current) {
      wireframeRef.current.position.y = cameraY;
    }

    // Update each slide's position
    items.forEach((item, i) => {
      const slideRef = slideRefs.current[i];
      if (!slideRef || !slideRef.current) return;

      // Calculate the scroll-adjusted index
      const scrollOffset = wrappedScroll / config.itemSpacing;
      const adjustedIndex = item.globalIndex;

      // Get helical position
      const scrollProgress = -(wrappedScroll / totalHeight) * Math.PI * 2 * (slides.length / config.itemsPerRotation);
      const pos = calculateHelixPosition(adjustedIndex, scrollProgress, config);

      // Set position
      slideRef.current.position.set(pos.x, pos.y, pos.z);
      slideRef.current.rotation.y = pos.rotationY;

      // Apply scale
      slideRef.current.scale.set(config.itemWidth, config.itemHeight, 1);

      // Visibility culling and opacity using dynamic visible range
      const visible = isVisible(pos.y, cameraY, dynamicVisibleRange, config.itemSpacing);
      slideRef.current.visible = visible;

      // Distance-based opacity for smooth fade at edges
      if (visible) {
        const distance = Math.abs(pos.y - cameraY);
        const maxDistance = dynamicVisibleRange * config.itemSpacing;
        const opacity = 1 - Math.pow(distance / maxDistance, 2);

        // Update opacity uniform if available
        if (slideRef.current.children[0]?.material?.uniforms?.uOpacity) {
          slideRef.current.children[0].material.uniforms.uOpacity.value = Math.max(0.2, opacity);
        }
      }
    });
  });

  // Calculate cylinder height for wireframe
  const cylinderHeight = useMemo(() => {
    return dynamicVisibleRange * config.itemSpacing * 2;
  }, [dynamicVisibleRange, config.itemSpacing]);

  return (
    <group ref={groupRef}>
      {items.map((item, i) => (
        <group key={item.key} ref={slideRefs.current[i]}>
          <HelixSlide slideData={item} />
        </group>
      ))}
      {showWireframe && (
        <mesh ref={wireframeRef}>
          <cylinderGeometry args={[config.cylinderRadius, config.cylinderRadius, cylinderHeight, 32, 16, true]} />
          <meshBasicMaterial color="#0066ff" wireframe transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
});

export default HelixScene;
