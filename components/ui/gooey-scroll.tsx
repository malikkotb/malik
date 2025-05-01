"use client";

import * as React from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GooeyTextProps {
  texts: string[];
  className?: string;
  textClassName?: string;
}

export function GooeyScroll({
  texts,
  className,
  textClassName,
}: GooeyTextProps) {
  const text1Ref = React.useRef<HTMLSpanElement>(null);
  const text2Ref = React.useRef<HTMLSpanElement>(null);

  const { scrollY } = useScroll();

  // Normalize scroll from 0 to 1 within the first 100vh
  const progress = useTransform(
    scrollY,
    [0, window.innerHeight],
    [0, 1]
  );

  React.useEffect(() => {
    if (texts.length < 2) return;

    let animationFrameId: number;

    const setMorph = (fraction: number) => {
      if (text1Ref.current && text2Ref.current) {
        text2Ref.current.style.filter = `blur(${Math.min(
          8 / fraction - 8,
          100
        )}px)`;
        text2Ref.current.style.opacity = `${
          Math.pow(fraction, 0.4) * 100
        }%`;

        fraction = 1 - fraction;
        text1Ref.current.style.filter = `blur(${Math.min(
          8 / fraction - 8,
          100
        )}px)`;
        text1Ref.current.style.opacity = `${
          Math.pow(fraction, 0.4) * 100
        }%`;
      }
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      setMorph(progress.get()); // Use scroll progress
    };

    if (text1Ref.current && text2Ref.current) {
      text1Ref.current.textContent = texts[0];
      text2Ref.current.textContent = texts[1];
    }

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [texts, progress]);

  return (
    <div className={cn("relative", className)}>
      <svg
        className='absolute h-0 w-0'
        aria-hidden='true'
        focusable='false'
      >
        <defs>
          <filter id='threshold'>
            <feColorMatrix
              in='SourceGraphic'
              type='matrix'
              values='1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 255 -140'
            />
          </filter>
        </defs>
      </svg>

      <div
        className='flex items-center justify-center'
        style={{ filter: "url(#threshold)" }}
      >
        <motion.span
          ref={text1Ref}
          className={cn(
            "absolute inline-block select-none text-center text-6xl md:text-[250px]",
            "text-foreground",
            textClassName
          )}
        />
        <motion.span
          ref={text2Ref}
          className={cn(
            "absolute inline-block select-none text-center text-6xl md:text-[250px]",
            "text-foreground",
            textClassName
          )}
        />
      </div>
    </div>
  );
}
