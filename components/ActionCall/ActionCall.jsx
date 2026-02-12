"use client";

import { useEffect, useRef } from "react";

export default function ActionCall({ overlayMode = false }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Intercept wheel events on the iframe container and forward to Lenis
    const handleWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Forward scroll to Lenis if available
      if (window.lenis) {
        window.lenis.scrollTo(window.lenis.scroll + e.deltaY, {
          immediate: true,
        });
      } else {
        // Fallback to native scroll
        window.scrollBy(0, e.deltaY);
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, []);

  if (overlayMode) {
    return (
      <div className='pointer-events-auto pb-[48px] md:pb-[124px] relative w-full flex items-center justify-center'>
        <div className='flex flex-col text-center'>
          <div
            ref={containerRef}
            className='lg:w-[65vw] w-[90vw] h-[70vh] min-h-[650px] relative'
          >
            <iframe
              src='https://cal.com/malikkotb?theme=light'
              frameBorder='0'
              scrolling='yes'
              className='w-full h-full rounded-lg'
            ></iframe>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='pb-[48px] md:pb-[124px] relative w-full h-full flex items-center justify-center'>
      <div className='flex flex-col text-center'>
        <div style={{ lineHeight: 1 }} className='text-[24px] my-8'>
          <div>Get in touch today.</div>
        </div>

        <div
          ref={containerRef}
          className='lg:w-[65vw] w-[90vw] h-[70vh] min-h-[650px] relative'
        >
          <iframe
            src='https://cal.com/malikkotb?theme=light'
            frameBorder='0'
            scrolling='yes'
            className='w-full h-full rounded-lg'
          ></iframe>
        </div>
      </div>
    </div>
  );
}
