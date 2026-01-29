'use client';

import * as React from 'react';

// Discrete pixel size steps for visible pixelation effect
const PIXEL_STEPS = [40, 20, 10, 5, 2, 1];

export function PixelatedImage({
  src,
  alt,
  width = 350,
  aspectRatio = '4/5',
  stepDuration = 150,  // Duration per step in ms
  delay = 200,
  initialPixelSize = 40,
}) {
  const canvasRef = React.useRef(null);
  const imageRef = React.useRef(null);
  const stepTimeoutRef = React.useRef(null);
  const delayTimeoutRef = React.useRef(null);
  const currentStepRef = React.useRef(0);
  const isLoadedRef = React.useRef(false);

  // Calculate canvas dimensions from aspect ratio
  const [aspectW, aspectH] = aspectRatio.split('/').map(Number);
  const canvasHeight = Math.round(width * (aspectH / aspectW));

  // Draw pixelated image at given pixel size
  const drawPixelated = React.useCallback((pixelSize) => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || !isLoadedRef.current) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = canvas.width / dpr;
    const displayHeight = canvas.height / dpr;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (pixelSize <= 1) {
      // Final frame: draw at full resolution
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      return;
    }

    // Create off-screen canvas at reduced resolution
    const scaledWidth = Math.ceil(displayWidth / pixelSize);
    const scaledHeight = Math.ceil(displayHeight / pixelSize);

    const offscreen = document.createElement('canvas');
    offscreen.width = scaledWidth;
    offscreen.height = scaledHeight;

    const offCtx = offscreen.getContext('2d');
    offCtx.drawImage(image, 0, 0, scaledWidth, scaledHeight);

    // Draw back to main canvas with smoothing disabled (nearest-neighbor)
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(offscreen, 0, 0, canvas.width, canvas.height);
  }, []);

  // Step through pixel sizes
  const animateStep = React.useCallback(() => {
    const stepIndex = currentStepRef.current;

    if (stepIndex >= PIXEL_STEPS.length) {
      // Animation complete
      stepTimeoutRef.current = null;
      return;
    }

    const pixelSize = PIXEL_STEPS[stepIndex];
    drawPixelated(pixelSize);

    currentStepRef.current = stepIndex + 1;

    if (currentStepRef.current < PIXEL_STEPS.length) {
      stepTimeoutRef.current = setTimeout(animateStep, stepDuration);
    } else {
      stepTimeoutRef.current = null;
    }
  }, [stepDuration, drawPixelated]);

  // Start animation
  const startAnimation = React.useCallback(() => {
    // Cancel any existing animation or delay
    if (stepTimeoutRef.current !== null) {
      clearTimeout(stepTimeoutRef.current);
    }
    if (delayTimeoutRef.current !== null) {
      clearTimeout(delayTimeoutRef.current);
    }
    currentStepRef.current = 0;

    // Delay before starting animation to show pixelated state
    if (delay > 0) {
      delayTimeoutRef.current = setTimeout(() => {
        delayTimeoutRef.current = null;
        animateStep();
      }, delay);
    } else {
      animateStep();
    }
  }, [animateStep, delay]);

  // Reset to pixelated state
  const resetToPixelated = React.useCallback(() => {
    if (stepTimeoutRef.current !== null) {
      clearTimeout(stepTimeoutRef.current);
      stepTimeoutRef.current = null;
    }
    if (delayTimeoutRef.current !== null) {
      clearTimeout(delayTimeoutRef.current);
      delayTimeoutRef.current = null;
    }
    currentStepRef.current = 0;
    drawPixelated(initialPixelSize);
  }, [initialPixelSize, drawPixelated]);

  // Setup canvas and load image
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = canvasHeight * dpr;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // Load the image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      isLoadedRef.current = true;
      // Draw initial pixelated state
      drawPixelated(initialPixelSize);
    };
    img.src = src;

    return () => {
      isLoadedRef.current = false;
    };
  }, [src, width, canvasHeight, initialPixelSize, drawPixelated]);

  // Setup Intersection Observer
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          startAnimation();
        } else {
          resetToPixelated();
        }
      },
      { threshold: 0.4 }  // Wait until 40% visible
    );

    observer.observe(canvas);

    return () => {
      observer.disconnect();
      if (stepTimeoutRef.current !== null) {
        clearTimeout(stepTimeoutRef.current);
      }
      if (delayTimeoutRef.current !== null) {
        clearTimeout(delayTimeoutRef.current);
      }
    };
  }, [startAnimation, resetToPixelated]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: width,
        height: canvasHeight,
        display: 'block',
      }}
      aria-label={alt}
      role="img"
    />
  );
}
