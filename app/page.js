"use client";
import ActionCall from "@/components/ActionCall/ActionCall";
import Header from "@/components/Header";
import ProjectCard from "@/components/ProjectCard/ProjectCard";
import projects from "@/app/data";
import Lenis from "lenis";
import { useEffect } from "react";
import Services from "@/components/Services/Services";
import Projects from "@/components/ServicesSection/projects";

export default function Home() {
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
    <div className='h-full w-full bg-black text-white'>
      <Header />
      <div
        style={{ lineHeight: 1, height: "calc(100vh - 16px)" }}
        className='flex relative items-center w-full'
      >
        <div className='text-[10vw] md:text-[5vw] xl:text-[4vw]'>
          We use design and technology to create web experiences that
          perform, delight, and scale.
        </div>
        <div className='text-sm lg:text-3xl leading-none absolute flex justify-between bottom-0 left-0 pb-4 w-full'>
          <div>Brands we have worked with.</div>
          <div className='opacity-50'>See the latest results.</div>
        </div>
      </div>
      <div
        id='projects'
        className='h-full grid gap-4 gap-y-8 grid-cols-1 lg:grid-cols-2'
      >
        {projects.map((project, i) => {
          return (
            <ProjectCard
              key={i}
              title={project.projectTitle}
              videoSrc={project.videoSrc}
              link={project.link}
            />
          );
        })}
      </div>
      {/* <Services />
      <Projects /> */}
      {/* About section */}
      <ActionCall />
    </div>
  );
}
