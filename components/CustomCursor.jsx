import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import React, { useState, useEffect } from "react";

const CustomCursor = ({ href }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // TODO: fix
  // Update cursor position on mouse move
  const handleMouseMove = (e) => {
    setPosition({
      x: e.clientX,
      y: e.clientY,
    });
  };

  // Add the event listener for mouse movement
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <>
      <a
        className="custom-cursor"
        href={href}
        target="_blank"
        style={{
          top: `${position.y}px`,
          left: `${position.x}px`,
        }}
      >
        Visit Site <ArrowTopRightIcon />
      </a>
    </>
  );
};

export default CustomCursor;
