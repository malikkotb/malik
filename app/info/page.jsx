"use client";

import ActionCall from "@/components/ActionCall/ActionCall";
import Lenis from "lenis";
import { useEffect, useRef } from "react";
import InteractiveLinks from "@/components/InteractiveLinks/InteractiveLinks";
import InfoPageScene from "@/components/InfoPageScene/InfoPageScene";
import Link from "next/link";
import Services from "@/components/Services/Services";

const bioText = `Malik Kotb is a web designer and developer who loves design, motion, and pushing the boundaries of what's possible on the web.

He builds websites that look great and work smoothly, with a focus on beautiful execution and precise attention to detail.

His expertise lies in elevating web experiences through eye-catching design, smooth animations, and immersive 3D elements using WebGL and Three.js.`;

const services = [
  "Web Design",
  "Figma",
  "Frontend Development",
  "Next.js",
  "React",
  "WebGL",
  "Three.js",
  "Creative Coding",
  "Headless CMS",
  "Sanity",
  "Headless E-commerce",
  "Shopify",
  "Webflow",
];

export default function IndexClient() {
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio("/tap_01.wav");
    audioRef.current.volume = 0.5;
  }, []);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    // Make Lenis available globally
    if (typeof window !== "undefined") {
      window.lenis = lenis;
    }

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      if (typeof window !== "undefined") {
        delete window.lenis;
      }
    };
  }, []);

  return (
    <div className="h-full w-full bg-white">
      {/* Three.js scene with ripple effect on hero image only */}
      <InfoPageScene />

      {/* DOM content layer */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="min-h-[calc(100vh-12px)] flex flex-col justify-center">
          {/* Mobile: stacked layout, Desktop: grid layout */}
          <div className="flex flex-col gap-8 lg:grid lg:grid-cols-12 lg:gap-x-[20px] lg:items-center w-full">
            {/* Hero Text */}
            <div className="order-1 lg:col-start-2 lg:col-span-5 flex flex-col">
              <div className="leading-[110%] text-[24px] lg:text-[32px] flex flex-col">
                <span>Creating web experiences</span>
                <span className="text-zinc-400">for mission-driven brands.</span>
              </div>
            </div>

            {/* Hero Image placeholder - actual image rendered by Three.js on desktop */}
            <div className="order-2 lg:col-start-7 lg:col-span-5 aspect-[4/3] lg:block hidden">
              {/* Image rendered by InfoPageScene with ripple effect */}
            </div>

            {/* Mobile: show actual image since Three.js is hidden */}
            <div className="order-1 lg:hidden w-full aspect-[4/3]">
              <img
                src="/about.jpeg"
                alt="Malik Kotb"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <Services />


        {/* ActionCall Section */}
        <div className="mt-20">
          <ActionCall />
        </div>
      </div>
    </div>
  );
}
