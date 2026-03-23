"use client";
import Link from "next/link";
import TransitionLink from "@/components/TransitionLink";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import ScrambleText from "./ScrambleText";
import ActionCall from "@/components/ActionCall/ActionCall";
import InfoOverlay from "./InfoOverlay";

export default function Header() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showBookingOverlay, setShowBookingOverlay] = useState(false);
  const [showAboutOverlay, setShowAboutOverlay] = useState(false);

  const openInfoOverlay = () => setShowAboutOverlay(true);
  const closeInfoOverlay = () => setShowAboutOverlay(false);
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
        className={`header-footer-text z-[100] flex justify-between w-full transition-all ease-in-out duration-500 ${isVisible
          ? "translate-y-0 opacity-100"
          : "-translate-y-[150%] opacity-0 lg:-translate-y-full lg:opacity-100"
          }`}
      >
        <TransitionLink href='/'>
          <button className="header-btn">Malik Kotb</button>
        </TransitionLink>

        {/* Show Combobox in the center when on /demos route - hidden on mobile */}
        {/* {isOnDemosRoute && (
          <div className='hidden sm:flex absolute top-[12px] left-1/2 -translate-x-1/2 items-center justify-center'>
            <Combobox />
          </div>
        )} */}


        <div className="flex z-[101] gap-1.5">
          <button className="header-btn" onClick={openInfoOverlay}>Info</button>
          <TransitionLink href='/work'><button className="header-btn">Work</button></TransitionLink>
          <TransitionLink href='/lab' className='hidden md:block'><button className="header-btn">Lab</button></TransitionLink>
          <button className="header-btn" onClick={() => setShowBookingOverlay(true)}>Contact</button>
        </div>

      </div >

      {/* Booking Overlay */}
      {showBookingOverlay && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center backdrop-blur-xl bg-white/10"
          onClick={() => setShowBookingOverlay(false)}
        >
          <div
            className="relative bg-white rounded-[4px] shadow-xl max-w-[95vw] max-h-[95vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
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
            <ActionCall overlayMode={true} />
          </div>
        </div>
      )}

      {/* Info Overlay */}
      {showAboutOverlay && <InfoOverlay onClose={closeInfoOverlay} />}
    </>
  );
}
