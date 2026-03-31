"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import projects from "@/app/carouselData";

const AUTO_SCROLL_SPEED = 0.00022;

function CarouselSlide({ item, carouselHeight, aspectRatio, isDraggingRef }) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="carousel-slide"
      onClick={(e) => { if (isDraggingRef.current) e.preventDefault(); }}
      style={{
        position: "relative",
        height: `calc(${carouselHeight} - 12px)`,
        width: `calc((${carouselHeight} - 12px) * ${aspectRatio})`,
        flexShrink: 0,
        overflow: "hidden",
        borderRadius: "4px",
        cursor: "inherit",
        display: "block",
      }}
    >
      <img
        src={item.imageSrc}
        alt={item.title}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          pointerEvents: "none",
          userSelect: "none",
          animation: "carouselEntrance 0.7s cubic-bezier(0.7, 0, 0.3, 1) forwards",
          opacity: 0,
        }}
        draggable={false}
      />

      {/* Gradient overlay */}
      <div
        className="carousel-overlay"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "20%",
          background: "linear-gradient(to top, rgba(26,26,24,0.28) 0%, rgba(26,26,24,0.18) 22%, rgba(26,26,24,0.09) 45%, rgba(26,26,24,0.03) 70%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Caption */}
      <div
        className="carousel-caption"
        style={{
          position: "absolute",
          bottom: "1rem",
          left: "1rem",
          pointerEvents: "none",
          color: "#fff",
          fontSize: "clamp(0.75rem, 0.725rem + 0.125vw, 0.875rem)",
          lineHeight: "100%",
          letterSpacing: "0.01em",
        }}
      >
        {item.title}
      </div>
    </a>
  );
}

export default function HeroCarousel() {
  const containerRef = useRef();
  const stripRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const animationFrameRef = useRef(null);
  const prefersReducedRef = useRef(false);

  const scrollStateRef = useRef({
    scrollProgress: 0,
    targetProgress: 0,
  });

  const layoutRef = useRef({ totalWidth: 0 });
  const lastPointerX = useRef(0);
  const aspectRatioRef = useRef(1.7778);

  const calculateLayout = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const itemHeight = container.offsetHeight - 12;
    const itemWidth = itemHeight * aspectRatioRef.current;
    layoutRef.current.totalWidth = projects.length * (itemWidth + 12);
  }, []);

  useEffect(() => {
    prefersReducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    calculateLayout();
    const resizeObserver = new ResizeObserver(calculateLayout);
    if (containerRef.current) resizeObserver.observe(containerRef.current);

    const animate = () => {
      const state = scrollStateRef.current;
      const { totalWidth } = layoutRef.current;

      if (!prefersReducedRef.current) {
        state.targetProgress += AUTO_SCROLL_SPEED;
      }

      state.scrollProgress += (state.targetProgress - state.scrollProgress) * 0.07;

      if (state.scrollProgress >= 1) {
        state.scrollProgress -= 1;
        state.targetProgress -= 1;
      } else if (state.scrollProgress < 0) {
        state.scrollProgress += 1;
        state.targetProgress += 1;
      }

      if (stripRef.current) {
        stripRef.current.style.transform = `translateX(${-(1 + state.scrollProgress) * totalWidth}px)`;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    const handleVisibility = () => {
      if (document.hidden) {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      } else {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [calculateLayout]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleWheel = (e) => {
      e.preventDefault();
      scrollStateRef.current.targetProgress += e.deltaY * 0.0003;
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  const handlePointerDown = useCallback((e) => {
    setIsDragging(true);
    isDraggingRef.current = true;
    lastPointerX.current = e.clientX;
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!isDraggingRef.current) return;
    const containerWidth = containerRef.current?.offsetWidth || window.innerWidth;
    scrollStateRef.current.targetProgress += (-(e.clientX - lastPointerX.current) / containerWidth) * 0.5;
    lastPointerX.current = e.clientX;
  }, []);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    isDraggingRef.current = false;
  }, []);

  const getResponsiveValues = () => ({
    height: window.innerWidth >= 1024 ? "55vh" : "50vh",
    aspectRatio: window.innerWidth < 768 ? 0.8 : 1.7778,
  });

  const [responsive, setResponsive] = useState(
    typeof window !== "undefined" ? getResponsiveValues() : { height: "50vh", aspectRatio: 1.7778 }
  );

  useEffect(() => {
    aspectRatioRef.current = responsive.aspectRatio;
  }, [responsive.aspectRatio]);

  useEffect(() => {
    const handleResize = () => {
      const values = getResponsiveValues();
      setResponsive(values);
      calculateLayout();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [calculateLayout]);

  const { height: carouselHeight, aspectRatio } = responsive;

  const allItems = [];
  for (let setIndex = -1; setIndex <= 1; setIndex++) {
    projects.forEach((project, idx) => {
      allItems.push({ ...project, key: `${setIndex}-${idx}` });
    });
  }

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Projects carousel"
      className="fixed bottom-0 left-0 w-full overflow-hidden"
      style={{
        height: carouselHeight,
        cursor: isDragging ? "grabbing" : "grab",
        touchAction: "none",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div
        ref={stripRef}
        style={{
          position: "absolute",
          bottom: "12px",
          left: 0,
          display: "flex",
          gap: "12px",
          willChange: "transform",
        }}
      >
        {allItems.map((item) => (
          <CarouselSlide
            key={item.key}
            item={item}
            carouselHeight={carouselHeight}
            aspectRatio={aspectRatio}
            isDraggingRef={isDraggingRef}
          />
        ))}
      </div>
    </div>
  );
}
