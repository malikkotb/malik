"use client";
import { useState, useEffect, useRef } from "react";

// Reusable ScrambleText component
export default function ScrambleText({ text, className = "" }) {
  const lettersRef = useRef([]);
  const containerRef = useRef(null);
  const [width, setWidth] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

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

  return (
    <span 
      ref={containerRef}
      onMouseEnter={handleMouseEnter} 
      className={className}
      style={{ 
        display: "inline-block",
        width: width ? `${width}px` : "auto",
        textAlign: "left",
        whiteSpace: "nowrap",
        overflow: "visible"
      }}
    >
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
    </span>
  );
}

