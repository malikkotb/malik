import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import React, { useState, useEffect, useRef } from "react";
import { useHover } from "@uidotdev/usehooks";

const CustomCursor = ({ children, link }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const [hovering, setHovered] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const handleMouseMove = (e) => {
    const container = containerRef.current.getBoundingClientRect();

    setPosition({
      x: e.clientX - container.left,
      y: e.clientY - container.top,
    });
  };

  // TODO: fix scroll issue

  // const handleScroll = () => {
  //   setScrolling(true);
  //   clearTimeout(window.scrollTimeout);
  //   window.scrollTimeout = setTimeout(() => {
  //     setScrolling(false);
  //   }, 0); // Adjust the timeout duration as needed
  // };

  useEffect(() => {
    const container = containerRef.current;
    container.addEventListener("mousemove", handleMouseMove);
    // window.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      // window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // useEffect(() => {
  //   if (!scrolling && hovering) {
  //     // Force re-render to show the custom cursor immediately after scrolling stops
  //     setPosition((prevPosition) => ({ ...prevPosition }));
  //   }
  // }, [scrolling, hovering]);

  return (
    <a
      href={`${link}`}
      target="_blank"
      ref={containerRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="custom-cursor-container"
    >
      {hovering && !scrolling && (
        <div
          className={`custom-cursor`}
          style={{ left: `${position.x}px`, top: `${position.y}px` }}
        >
          Visit Site <ArrowTopRightIcon />
        </div>
      )}
      {children}
    </a>
  );
};

export default CustomCursor;
