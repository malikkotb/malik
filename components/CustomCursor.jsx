import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import React, { useState, useEffect, useRef } from "react";
import { useHover } from "@uidotdev/usehooks";

const CustomCursor = ({ children, link }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const [hovering, setHovered] = useState(false);
  const handleMouseMove = (e) => {
    const container = containerRef.current.getBoundingClientRect();

    setPosition({
      x: e.clientX - container.left,
      y: e.clientY - container.top,
    });
  };

  useEffect(() => {
    const container = containerRef.current;

    container.addEventListener("mousemove", handleMouseMove);
    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <a
      href={`${link}`}
      target="_blank"
      ref={containerRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="custom-cursor-container"
    >
      {hovering && (
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
