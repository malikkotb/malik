"use client";
import Link from "next/link";
import TransitionLink from "@/components/TransitionLink";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import ScrambleText from "./ScrambleText";
import ActionCall from "@/components/ActionCall/ActionCall";

export default function Header() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showBookingOverlay, setShowBookingOverlay] = useState(false);
  const lenisRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    // Get Lenis instance from window if available
    const getLenis = () => {
      if (typeof window !== "undefined" && window.lenis) {
        lenisRef.current = window.lenis;
      }
    };
    getLenis();

    // Try to get Lenis after a short delay to ensure it's initialized
    const timer = setTimeout(getLenis, 100);
    return () => clearTimeout(timer);
  }, []);

  // useEffect(() => {
  //   const handleScroll = () => {
  //     const currentScrollY = window.scrollY;

  //     if (currentScrollY > lastScrollY && currentScrollY > 100) {
  //       // Scrolling down
  //       setIsVisible(false);
  //     } else if (currentScrollY < lastScrollY) {
  //       // Scrolling up
  //       setIsVisible(true);
  //     }

  //     setLastScrollY(currentScrollY);
  //   };

  //   window.addEventListener("scroll", handleScroll, {
  //     passive: true,
  //   });
  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, [lastScrollY]);

  const isOnDemosRoute = pathname?.startsWith("/demos");

  return (
    <>
      <div
        style={{
          mixBlendMode: "difference",
          color: "rgb(255, 255, 255, 0.8)",
          // letterSpacing: "-0.01em",
        }}
        className={`header-footer-text z-[100] grid grid-cols-12 gap-[8px] justify-between w-full fixed top-0 left-0 right-0 p-[12px] transition-all ease-in-out duration-500 ${isVisible
          ? "translate-y-0 opacity-100"
          : "-translate-y-[150%] opacity-0 lg:-translate-y-full lg:opacity-100"
          }`}
      >
        <TransitionLink href='/' className={`col-span-3 w-fit cursor-pointer`}>
          <ScrambleText text="Malik Kotb" />
        </TransitionLink>

        {/* Show Combobox in the center when on /demos route - hidden on mobile */}
        {/* {isOnDemosRoute && (
          <div className='hidden sm:flex absolute top-[12px] left-1/2 -translate-x-1/2 items-center justify-center'>
            <Combobox />
          </div>
        )} */}

        <div className={`flex flex-col items-end gap-1 col-span-9 sm:col-span-3 ${isOnDemosRoute ? 'col-start-4 sm:col-start-10' : 'col-start-4 sm:col-start-10'} justify-end`}>
          <div className='flex gap-2 lg:gap-4'>
            <TransitionLink href='/work'>
              <ScrambleText text="Work" underline />
            </TransitionLink>
            <TransitionLink href='/info'>
              <ScrambleText text="Info" underline />
            </TransitionLink>
            <TransitionLink href='/lab' className='hidden md:block'>
              <ScrambleText text="Lab" underline />
            </TransitionLink>
            {/* <TransitionLink href='/blog'>
              <ScrambleText text="Blog" underline />
            </TransitionLink> */}
            <button onClick={() => setShowBookingOverlay(true)}>
              <ScrambleText text="Contact" underline />
            </button>
          </div>

        </div>
      </div>

      {/* Booking Overlay */}
      {showBookingOverlay && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowBookingOverlay(false)}
        >
          <div
            className="relative bg-white rounded-lg shadow-xl max-w-[95vw] max-h-[95vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowBookingOverlay(false)}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* Cal.com booking component */}
            <ActionCall overlayMode={true} />
          </div>
        </div>
      )}
    </>
  );
}
