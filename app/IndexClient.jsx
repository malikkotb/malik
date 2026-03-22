"use client";
import projects from "@/app/carouselData";
import dynamic from "next/dynamic";
import Work from "@/components/Work/Work";

// Dynamically import WebGLCarousel to prevent it from blocking initial render
// const WebGLCarousel = dynamic(
//   () => import("@/components/WebGLCarousel/WebGLCarousel"),
//   { ssr: false }
// );

// Testing with image-based carousel
// const WebGLCarouselImages = dynamic(
//   () => import("@/components/WebGLCarousel/WebGLCarouselImages"),
//   { ssr: false }
// );

const HeroCarousel = dynamic(
  () => import("@/components/HeroCarousel/HeroCarousel"),
  { ssr: false }
);

export default function IndexClient() {
  // const mobileContainerRef = useRef(null);

  // // Mobile playback enforcement
  // useEffect(() => {
  //   const isMobile = window.innerWidth < 1024; // lg breakpoint
  //   if (!isMobile || !mobileContainerRef.current) return;

  //   const videos = mobileContainerRef.current.querySelectorAll('video');

  //   const playVideo = async (video) => {
  //     try {
  //       await video.play();
  //     } catch (error) {
  //       // If autoplay fails, try again after a short delay
  //       setTimeout(() => {
  //         video.play().catch(() => { });
  //       }, 100);
  //     }
  //   };

  //   const setupVideo = (video) => {
  //     if (video.readyState >= 2) {
  //       playVideo(video);
  //     } else {
  //       video.addEventListener('canplay', () => playVideo(video), { once: true });
  //     }
  //   };

  //   videos.forEach(setupVideo);

  //   // Monitor and restart paused videos
  //   const intervalId = setInterval(() => {
  //     videos.forEach((video) => {
  //       if (video.paused && !video.ended) {
  //         playVideo(video);
  //       }
  //     });
  //   }, 1000);

  //   return () => clearInterval(intervalId);
  // }, []);

  return (
    <div className='flex-1 w-full flex flex-col justify-between' data-transition-content>
      <h1 className="hero-heading lg:max-w-[75vw] mt-[2rem] lg:mt-[3rem] z-[50]">
        Malik Kotb is a web designer and developer focused on beautiful execution, smooth animations, and immersive 3D to elevate web experiences beyond what's thought possible.
      </h1>
      {/* <h1 className="hero-heading lg:max-w-[75vw] z-[50]" style={{ fontFamily: "haas-grotesk" }}>
        Malik Kotb is a web designer and developer focused on beautiful execution, smooth animations, and immersive 3D to elevate web experiences beyond what's thought possible.
      </h1> */}
      <div className="">
        <div className="hidden lg:block">
          {/* {showCarousel && <WebGLCarousel />} */}
          {/* <WebGLCarouselImages /> */}
          <HeroCarousel />
        </div>
        {/* <div className="text-center h-[30vh] flex items-center justify-center uppercase">
        Creative Web Development
        </div> */}
        <div className="lg:hidden bg-white">
          <Work isHomePage />
        </div>
      </div>
    </div>
  );
}
