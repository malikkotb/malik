"use client";
import ActionCall from "@/components/ActionCall/ActionCall";
import Header from "@/components/Header";
import Lenis from "lenis";
import { useEffect, useRef } from "react";
import Services from "@/components/Services/Services";
import About from "@/components/About/About";
import Work from "@/components/Work/Work";
import StickyFooter from "@/components/StickyFooter";
import Link from "next/link";

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
    <div className='h-full w-full'>
      <div className='flex h-[calc(100vh-48px)] flex-col justify-center lg:grid grid-cols-12 gap-[20px] lg:items-center w-full'>
        <div className='leading-[110%] pb-[10%] text-[24px] col-start-2 col-span-5 flex flex-col'>
          <div className='flex flex-col'>
            <span className='whitespace-nowrap'>
              Creating web experiences
            </span>
            <span className='text-zinc-400'>
              for mission-driven brands.
            </span>
          </div>
          {/* <Link
            href='/work'
            className='see-work-btn text-base mt-5 rounded-full border border-black px-4 pt-1.5 pb-2 w-fit cursor-pointer'
            onMouseEnter={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch(() => { });
              }
            }}
          >
            <span className='see-work-btn-text'>See my work</span>
          </Link> */}
        </div>
        <div className='col-start-7 col-span-5 aspect-[5/3] flex flex-col'>
          <video
            src='https://malik-portfolio.b-cdn.net/reel.mp4'
            className='object-cover w-full h-full'
            autoPlay
            muted
            loop
          />
        </div>
      </div>
      {/* <Work /> */}
      <Services />
      {/* <Projects projects={services} /> */}
      <About />
      {/* <Testimonials /> */}
      <ActionCall />
    </div>
  );
}

