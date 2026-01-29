"use client";
import { useState, useEffect } from "react";
import projects from "@/app/carouselData";
import dynamic from "next/dynamic";

// Dynamically import WebGLCarousel to prevent it from blocking initial render
const WebGLCarousel = dynamic(
  () => import("@/components/WebGLCarousel/WebGLCarousel"),
  { ssr: false }
);

export default function IndexClient() {
  // Delay mounting WebGLCarousel until after loading screen animation completes
  const [showCarousel, setShowCarousel] = useState(false);

  useEffect(() => {
    // Loading screen: 1.5s load animation + 0.5s fadeout starting at 2s = ~2.5s total
    // We delay mounting to avoid blocking the main thread during animation
    const timer = setTimeout(() => {
      setShowCarousel(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className='h-full w-full'>
      <div className="hidden lg:block">
        {showCarousel && <WebGLCarousel />}
      </div>
      {/* <div className="text-center h-[30vh] flex items-center justify-center uppercase">
        Creative Web Development
      </div> */}
      <div className="lg:hidden">
        <div className="flex flex-col gap-4" style={{ paddingTop: "30vh" }}>
          {projects.map((project) => {
            const aspectClass = project.orientation === "vertical" 
              ? "aspect-[4/5]" 
              : "aspect-video";
            
            return (
              <div
                key={project.title}
                // href={project.link}
                className={`relative overflow-hidden ${aspectClass} w-full`}
                style={{ textDecoration: "none" }}
              >
              {project.videoSrc && (
                <video
                  src={project.videoSrc}
                  className='w-full h-full object-cover'
                  loop
                  muted
                  playsInline
                  // autoPlay
                  preload='auto'
                />
              )}

              {/* Title - Bottom Left */}
              <div
                style={{
                  position: "absolute",
                  bottom: "14px",
                  left: "14px",
                  color: "white",
                  fontSize: "12px",
                  fontWeight: 500,
                  pointerEvents: "none",
                }}
              >
                {project.title}
              </div>

              {/* Link - Bottom Right */}
              <div
                style={{
                  position: "absolute",
                  bottom: "14px",
                  right: "14px",
                  color: "white",
                  fontSize: "12px",
                  fontWeight: 500,
                  pointerEvents: "none",
                }}
              >
                {project.link
                  ?.replace(/^https?:\/\/(www\.)?/i, "")
                  .replace(/\/$/, "")}
              </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
