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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const openMobileMenu = () => {
    setShowMobileMenu(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setMenuVisible(true)));
  };
  const closeMobileMenu = (cb) => {
    setMenuVisible(false);
    setTimeout(() => {
      setShowMobileMenu(false);
      cb?.();
    }, 700);
  };

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

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const isOnDemosRoute = pathname?.startsWith("/demos");

  return (
    <>
      <div
        className={`header-footer-text z-[100] w-full fixed md:relative top-0 left-0 p-4 md:p-0 transition-transform duration-500 ease-in-out ${isVisible
          ? "translate-y-0"
          : "-translate-y-full"
          }`}
      >
        {/* Top row */}
        <div className="flex justify-between w-full">
          <TransitionLink href='/'>
            <button className="header-btn">Malik Kotb</button>
          </TransitionLink>

          {/* Desktop nav */}
          <div className="hidden md:flex z-[101] gap-1.5">
            <button className="header-btn" onClick={openInfoOverlay}>Info</button>
            <TransitionLink href='/work'><button className="header-btn">Work</button></TransitionLink>
            <TransitionLink href='/lab'><button className="header-btn">Lab</button></TransitionLink>
            <button className="header-btn" onClick={() => setShowBookingOverlay(true)}>Contact</button>
          </div>

          {/* Mobile menu toggle */}
          <div className="relative flex md:hidden z-[101]">
            <button className="header-btn" onClick={() => menuVisible ? closeMobileMenu() : openMobileMenu()}>
              {showMobileMenu ? "Close" : "Menu"}
            </button>

            {/* Mobile nav dropdown */}
            {showMobileMenu && (
              <div className="absolute top-full right-0 flex flex-col mt-1.5 items-end z-[101] max-w-[160px] w-screen overflow-hidden">
            {[
              { label: "Info",    onClick: () => closeMobileMenu(openInfoOverlay) },
              { label: "Work",    href: "/work" },
              { label: "Lab",     href: "/lab" },
              { label: "Contact", onClick: () => closeMobileMenu(() => setShowBookingOverlay(true)) },
            ].map((item, i) => {
              const slot = 40;
              const fromY = -(slot + i * slot);
              const delay = menuVisible ? i * 0.1 : (3 - i) * 0.1;
              const wrapStyle = {
                transform: menuVisible ? "translateY(0)" : `translateY(${fromY}px)`,
                transition: `transform 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
                position: "relative",
                zIndex: 4 - i,
                marginBottom: i < 3 ? "6px" : 0,
              };
              const btn = (
                <button className="header-btn w-full text-left" onClick={item.onClick}>
                  {item.label}
                </button>
              );
              return (
                <div key={item.label} className="w-full" style={wrapStyle}>
                  {item.href ? (
                    <TransitionLink href={item.href} className="w-full block" onClick={() => closeMobileMenu()}>
                      {btn}
                    </TransitionLink>
                  ) : btn}
                </div>
              );
            })}
              </div>
            )}
          </div>
        </div>
      </div>

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
