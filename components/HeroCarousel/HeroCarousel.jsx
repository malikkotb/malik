"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import projects from "@/app/carouselData";

const AUTO_SCROLL_SPEED = 0.00022;

export default function HeroCarousel() {
  const containerRef = useRef();
  const stripRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const isHoveringRef = useRef(false);
  const [hoveredKey, setHoveredKey] = useState(null);

  const scrollStateRef = useRef({
    scrollProgress: 0,
    targetProgress: 0,
  });

  const layoutRef = useRef({ totalWidth: 0 });
  const lastPointerX = useRef(0);
  const animationFrameRef = useRef(null);

  const calculateLayout = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const itemHeight = container.offsetHeight - 12;
    const itemWidth = itemHeight * (16 / 9);
    layoutRef.current.totalWidth = projects.length * (itemWidth + 12);
  }, []);

  useEffect(() => {
    calculateLayout();
    const resizeObserver = new ResizeObserver(calculateLayout);
    if (containerRef.current) resizeObserver.observe(containerRef.current);

    const animate = () => {
      const state = scrollStateRef.current;
      const { totalWidth } = layoutRef.current;

      if (!isHoveringRef.current) {
        state.targetProgress += AUTO_SCROLL_SPEED;
      }

      state.scrollProgress += (state.targetProgress - state.scrollProgress) * 0.18;

      const normalizedProgress = ((state.scrollProgress % 1) + 1) % 1;
      if (stripRef.current) {
        stripRef.current.style.transform = `translateX(${-(1 + normalizedProgress) * totalWidth}px)`;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      resizeObserver.disconnect();
    };
  }, [calculateLayout]);

  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault();
      scrollStateRef.current.targetProgress += e.deltaY * 0.0003;
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
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

  const allItems = [];
  for (let setIndex = -1; setIndex <= 1; setIndex++) {
    projects.forEach((project, idx) => {
      allItems.push({ ...project, key: `${setIndex}-${idx}` });
    });
  }

  return (
    <div
      ref={containerRef}
      className="fixed bottom-0 left-0 w-full overflow-hidden"
      style={{ height: "65vh", cursor: isDragging ? "grabbing" : "grab", touchAction: "none" }}
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
          <div
            key={item.key}
            style={{
              position: "relative",
              height: "calc(65vh - 12px)",
              width: "calc((65vh - 12px) * 1.7778)",
              flexShrink: 0,
            }}
            onPointerEnter={() => { isHoveringRef.current = true; setHoveredKey(item.key); }}
            onPointerLeave={() => { isHoveringRef.current = false; setHoveredKey(null); }}
            onClick={() => {
              if (!isDraggingRef.current && item.link) {
                window.open(item.link, "_blank", "noopener,noreferrer");
              }
            }}
          >
            <img
              src={item.imageSrc}
              alt={item.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none", userSelect: "none" }}
              draggable={false}
            />
            <div
              style={{
                position: "absolute",
                bottom: "12px",
                left: "12px",
                zIndex: 1,
                pointerEvents: "none",
                color: "white",
                letterSpacing: "0.01em",
                mixBlendMode: "difference",
                opacity: hoveredKey === item.key ? 1 : 0,
                transform: hoveredKey === item.key ? "translateX(0)" : "translateX(-10px)",
                transition: "opacity 0.4s ease, transform 0.4s ease",
              }}
            >
              {item.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
