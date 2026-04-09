"use client";
import { ReactLenis } from "lenis/react";

function SmoothScrolling({ children }: any) {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothTouch: true }}>
      {children}
    </ReactLenis>
  );
}

export default SmoothScrolling;
