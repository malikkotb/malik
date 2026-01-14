"use client";
import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";

const DURATION = 1500; // Loading duration in ms
const FADE_DELAY = 500; // Delay before fade out in ms
const FADE_DURATION = 500; // Fade out duration in ms

export default function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const overlayRef = useRef(null);
  const lineRef = useRef(null);

  useEffect(() => {
    if (!overlayRef.current || !lineRef.current) return;

    // Create timeline for sequential animations
    const tl = gsap.timeline({
      onComplete: () => {
        setIsVisible(false);
      },
    });

    // Animate loading bar from 0 to 150px (grows left to right)
    tl.to(lineRef.current, {
      width: 150,
      duration: DURATION / 1000, // Convert to seconds
      ease: "none",
      force3D: false, // Don't use transforms
    });

    // Wait 0.5s delay, then fade out overlay
    tl.to(
      overlayRef.current,
      {
        opacity: 0,
        duration: FADE_DURATION / 1000,
        ease: "power2.out",
      },
      `+=${FADE_DELAY / 1000}` // Add delay after previous animation
    );

    return () => {
      tl.kill();
      gsap.killTweensOf([overlayRef.current, lineRef.current]);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      ref={overlayRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
        opacity: 1,
        pointerEvents: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          width: 150,
        }}
      >
        <div
          ref={lineRef}
          style={{
            width: 0,
            height: 1,
            backgroundColor: "#000000",
          }}
        />
      </div>
    </div>
  );
}
