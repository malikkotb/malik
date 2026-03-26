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
  "Malik Kotb is a web designer and developer focused on beautiful execution, smooth animations, and immersive 3D to elevate web experiences beyond what\u2019s thought possible.";

export default function IndexClient() {
  const headingRef = useRef(null);

  useEffect(() => {
    const chars = headingRef.current?.querySelectorAll(".char");
    if (!chars?.length) return;

    gsap.to(chars, {
      y: "0%",
      opacity: 1,
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.5 / chars.length,
    });
  }, []);

  return (
    <div className='flex-1 w-full flex flex-col justify-between' data-transition-content>
      <div className="overflow-hidden">
        <h1 ref={headingRef} className="hero-heading lg:max-w-[75vw] mt-[3rem] z-[50]">
          {headingText.split(" ").map((word, wi) => (
            <span key={wi} className="inline-block" style={{ whiteSpace: "nowrap" }}>
              {word.split("").map((char, ci) => (
                <span
                  key={ci}
                  className="char inline-block"
                  style={{ opacity: 0, transform: "translateY(-60%)" }}
                >
                  {char}
                </span>
              ))}
              {wi < headingText.split(" ").length - 1 && (
                <span className="char inline-block" style={{ opacity: 0, transform: "translateY(-60%)" }}>&nbsp;</span>
              )}
            </span>
          ))}
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
