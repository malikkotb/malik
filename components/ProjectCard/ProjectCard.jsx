"use client";

import { useRef, useState, useEffect } from "react";

// Global tracker to ensure only one video plays at a time
let currentlyPlayingVideo = null;
// Store reference to reset function for the currently playing card
let resetPreviousCard = null;

export default function ProjectCard({ link, title, videoSrc }) {
  const videoRef = useRef(null);
  // Mobile detection determines behavior differences
  const [isMobile, setIsMobile] = useState(false);
  const [posterSrc, setPosterSrc] = useState(null);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    // Generate poster from first frame of video
    if (videoSrc && videoRef.current) {
      const video = videoRef.current;

      const generatePoster = () => {
        if (video.readyState >= 2) {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
          setPosterSrc(dataUrl);
        }
      };

      video.addEventListener("loadeddata", generatePoster);

      return () => {
        video.removeEventListener("loadeddata", generatePoster);
      };
    }
  }, [videoSrc]);

  useEffect(() => {
    // Ensure videos always play on mobile
    if (isMobile && videoRef.current && videoSrc) {
      const video = videoRef.current;

      const playVideo = async () => {
        try {
          await video.play();
        } catch (error) {
          // If autoplay fails, try again after a short delay
          setTimeout(() => {
            video.play().catch(() => {
              // Ignore autoplay errors
            });
          }, 100);
        }
      };

      // Try to play when video is ready
      if (video.readyState >= 2) {
        playVideo();
      } else {
        video.addEventListener("canplay", playVideo, { once: true });
        video.addEventListener("loadeddata", playVideo, {
          once: true,
        });
      }

      // Monitor and restart if paused (except during user interaction pauses)
      const checkPlaying = () => {
        if (video.paused && !video.ended) {
          playVideo();
        }
      };

      const intervalId = setInterval(checkPlaying, 1000);

      return () => {
        video.removeEventListener("canplay", playVideo);
        video.removeEventListener("loadeddata", playVideo);
        clearInterval(intervalId);
      };
    }
  }, [isMobile, videoSrc]);

  const handleMouseEnter = () => {
    if (videoRef.current && !isMobile) {
      // Pause any currently playing video
      if (
        currentlyPlayingVideo &&
        currentlyPlayingVideo !== videoRef.current
      ) {
        currentlyPlayingVideo.pause();
      }
      // Set as currently playing and play
      currentlyPlayingVideo = videoRef.current;
      videoRef.current.play();
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current && !isMobile) {
      // Clear the currently playing video when mouse leaves
      if (currentlyPlayingVideo === videoRef.current) {
        currentlyPlayingVideo = null;
      }
      videoRef.current.pause();
    }
  };

  const handleClick = () => {
    // Open link on both mobile and desktop
    window.open(link, "_blank");
  };

  return (
    <div
      onClick={handleClick}
      className='group cursor-pointer'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className='aspect-[5/3] rounded-[4px] overflow-hidden relative shadow-lg'>
        {videoSrc && (
          <video
            ref={videoRef}
            src={videoSrc}
            poster={posterSrc || undefined}
            className='block w-full h-full object-cover'
            loop
            muted
            playsInline
            autoPlay={isMobile}
            preload='auto'
          />
        )}
      </div>
      <h3
        style={{
          fontWeight: 500,
          lineHeight: "120%",
          letterSpacing: "0.01em",
          marginTop: "0.5rem",
        }}
        className='text-[16px]'
      >
        {title}
      </h3>
      <a
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          window.open(link, "_blank");
        }}
        className='projectLink cursor-pointer opacity-50 text-[14px] md:text-[16px]'
      >
        View the project ↗
      </a>
    </div>
  );
}
