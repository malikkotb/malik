"use client";

import { useRef, useEffect, useMemo, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import CarouselScene from "./CarouselScene";
import { config } from "./config";
import projects from "@/app/carouselData";

export default function ThreeDVideoCarousel() {
  const containerRef = useRef();
  const rotationTargetRef = useRef(0);
  const sectionBoundsRef = useRef({ top: 0, bottom: 0 });

  // Calculate section bounds on mount and resize
  const updateSectionBounds = useCallback(() => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const scrollY = window.scrollY || window.pageYOffset;

    sectionBoundsRef.current = {
      top: rect.top + scrollY,
      bottom: rect.bottom + scrollY,
      height: rect.height
    };
  }, []);

  // Handle scroll to update rotation target
  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY || window.pageYOffset;
    const bounds = sectionBoundsRef.current;
    const viewportHeight = window.innerHeight;

    // Calculate when section is in view
    // Start: when section top enters viewport bottom
    // End: when section bottom leaves viewport top
    const sectionStart = bounds.top - viewportHeight;
    const sectionEnd = bounds.bottom;
    const totalScrollRange = sectionEnd - sectionStart;

    // Calculate progress (0 to 1) through section
    let progress = (scrollY - sectionStart) / totalScrollRange;
    progress = Math.max(0, Math.min(1, progress));

    // Map progress to rotation (show ~2 full rotations)
    const rotation = progress * Math.PI * 2 * config.scrollRotations;

    rotationTargetRef.current = rotation;
  }, []);

  // Set up scroll listener and Lenis integration
  useEffect(() => {
    updateSectionBounds();

    // Check if Lenis is available (from global)
    const lenis = typeof window !== "undefined" ? window.lenis : null;

    if (lenis) {
      // Use Lenis scroll events for smoother experience
      const onLenisScroll = () => {
        handleScroll();
      };
      lenis.on("scroll", onLenisScroll);

      return () => {
        lenis.off("scroll", onLenisScroll);
      };
    } else {
      // Fallback to native scroll
      window.addEventListener("scroll", handleScroll, { passive: true });

      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }
  }, [handleScroll, updateSectionBounds]);

  // Update bounds on resize
  useEffect(() => {
    window.addEventListener("resize", updateSectionBounds);
    return () => window.removeEventListener("resize", updateSectionBounds);
  }, [updateSectionBounds]);

  // Initial scroll position check
  useEffect(() => {
    // Delay to ensure layout is complete
    const timeout = setTimeout(() => {
      updateSectionBounds();
      handleScroll();
    }, 100);

    return () => clearTimeout(timeout);
  }, [handleScroll, updateSectionBounds]);

  // Camera configuration
  const cameraProps = useMemo(
    () => ({
      position: [0, 0, 5],
      fov: 50,
      near: 0.1,
      far: 100
    }),
    []
  );

  // GL configuration
  const glProps = useMemo(
    () => ({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
      stencil: false,
      depth: true
    }),
    []
  );

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[45vh] overflow-hidden"
      style={{
        background: "white"
      }}
    >
      <Canvas
        camera={cameraProps}
        gl={glProps}
        style={{ background: "transparent" }}
        frameloop="always"
        dpr={[1, 2]}
      >
        <CarouselScene
          rotationTargetRef={rotationTargetRef}
          videos={projects}
        />
      </Canvas>
    </section>
  );
}
