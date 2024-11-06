import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useWindowSize } from "@uidotdev/usehooks";

const CustomCursor = ({ children, link }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const [hovering, setHovered] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const size = useWindowSize();

  const handleMouseMove = (e) => {
    const container = containerRef.current.getBoundingClientRect();

    setPosition({
      x: e.clientX - container.left,
      y: e.clientY - container.top,
    });
  };

  // const handleScroll = () => {
  //   setScrolling(true);
  //   clearTimeout(window.scrollTimeout);
  //   window.scrollTimeout = setTimeout(() => {
  //     setScrolling(false);
  //   }, 0); // Adjust the timeout duration as needed
  // };

  // useEffect(() => {
  //   if (!scrolling && hovering) {
  //     // Force re-render to show the custom cursor immediately after scrolling stops
  //     setPosition((prevPosition) => ({ ...prevPosition }));
  //   }
  // }, [scrolling, hovering]);

  useEffect(() => {
    const container = containerRef.current;
    container.addEventListener("mousemove", handleMouseMove);
    // window.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      // window.removeEventListener("scroll", handleScroll);
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
      {size.width > 768 && (
        <AnimatePresence>
          {hovering && !scrolling && (
            <motion.div
              initial={{ width: 0 }} // Start with 0 width (hide)
              animate={{ width: "85px" }} // Animate to full width
              // animate={{ opacity: 1 }}
              exit={{ width: 0 }} // Animate back to 0 width on exit
              transition={{ duration: 0.5 }}
              className={`custom-cursor`}
              style={{ left: `${position.x}px`, top: `${position.y}px` }}
            >
              Visit Site <ArrowTopRightIcon />
            </motion.div>
          )}
        </AnimatePresence>
      )}
      {children}
    </a>
  );
};

export default CustomCursor;
