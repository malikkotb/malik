"use client";
import { useState, useEffect, useRef } from "react";

// Reusable ScrambleText component
export default function ScrambleText({ text, className = "", underline = false }) {
  const lettersRef = useRef([]);
  const containerRef = useRef(null);
  const [width, setWidth] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const letters = text.split("").map((char, index) => ({
    char: char === " " ? "\u00A0" : char,
    id: index,
  }));

  useEffect(() => {
    lettersRef.current = lettersRef.current.slice(0, letters.length);
    // Capture the natural width to prevent layout shift
    if (containerRef.current && width === null) {
      // Use requestAnimationFrame to ensure accurate measurement after paint
      requestAnimationFrame(() => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          // Add 2px buffer to prevent clipping and accommodate character width variations
          setWidth(Math.ceil(rect.width) + 2);
        }
      });
    }
  }, [letters.length, width]);

  useEffect(() => {
    // Check if mobile on mount and window resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
    // Disable scramble on mobile
    if (isMobile) return;
    
    const validRefs = lettersRef.current.filter(Boolean);
    if (validRefs.length === 0) return;

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let i = 0;

    const interval = setInterval(() => {
      validRefs.forEach((letterRef, index) => {
        const char = text[index];
        if (char === " ") {
          letterRef.textContent = "\u00A0";
        } else if (index < i) {
          letterRef.textContent = char;
        } else {
          letterRef.textContent = chars[Math.floor(Math.random() * chars.length)];
        }
      });

      i++;

      if (i > text.length) {
        clearInterval(interval);
      }
    }, 50);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <span 
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{ 
        display: "inline-block",
        width: width ? `${width}px` : "auto",
        textAlign: "left",
        whiteSpace: "nowrap",
        overflow: "visible"
      }}
    >
      <span style={{ position: "relative", display: "inline-block" }}>
        {letters.map((letter, index) => (
          <span
            key={letter.id}
            ref={(el) => {
              if (el) lettersRef.current[index] = el;
            }}
            style={{ 
              display: "inline-block",
              fontKerning: "normal"
            }}
          >
            {letter.char}
          </span>
        ))}
        {underline && (
          <span
            style={{
              position: "absolute",
              left: 0,
              bottom: 0,
              height: "1px",
              backgroundColor: "currentColor",
              width: "100%",
              transform: isHovered ? "scaleX(1)" : "scaleX(0)",
              transformOrigin: isHovered ? "left" : "right",
              transition: "transform 0.5s ease-in-out",
            }}
          />
        )}
      </span>
    </span>
  );
}

