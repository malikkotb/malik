"use client";

import { useRef, useState, useEffect } from "react";

// Global tracker to ensure only one video plays at a time
let currentlyPlayingVideo = null;
// Store reference to reset function for the currently playing card
let resetPreviousCard = null;

export default function ProjectCard({ link, title, videoSrc }) {
  const videoRef = useRef(null);
  const [hasPlayedOnMobile, setHasPlayedOnMobile] = useState(false);
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
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setPosterSrc(dataUrl);
        }
      };
      
      video.addEventListener('loadeddata', generatePoster);
      
      return () => {
        video.removeEventListener('loadeddata', generatePoster);
      };
    }
  }, [videoSrc]);


  const handleMouseEnter = () => {
    if (videoRef.current && !isMobile) {
      // Pause any currently playing video
      if (currentlyPlayingVideo && currentlyPlayingVideo !== videoRef.current) {
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
    if (isMobile && videoSrc) {
      if (!hasPlayedOnMobile) {
        // First click: play the video
        if (videoRef.current) {
          // Pause and reset any currently playing video from a different card
          if (currentlyPlayingVideo && currentlyPlayingVideo !== videoRef.current) {
            currentlyPlayingVideo.pause();
            if (resetPreviousCard) {
              resetPreviousCard(false);
            }
          }
          // Set as currently playing and play
          currentlyPlayingVideo = videoRef.current;
          resetPreviousCard = setHasPlayedOnMobile;
          videoRef.current.play();
          setHasPlayedOnMobile(true);
        }
      } else {
        // Second click: open the link
        // Clear the currently playing video
        if (currentlyPlayingVideo === videoRef.current) {
          currentlyPlayingVideo = null;
          resetPreviousCard = null;
        }
        window.open(link, "_blank");
      }
    } else {
      // Desktop: open link immediately
      window.open(link, "_blank");
    }
  };

  return (
    <div
      onClick={handleClick}
      className='group cursor-pointer'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className='aspect-[5/3] rounded-[8px] overflow-hidden relative'>
        {videoSrc && (
          <video
            ref={videoRef}
            src={videoSrc}
            poster={posterSrc || undefined}
            className='block w-full h-full object-cover'
            loop
            muted
            playsInline
            preload='auto'
            style={{ backgroundColor: '#000' }}
          />
        )}
      </div>
      <h3
        style={{
          fontWeight: 500,
          fontSize: "20px",
          lineHeight: "140%",
          letterSpacing: "0.01em",
          marginTop: "0.5rem",
        }}
        className=''
      >
        {title}
      </h3>
      <a 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          window.open(link, "_blank");
        }}
        className='projectLink cursor-pointer'
      >
        View the project ↗
      </a>
    </div>
  );
}
