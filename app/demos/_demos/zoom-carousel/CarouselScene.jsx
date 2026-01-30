'use client';

import { useRef, useMemo, memo, createRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import CarouselSlide from './CarouselSlide';
import { slides } from './data';

const CarouselScene = memo(function CarouselScene({
  dragState,
  mouseRef,
}) {
  const { viewport, size } = useThree();
  const groupRef = useRef();
  const smoothProgress = useRef(0);
  const slideRefs = useRef([]);

  // Calculate layout based on viewport
  const layout = useMemo(() => {
    const pxToViewport = (px) => (px / size.height) * viewport.height;

    // Fixed values
    const gap = pxToViewport(-75); // Negative gap - slides overlap
    const slideHeight = pxToViewport(350);

    // 4:5 aspect ratio (vertical)
    const aspect = 4 / 5;
    const slideWidth = slideHeight * aspect;

    const totalWidth = slides.length * (slideWidth + gap);

    return { gap, slideHeight, slideWidth, totalWidth };
  }, [viewport.height, size.height]);

  // Animation loop with momentum decay
  useFrame((_, delta) => {
    const state = dragState.current;
    const decay = 0.92;

    // Apply momentum when not dragging
    if (!state.isDragging) {
      state.velocityX *= decay;
      if (Math.abs(state.velocityX) < 0.1) state.velocityX = 0;
      state.currentX += state.velocityX * delta;
    } else {
      // When dragging, currentX follows targetX
      state.currentX = state.targetX;
    }

    // Calculate scroll progress (normalized 0-1)
    const scrollProgress = state.currentX / layout.totalWidth;

    // Smooth the progress
    smoothProgress.current += (scrollProgress - smoothProgress.current) * 0.1;

    // Position the group for infinite loop
    if (groupRef.current) {
      const normalizedProgress = ((smoothProgress.current % 1) + 1) % 1;
      groupRef.current.position.x = -normalizedProgress * layout.totalWidth;

      // Update scale for each slide based on distance from center
      slideRefs.current.forEach((slideRef) => {
        if (slideRef && slideRef.current) {
          // Get world position of the slide
          const worldPos = slideRef.current.position.clone();
          worldPos.add(groupRef.current.position);

          // Calculate distance from center (0, 0, 0)
          const distanceFromCenter = Math.abs(worldPos.x);

          // Calculate scale factor (1.0 at center, decreases with distance)
          // Adjust the divisor to control how quickly scale decreases
          const maxDistance = layout.slideWidth * 2;
          const scaleFactor = Math.max(0.5, 1 - (distanceFromCenter / maxDistance) * 0.5);

          // Apply scale to slide
          slideRef.current.scale.set(
            layout.slideWidth * scaleFactor,
            layout.slideHeight * scaleFactor,
            1
          );
        }
      });
    }
  });

  // Create items for 3 sets (before, current, after) for seamless looping
  const items = useMemo(() => {
    const { totalWidth, slideWidth, slideHeight, gap } = layout;
    const allItems = [];

    // Create 3 copies: -1, 0, 1
    for (let setIndex = -1; setIndex <= 1; setIndex++) {
      slides.forEach((slide, idx) => {
        const x = setIndex * totalWidth + idx * (slideWidth + gap) + slideWidth / 2;
        allItems.push({
          ...slide,
          key: `${setIndex}-${idx}`,
          position: [x, 0, 0],
          scale: [slideWidth, slideHeight, 1],
        });
      });
    }

    // Initialize refs array to match items length
    slideRefs.current = allItems.map((_, i) => slideRefs.current[i] || createRef());

    return allItems;
  }, [layout]);

  return (
    <group ref={groupRef}>
      {items.map((item, i) => (
        <CarouselSlide
          key={item.key}
          ref={slideRefs.current[i]}
          position={item.position}
          scale={item.scale}
          slideData={item}
          mouseRef={mouseRef}
        />
      ))}
    </group>
  );
});

export default CarouselScene;
