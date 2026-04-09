"use client";
import { useEffect } from "react";
import Lenis from "lenis";

function SmoothScrolling({ children }: any) {
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.1, duration: 1.5 });
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  return <>{children}</>;
}

export default SmoothScrolling;
