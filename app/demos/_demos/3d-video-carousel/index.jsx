"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import ThreeDVideoCarousel from "@/components/demos/ThreeDVideoCarousel";

export default function ThreeDVideoCarouselDemo() {
  // Initialize Lenis for smooth scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    // Make Lenis available globally for carousel integration
    if (typeof window !== "undefined") {
      window.lenis = lenis;
    }

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      if (typeof window !== "undefined") {
        delete window.lenis;
      }
    };
  }, []);

  return (
    <main className="w-full min-h-[150vh] bg-white">
      {/* Spacer to allow scrolling before carousel */}
      <section className="h-[60vh] flex items-center justify-center">
        <div className="text-center text-black">
          <h1 className="text-4xl font-bold mb-4">3D Video Carousel</h1>
          <p className="text-zinc-600">Scroll down to see the carousel rotate</p>
        </div>
      </section>

      {/* The 3D Video Carousel */}
      <ThreeDVideoCarousel />

      {/* Spacer after carousel */}
    </main>
  );
}
