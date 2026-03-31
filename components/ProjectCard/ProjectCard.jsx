"use client";

import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Global tracker to ensure only one video plays at a time
let currentlyPlayingVideo = null;

function SplitTextReveal({ text, className, style }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    const chars = el?.querySelectorAll(".split-char");
    if (!chars?.length) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      return;
    }

    // Hide chars now (in JS, not JSX) so they're visible if JS never runs
    gsap.set(chars, { opacity: 0 });

    gsap.registerPlugin(ScrollTrigger);

    const setup = () => {
      ScrollTrigger.refresh();

      const rect = el.getBoundingClientRect();
      const alreadyInView = rect.top < window.innerHeight * 0.9;

      gsap.fromTo(
        chars,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.2,
          stagger: 0.2 / chars.length,
          ease: "power2.out",
          ...(!alreadyInView && {
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
            },
          }),
        }
      );
    };

    const timeout = setTimeout(setup, 300);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <span ref={containerRef} className={className} style={style}>
      {text.split("").map((char, i) => (
        <span key={i} className="split-char inline-block">
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}

export default function ProjectCard({ link, title, videoSrc }) {
  const cardRef = useRef(null);
  const videoRef = useRef(null);
  const isVisible = useRef(false);
  const [isMobile, setIsMobile] = useState(null);
  const [loadSrc, setLoadSrc] = useState(false);
  const [posterSrc, setPosterSrc] = useState(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Mobile: lazy load + play/pause with IntersectionObserver
  useEffect(() => {
    if (!isMobile || isMobile === null) return;
    const el = cardRef.current;
    if (!el) return;

    const loadObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoadSrc(true);
          loadObserver.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    const playObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible.current = entry.isIntersecting;
        const video = videoRef.current;
        if (!video) return;
        if (entry.isIntersecting) {
          setTimeout(() => video.play().catch(() => {}), 300);
        } else {
          video.pause();
        }
      },
      { rootMargin: "0px" }
    );

    loadObserver.observe(el);
    playObserver.observe(el);
    return () => {
      loadObserver.disconnect();
      playObserver.disconnect();
    };
  }, [isMobile]);

  // Mobile: play video when it first mounts if already visible
  useEffect(() => {
    if (!isMobile || !loadSrc || !isVisible.current) return;
    const raf = requestAnimationFrame(() => {
      const video = videoRef.current;
      if (video && isVisible.current) {
        setTimeout(() => video.play().catch(() => {}), 300);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [loadSrc, isMobile]);

  // Desktop: load immediately, generate poster
  useEffect(() => {
    if (isMobile === null || isMobile) return;
    setLoadSrc(true);
  }, [isMobile]);

  useEffect(() => {
    if (!videoSrc || !videoRef.current || isMobile) return;
    const video = videoRef.current;

    const generatePoster = () => {
      if (video.readyState >= 2) {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        try {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          setPosterSrc(canvas.toDataURL("image/jpeg", 0.8));
        } catch (error) {
          console.warn("Unable to generate poster frame", error);
        }
      }
    };

    video.addEventListener("loadeddata", generatePoster);
    video.pause();
    video.currentTime = 0;
    return () => video.removeEventListener("loadeddata", generatePoster);
  }, [videoSrc, isMobile, loadSrc]);

  const handleMouseEnter = () => {
    if (videoRef.current && !isMobile) {
      if (currentlyPlayingVideo && currentlyPlayingVideo !== videoRef.current) {
        currentlyPlayingVideo.pause();
      }
      currentlyPlayingVideo = videoRef.current;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current && !isMobile) {
      if (currentlyPlayingVideo === videoRef.current) {
        currentlyPlayingVideo = null;
      }
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <a
      ref={cardRef}
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className='group cursor-pointer'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className='aspect-[5/3] overflow-hidden relative rounded-[4px]'>
        {videoSrc && loadSrc ? (
          <video
            ref={videoRef}
            src={videoSrc}
            crossOrigin='anonymous'
            poster={posterSrc || undefined}
            className='block w-full h-full object-cover'
            loop
            muted
            playsInline
            preload={isMobile ? "metadata" : "auto"}
            disableRemotePlayback
            disablePictureInPicture
          />
        ) : (
          <div className='w-full h-full bg-neutral-100' />
        )}
      </div>
      <h3
        style={{
          fontWeight: 500,
          lineHeight: "120%",
          letterSpacing: "0.01em",
          marginTop: "0.5rem",
          fontSize: "0.875rem",
        }}
        className='w-fit projectLink'
      >
        {isMobile ? (
          <SplitTextReveal text={title} />
        ) : (
          title
        )}
      </h3>
    </a>
  );
}
