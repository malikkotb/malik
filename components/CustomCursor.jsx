import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import React, { useState, useEffect } from "react";
import { useHover } from "@uidotdev/usehooks";

//   document.addEventListener("DOMContentLoaded", () => {
//     const container = document.querySelector(".custom-cursor-container");
//     const customCursor = document.querySelector(".custom-cursor");

//     container.addEventListener("mousemove", (e) => {
//       const rect = container.getBoundingClientRect();
//       customCursor.style.left = `${e.clientX - rect.left}px`;
//       customCursor.style.top = `${e.clientY - rect.top}px`;
//     });
//   });

const CustomCursor = ({ children }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [ref, hovering] = useHover();
  const handleMouseMove = (e) => {
    const container = e.currentTarget.getBoundingClientRect();

    setPosition({
      x: e.clientX - container.left,
      y: e.clientY - container.top,
    });
  };

  useEffect(() => {
    const container = document.querySelector(".custom-cursor-container");
    console.log(position);
    console.log(hovering);
    container.addEventListener("mousemove", handleMouseMove);
    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
    };
  }, [hovering]);

  return (
    <div ref={ref} className="custom-cursor-container">
      {hovering && (
        <div
          className={`custom-cursor`}
          style={{ left: `${position.x}px`, top: `${position.y}px` }}
        >
          Visit Site <ArrowTopRightIcon />
        </div>
      )}
      {children}
    </div>
  );
};

export default CustomCursor;
