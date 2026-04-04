'use client';
import { useEffect, useRef, useCallback } from 'react';
import styles from './page.module.scss';
import Image from 'next/image';

const images = [
  "1.jpg",
  "2.jpg",
  "3.jpg",
  "4.jpg",
  "5.jpg",
  "6.jpg",
  "7.jpg",
  "8.jpg",
  "9.jpg",
  "10.jpg",
  "11.jpg",
  "12.jpg",
];

// Each column gets 3 images and a different scroll speed
const columns = [
  { images: [images[0], images[1], images[2]], speed: 1 },
  { images: [images[3], images[4], images[5]], speed: 1.6 },
  { images: [images[6], images[7], images[8]], speed: 0.8 },
  { images: [images[9], images[10], images[11]], speed: 1.4 },
];

const LERP_FACTOR = 0.05;
const LERP_THRESHOLD = 0.01;
const LINE_HEIGHT = 100 / 6;
const WHEEL_MULTIPLIER = 1;
const TOUCH_MULTIPLIER = 2;

export default function SmoothParallaxScroll() {
  const containerRef = useRef(null);
  const columnInnerRefs = useRef([]);
  // Measured cycle height per column (offsetTop of second set)
  const cycleHeights = useRef([]);
  const targetScrollRef = useRef(0);
  const animatedScrollRef = useRef(0);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);

  // Measure each column's true cycle height after layout
  const measureCycles = useCallback(() => {
    columns.forEach((_, i) => {
      const innerEl = columnInnerRefs.current[i];
      if (!innerEl) return;
      // The second set wrapper is the child at index 1
      const secondSet = innerEl.children[1];
      if (secondSet) {
        cycleHeights.current[i] = secondSet.offsetTop;
      }
    });
  }, []);

  const animate = useCallback(() => {
    const target = targetScrollRef.current;
    const current = animatedScrollRef.current;
    const distance = Math.abs(target - current);
    const next =
      distance < LERP_THRESHOLD
        ? target
        : current + (target - current) * LERP_FACTOR;

    animatedScrollRef.current = next;

    columns.forEach((col, i) => {
      const innerEl = columnInnerRefs.current[i];
      const cycleH = cycleHeights.current[i];
      if (!innerEl || !cycleH) return;

      const offset = next * col.speed;
      const wrapped = -(((offset % cycleH) + cycleH) % cycleH);

      innerEl.style.transform = `translate3d(0,${wrapped}px,0)`;
    });

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    measureCycles();
    rafRef.current = requestAnimationFrame(animate);

    const observer = new ResizeObserver(measureCycles);
    columnInnerRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [animate, measureCycles]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const { deltaY, deltaMode } = e;
      const multiplier =
        deltaMode === 1
          ? LINE_HEIGHT
          : deltaMode === 2
            ? window.innerHeight
            : 1;
      targetScrollRef.current += deltaY * multiplier * WHEEL_MULTIPLIER;
    };

    const handleTouchStart = (e) => {
      const touch = e.targetTouches?.[0] ?? e.changedTouches?.[0];
      if (!touch) return;
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      const touch = e.targetTouches?.[0] ?? e.changedTouches?.[0];
      if (!touch) return;
      const deltaY = -(touch.clientY - touchStartRef.current.y) * TOUCH_MULTIPLIER;
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      targetScrollRef.current += deltaY;
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const renderSet = (colImages, setIndex) => (
    <div key={setIndex} className={styles.set}>
      {colImages.map((src, j) => (
        <div key={`${setIndex}-${j}`} className={styles.imageContainer}>
          <Image
            src={`/images/smooth-parallax-scroll/${src}`}
            alt="image"
            fill
          />
        </div>
      ))}
    </div>
  );

  return (
    <main ref={containerRef} className={styles.gallery}>
      {columns.map((col, i) => (
        <div key={i} className={styles.column}>
          <div ref={(el) => (columnInnerRefs.current[i] = el)} className={styles.columnInner}>
            {/* 3 copies: enough buffer so the seam is never visible */}
            {renderSet(col.images, 0)}
            {renderSet(col.images, 1)}
            {renderSet(col.images, 2)}
          </div>
        </div>
      ))}
    </main>
  );
}
