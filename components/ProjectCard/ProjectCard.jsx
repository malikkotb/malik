"use client";

import { useRef } from "react";

export default function ProjectCard({ link, title, videoSrc }) {
  const videoRef = useRef(null);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <div
      onClick={() => window.open(link, "_blank")}
      className='group cursor-pointer'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className='aspect-[5/3] rounded-[8px] overflow-hidden relative'>
        {videoSrc && (
          <video
            ref={videoRef}
            src={videoSrc}
            className='block w-full h-full object-cover'
            loop
            muted
            playsInline
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
      <a href={link} target='_blank' className='projectLink'>
        View the project ↗
      </a>
    </div>
  );
}
