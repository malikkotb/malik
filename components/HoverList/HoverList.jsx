"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import "./HoverList.css";

const HoverList = ({ projects, isHomePage = false }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [hoveredVideo, setHoveredVideo] = useState(null);
  const audioRef = useRef(null);
  const containerRef = useRef(null);
  const videoFollowerRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = useMemo(() => ({
    initial: {},
    whileInView: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.07,
        delayChildren: shouldReduceMotion ? 0 : 0.1,
      },
    },
  }), [shouldReduceMotion]);

  const itemVariants = useMemo(() => ({
    initial: { opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 20 },
    whileInView: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0 : 0.4, ease: "easeOut" },
    },
  }), [shouldReduceMotion]);

  useEffect(() => {
    audioRef.current = new Audio("/tap_01.wav");
    audioRef.current.volume = 0.5;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const directionMap = {
      top: "translateY(-100%)",
      bottom: "translateY(100%)",
      left: "translateX(-100%)",
      right: "translateX(100%)",
    };

    const type = container.getAttribute("data-type") || "all";
    const cleanups = [];

    container.querySelectorAll("[data-directional-hover-item]").forEach((item) => {
      const tile = item.querySelector("[data-directional-hover-tile]");
      if (!tile) return;

      const handleMouseEnter = (e) => {
        const dir = getDirection(e, item, type);
        tile.style.transition = "none";
        tile.style.transform = directionMap[dir] || "translate(0, 0)";
        void tile.offsetHeight; // force reflow
        tile.style.transition = "";
        tile.style.transform = "translate(0%, 0%)";
        item.setAttribute("data-status", `enter-${dir}`);
      };

      const handleMouseLeave = (e) => {
        const dir = getDirection(e, item, type);
        item.setAttribute("data-status", `leave-${dir}`);
        tile.style.transform = directionMap[dir] || "translate(0, 0)";
      };

      item.addEventListener("mouseenter", handleMouseEnter);
      item.addEventListener("mouseleave", handleMouseLeave);
      cleanups.push(() => {
        item.removeEventListener("mouseenter", handleMouseEnter);
        item.removeEventListener("mouseleave", handleMouseLeave);
      });
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  function getDirection(event, el, type) {
    const { left, top, width: w, height: h } = el.getBoundingClientRect();
    const x = event.clientX - left;
    const y = event.clientY - top;

    if (type === "y") return y < h / 2 ? "top" : "bottom";
    if (type === "x") return x < w / 2 ? "left" : "right";

    const distances = { top: y, right: w - x, bottom: h - y, left: x };
    return Object.entries(distances).reduce((a, b) => (a[1] < b[1] ? a : b))[0];
  }

  const updateFollowerPos = (clientX, clientY) => {
    if (videoFollowerRef.current) {
      videoFollowerRef.current.style.top = `${clientY - 125}px`;
      videoFollowerRef.current.style.left = `${clientX + 20}px`;
    }
  };

  return (
    <div
      ref={containerRef}
      data-directional-hover
      data-type='y'
      className='directional-list'
    >
      <div className='directional-list__collection'>
        <motion.div
          className='directional-list__list'
          variants={containerVariants}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: "-50px" }}
        >
          {projects.map((project, i) => (
            <motion.a
              key={i}
              data-directional-hover-item
              href={project.link}
              target='_blank'
              rel='noreferrer'
              className='directional-list__item relative'
              variants={itemVariants}
              onMouseEnter={(e) => {
                setHoveredIndex(i);
                setHoveredVideo(project.videoSrc || null);
                updateFollowerPos(e.clientX, e.clientY);
                if (audioRef.current && window.matchMedia("(hover: hover)").matches) {
                  audioRef.current.currentTime = 0;
                  audioRef.current.play().catch(() => { });
                }
              }}
              onMouseMove={(e) => updateFollowerPos(e.clientX, e.clientY)}
              onMouseLeave={() => {
                setHoveredIndex(null);
                setHoveredVideo(null);
              }}
            >
              <div
                data-directional-hover-tile
                className='directional-list__hover-tile'
              ></div>
              <div className='directional-list__border is--item'></div>
              <div className='directional-list__col-award'>
                <motion.p
                  className={`direcitonal-list__p${isHomePage ? " direcitonal-list__p--home" : ""}`}
                  initial={{ x: 0 }}
                  animate={{ x: hoveredIndex === i ? 10 : 0 }}
                  transition={{ ease: "easeOut", duration: 0.12 }}
                >
                  {project.projectTitle}
                </motion.p>
              </div>
              <div className='hidden lg:block directional-list__col-client'>
                <p className='direcitonal-list__p hidden'>
                  {project.category}
                </p>
              </div>
              <div className='directional-list__col-year'>
                <motion.p
                  className={`direcitonal-list__p text-right${isHomePage ? " direcitonal-list__p--home" : ""}`}
                  initial={{ x: 0 }}
                  animate={{ x: hoveredIndex === i ? -10 : 0 }}
                  transition={{ ease: "easeOut", duration: 0.12 }}
                >
                  {project.year}
                </motion.p>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>

      {!shouldReduceMotion && (
        <div
          ref={videoFollowerRef}
          className='pointer-events-none hidden sm:block fixed z-50 w-[250px]'
          style={{ visibility: hoveredVideo ? "visible" : "hidden" }}
        >
          {hoveredVideo && (
            <video
              src={hoveredVideo}
              autoPlay
              muted
              loop
              playsInline
              className='w-full aspect-video object-cover'
            />
          )}
        </div>
      )}
    </div>
  );
};

export default HoverList;
