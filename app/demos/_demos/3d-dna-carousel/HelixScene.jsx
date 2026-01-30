'use client';

import { useRef, useMemo, memo, createRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import HelixSlide from './HelixSlide';
import { slides } from './data';
import { defaultConfig } from './config';
import { calculateHelixPosition, wrap, isVisible } from './utils';

const HelixScene = memo(function HelixScene({ dragState, config = defaultConfig }) {
  const { camera } = useThree();
  const slideRefs = useRef([]);
  const smoothScroll = useRef(0);

  // Calculate the total height of one set
  const totalHeight = useMemo(() => {
    return slides.length * config.itemSpacing;
  }, [config.itemSpacing]);

  // Create items for 3 sets (before, current, after) for seamless looping
  const items = useMemo(() => {
    const allItems = [];

    // Create 3 copies: -1, 0, 1
    for (let setIndex = -1; setIndex <= 1; setIndex++) {
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
  }, []);

  // Animation loop with momentum decay
  useFrame((_, delta) => {
    const state = dragState.current;
    const decay = config.momentumDecay;

    // Apply momentum when not dragging
    if (!state.isDragging) {
      state.velocity *= decay;
      if (Math.abs(state.velocity) < 0.001) state.velocity = 0;
      state.targetScroll += state.velocity * delta;
    }

    // Smooth the scroll
    smoothScroll.current += (state.targetScroll - smoothScroll.current) * config.smoothing;

    // Wrap scroll value for infinite looping
    const wrappedScroll = wrap(0, totalHeight, smoothScroll.current);

    // Calculate camera Y position (follows scroll)
    const cameraY = wrappedScroll;
    camera.position.y = cameraY;
    camera.lookAt(0, cameraY, 0);

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

      // Visibility culling and opacity
      const visible = isVisible(pos.y, cameraY, config.visibleRange, config.itemSpacing);
      slideRef.current.visible = visible;

      // Distance-based opacity for smooth fade at edges
      if (visible) {
        const distance = Math.abs(pos.y - cameraY);
        const maxDistance = config.visibleRange * config.itemSpacing;
        const opacity = 1 - Math.pow(distance / maxDistance, 2);

        // Update opacity uniform if available
        if (slideRef.current.children[0]?.material?.uniforms?.uOpacity) {
          slideRef.current.children[0].material.uniforms.uOpacity.value = Math.max(0.2, opacity);
        }
      }
    });
  });

  return (
    <group>
      {items.map((item, i) => (
        <group key={item.key} ref={slideRefs.current[i]}>
          <HelixSlide slideData={item} />
        </group>
      ))}
    </group>
  );
});

export default HelixScene;
