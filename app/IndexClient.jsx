"use client";
import { useState, useEffect, useRef } from "react";
import projects from "@/app/carouselData";
import dynamic from "next/dynamic";
import Work from "@/components/Work/Work";

// Dynamically import WebGLCarousel to prevent it from blocking initial render
const WebGLCarousel = dynamic(
  () => import("@/components/WebGLCarousel/WebGLCarousel"),
  { ssr: false }
);

export default function IndexClient() {
  // Delay mounting WebGLCarousel until after loading screen animation completes
  const [showCarousel, setShowCarousel] = useState(false);
  const mobileContainerRef = useRef(null);

  useEffect(() => {
    // Loading screen: 1.5s load animation + 0.5s fadeout starting at 2s = ~2.5s total
    // We delay mounting to avoid blocking the main thread during animation
    const timer = setTimeout(() => {
      setShowCarousel(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Mobile playback enforcement
  useEffect(() => {
    const isMobile = window.innerWidth < 1024; // lg breakpoint
    if (!isMobile || !mobileContainerRef.current) return;

    const videos = mobileContainerRef.current.querySelectorAll('video');

    const playVideo = async (video) => {
      try {
        await video.play();
      } catch (error) {
        // If autoplay fails, try again after a short delay
        setTimeout(() => {
          video.play().catch(() => { });
        }, 100);
      }
    };

    const setupVideo = (video) => {
      if (video.readyState >= 2) {
        playVideo(video);
      } else {
        video.addEventListener('canplay', () => playVideo(video), { once: true });
      }
    };

    videos.forEach(setupVideo);

    // Monitor and restart paused videos
    const intervalId = setInterval(() => {
      videos.forEach((video) => {
        if (video.paused && !video.ended) {
          playVideo(video);
        }
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className='h-full w-full'>
      <div className="hidden lg:block">
        {showCarousel && <WebGLCarousel />}
      </div>
      {/* <div className="text-center h-[30vh] flex items-center justify-center uppercase">
        Creative Web Development
      </div> */}
      <div className="lg:hidden pt-[30vh]" ref={mobileContainerRef}>
        <Work />
        {/* <div className="flex flex-col gap-4" style={{ paddingTop: "30vh" }}>
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
                    autoPlay
                    preload='auto'
                  />
                )}


              </div>
            );
          })}
        </div> */}
      </div>
    </div>
  );
}
