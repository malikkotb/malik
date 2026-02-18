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
const WebGLCarouselImages = dynamic(
  () => import("@/components/WebGLCarousel/WebGLCarouselImages"),
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
    <div className='h-full w-full' data-transition-content>
      <div className="hidden lg:block">
        {/* {showCarousel && <WebGLCarousel />} */}
        <WebGLCarouselImages />
      </div>
      {/* <div className="text-center h-[30vh] flex items-center justify-center uppercase">
        Creative Web Development
      </div> */}
      <div className="lg:hidden pt-[30vh]">
        <Work />
      </div>
    </div>
  );
}
