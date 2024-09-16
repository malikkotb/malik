import React, { useState, useEffect } from "react";

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

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
      <div
        className="custom-cursor fixed pointer-events-none"
        style={{
          top: `${position.y}px`,
          left: `${position.x}px`,
        }}
      >
        Hello!
      </div>
    </>
  );
};

export default CustomCursor;
