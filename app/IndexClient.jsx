"use client";
import dynamic from "next/dynamic";
import Work from "@/components/Work/Work";
import { useEffect, useRef } from "react";
import gsap from "gsap";

const HeroCarousel = dynamic(
  () => import("@/components/HeroCarousel/HeroCarousel"),
  { ssr: false }
);

const headingText =
  "Malik Kotb is a design engineer focused on beautiful execution, smooth animations, and immersive 3D to elevate web experiences beyond what\u2019s thought possible.";

const words = headingText.split(" ");

export default function IndexClient() {
  const headingRef = useRef(null);

  useEffect(() => {
    const chars = headingRef.current?.querySelectorAll(".char");
    if (!chars?.length) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    gsap.set(chars, { y: prefersReduced ? "0%" : "-60%", opacity: 0 });

    gsap.to(chars, {
      y: "0%",
      opacity: 1,
      duration: prefersReduced ? 0 : 0.7,
      ease: "power3.out",
      stagger: prefersReduced ? 0 : 0.5 / chars.length,
    });
  }, []);

  return (
    <div className='flex-1 w-full flex flex-col justify-between' data-transition-content>
      <div className="overflow-hidden">
        <h1 ref={headingRef} className="hero-heading lg:max-w-[75vw] mt-[3rem]">
          {words.map((word, wi) => (
            <span key={wi} className="inline-block" style={{ whiteSpace: "nowrap" }}>
              {word.split("").map((char, ci) => (
                <span key={ci} className="char inline-block" style={{ opacity: 0 }}>
                  {char}
                </span>
              ))}
              {wi < words.length - 1 && (
                <span className="char inline-block" style={{ opacity: 0 }}>&nbsp;</span>
              )}
            </span>
          ))}
        </h1>
      </div>
      <div className="">
        <div className="hidden lg:block">
          <HeroCarousel />
        </div>
        <div className="lg:hidden">
          <Work isHomePage />
        </div>
      </div>
    </div>
  );
}
