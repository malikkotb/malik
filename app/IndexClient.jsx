"use client";
import dynamic from "next/dynamic";
import Work from "@/components/Work/Work";
import { useEffect, useRef } from "react";
import gsap from "gsap";

const HeroCarousel = dynamic(
  () => import("@/components/HeroCarousel/HeroCarousel"),
  { ssr: false }
);

export default function IndexClient() {
  const headingRef = useRef(null);

  useEffect(() => {
    gsap.from(headingRef.current, {
      y: "-60%",
      opacity: 0,
      duration: 0.7,
      ease: "cubic-bezier(0.7, 0, 0.3, 1)",
    });
  }, []);

  return (
    <div className='flex-1 w-full flex flex-col justify-between' data-transition-content>
      <div className="overflow-hidden">
      <h1 ref={headingRef} className="hero-heading lg:max-w-[75vw] mt-[2rem] lg:mt-[3rem] z-[50]">
        Malik Kotb is a web designer and developer focused on beautiful execution, smooth animations, and immersive 3D to elevate web experiences beyond what&apos;s thought possible.
      </h1>
      </div>
      <div className="">
        <div className="hidden lg:block">
          <HeroCarousel />
        </div>
        <div className="lg:hidden bg-white">
          <Work isHomePage />
        </div>
      </div>
    </div>
  );
}
