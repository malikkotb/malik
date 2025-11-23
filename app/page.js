"use client";
import ActionCall from "@/components/ActionCall/ActionCall";
import Header from "@/components/Header";
import ProjectCard from "@/components/ProjectCard/ProjectCard";
import projects from "@/app/data";
import Lenis from "lenis";
import { useEffect, useRef } from "react";
import Services from "@/components/Services/Services";
import Projects from "@/components/ServicesSection/projects";
import About from "@/components/About/About";
import HoverList from "@/components/HoverList/HoverList";
import Work from "@/components/Work/Work";

export default function Home() {
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

  useEffect(() => {
    const documentTitleStore = document.title;
    const documentTitleOnBlur =
      "Come back! It's nicer here with you.";

    // Set original title if user is on the site
    window.addEventListener("focus", () => {
      document.title = documentTitleStore;
    });

    // If user leaves tab, set the alternative title
    window.addEventListener("blur", () => {
      document.title = documentTitleOnBlur;
    });
  }, []);

  const services = [
    {
      service: "Web Design",
      description:
        "Creating visually stunning and user-friendly websites tailored to your brand.",
    },
    {
      service: "Web Development",
      description:
        "Building robust, scalable, and high-performing web applications.",
    },
    {
      service: "3D Development",
      description:
        "Crafting clear and compelling digital identities for mission-driven brands.",
    },
  ];

  return (
    <div className='h-full w-full'>
      <Header />
      <div className='flex h-[calc(100vh-48px)] flex-col justify-center lg:grid grid-cols-12 gap-[20px] lg:items-center w-full'>
        <div className='leading-[110%] pb-[10%] text-[24px] md:text-[32px] col-start-2 col-span-5 flex flex-col'>
          <div className='flex flex-col'>
            <span className='whitespace-nowrap'>
              Creating web experiences
            </span>
            <span className='text-zinc-400'>
              for mission-driven brands.
            </span>
          </div>
          <a
            href='#work'
            className='see-work-btn text-base mt-5 rounded-full border border-black px-4 py-2 w-fit cursor-pointer'
            onMouseEnter={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch(() => {});
              }
            }}
          >
            <span className='see-work-btn-text'>See my work</span>
          </a>
        </div>
        <div className='col-start-7 col-span-5 flex flex-col'>
          <video
            src='/1111.webm'
            className='rounded-[4px] shadow-xl object-cover w-full h-full'
            autoPlay
            muted
            loop
          />
        </div>
      </div>
      <Work />
      <Services />
      {/* <Projects projects={services} /> */}
      <About />
      {/* <Testimonials /> */}
      <ActionCall />
    </div>
  );
}
