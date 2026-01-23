"use client";

import { useEffect, useRef } from "react";

export default function SpectralGLBackground() {
  const containerRef = useRef(null);
  const effectRef = useRef(null);

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 50; // Try for about 5 seconds (50 * 100ms)

    // Wait for DOM to be ready and spectralGL to be available
    const initSpectralGL = () => {
      if (typeof window !== "undefined" && window.spectraGL) {
        if (effectRef.current) {
          // Cleanup existing effect if any
          if (effectRef.current.destroy) {
            effectRef.current.destroy();
          }
        }

        effectRef.current = window.spectraGL({
          target: ".spectraGL", // CSS selector for the element(s) to apply effects
          mode: "aurora", // Visual mode: aurora, shimmer, pixel, komorebi, nebula, floral, oil, diva

          // Colours (7-colour spectrum for rainbow modes)
          colors: [
            "#e9e8e8",
            "#4ecdc4",
            "#45b7d1",
            "#f9ca24",
            "#6c5ce7",
            "#00b894",
            "#fd79a8",
          ],

          colorBlend: "smooth", // Blend mode: smooth, sharp, stepped
          colorBalance: [1, 1, 1, 1, 1, 1, 1], // Individual colour intensities

          // Geometry & Animation
          meshDetail: 32, // Mesh subdivision (16=low, 32=balanced, 64=high)
          foldIntensity: 0.5, // Effect intensity/complexity
          foldScale: 1.0, // Pattern scale
          foldSpeed: 1.0, // Animation speed multiplier
          speed: 1.0, // Global speed control
          direction: "auto", // Flow direction: auto, up, down, left, right

          // Lighting
          rimLight: false,
          rimIntensity: 0.8,
          rimColor: "#ffffff",
          rimFalloff: 2,

          // Texture
          grain: 0.01, // Film grain amount

          // Reactivity
          reactive: true, // Enable mouse interaction
          reactiveStrength: 0.3, // Mouse influence strength
          displacementStrength: 0.3, // Velocity-based displacement
          mouseRadius: 0.15, // Mouse influence radius
          scrollReactive: false, // Enable scroll interaction
          scrollStrength: 0.2, // Scroll influence strength

          // Performance
          qualityPreset: "balanced", // Quality: low, balanced, high
          maxFPS: 60, // Frame rate limit: 30, 60, 120

          // Border Mode (for buttons, cards etc.)
          border: {
            enabled: false, // Enable border mode
            width: 2, // Border width in pixels
            radius: null, // Border radius (null = inherit from element)
          },

          // Development Helper
          helper: false, // Enable to design visually and copy code, disable for production

          on: {
            init(instance) {
              // The `init` callback fires once spectraGL has initialised
              // and rendered the first frame
              console.log("spectraGL ready!", instance);
            },
          },
        });
      } else {
        // If spectralGL is not loaded yet, try again after a short delay
        retryCount++;
        if (retryCount < maxRetries) {
          setTimeout(initSpectralGL, 100);
        } else {
          console.warn(
            "spectraGL script not found. Please ensure /demos/scripts/spectraGL.min.js exists in the public directory."
          );
        }
      }
    };

    // Try to initialize immediately
    initSpectralGL();

    // Cleanup on unmount
    return () => {
      if (effectRef.current && effectRef.current.destroy) {
        effectRef.current.destroy();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className='spectraGL fixed inset-0 w-full h-full'
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
      }}
    ></div>
  );
}
