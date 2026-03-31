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
  const [showBookingOverlay, setShowBookingOverlay] = useState(false);
  const [showAboutOverlay, setShowAboutOverlay] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const lastScrollY = useRef(0);
  const lenisRef = useRef(null);
  const pathname = usePathname();

  const openMobileMenu = () => {
    setShowMobileMenu(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setMenuVisible(true)));
  };
  const closeMobileMenu = (cb) => {
    setMenuVisible(false);
    setTimeout(() => {
      setShowMobileMenu(false);
      cb?.();
    }, 420);
  };

  const openInfoOverlay = () => setShowAboutOverlay(true);
  const closeInfoOverlay = () => setShowAboutOverlay(false);

  useEffect(() => {
    const getLenis = () => {
      if (typeof window !== "undefined" && window.lenis) {
        lenisRef.current = window.lenis;
      }
    };
    getLenis();
    const timer = setTimeout(getLenis, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Escape key to close booking overlay
  useEffect(() => {
    if (!showBookingOverlay) return;
    const handleKey = (e) => { if (e.key === "Escape") setShowBookingOverlay(false); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [showBookingOverlay]);

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
          <TransitionLink href='/' className="header-btn">Malik Kotb</TransitionLink>

          {/* Desktop nav */}
          <nav className="hidden md:flex gap-1.5" aria-label="Main navigation">
            <button className="header-btn" onClick={openInfoOverlay}>Info</button>
            <TransitionLink href='/work' className="header-btn">Work</TransitionLink>
            <TransitionLink href='/lab' className="header-btn">Lab</TransitionLink>
            <TransitionLink href='/contact' className="header-btn">Contact</TransitionLink>
            <button className="header-btn" onClick={() => setShowBookingOverlay(true)}>Let's Talk</button>
          </nav>

          {/* Mobile menu toggle */}
          <div className="relative flex md:hidden">
            <button
              className="header-btn"
              aria-expanded={showMobileMenu}
              aria-controls="mobile-nav"
              onClick={() => menuVisible ? closeMobileMenu() : openMobileMenu()}
            >
              {showMobileMenu ? "Close" : "Menu"}
            </button>

            {/* Mobile nav dropdown */}
            {showMobileMenu && (
              <nav
                id="mobile-nav"
                aria-label="Mobile navigation"
                className="absolute top-full right-0 flex flex-col mt-1.5 items-end z-10 max-w-[160px] w-screen overflow-hidden"
              >
                {[
                  { label: "Info",    onClick: () => closeMobileMenu(openInfoOverlay) },
                  { label: "Work",    href: "/work" },
                  { label: "Lab",     href: "/lab" },
                  { label: "Contact",    href: "/contact" },
                  { label: "Let's Talk", onClick: () => closeMobileMenu(() => setShowBookingOverlay(true)) },
                ].map((item, i) => {
                  const slot = 40;
                  const fromY = -(slot + i * slot);
                  const delay = menuVisible ? i * 0.1 : (4 - i) * 0.1;
                  const wrapStyle = {
                    transform: menuVisible ? "translateY(0)" : `translateY(${fromY}px)`,
                    transition: `transform 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
                    position: "relative",
                    zIndex: 5 - i,
                    marginBottom: i < 4 ? "6px" : 0,
                  };
                  return (
                    <div key={item.label} className="w-full" style={wrapStyle}>
                      {item.href ? (
                        <TransitionLink
                          href={item.href}
                          className="header-btn w-full block text-left"
                          onClick={() => closeMobileMenu()}
                        >
                          {item.label}
                        </TransitionLink>
                      ) : (
                        <button className="header-btn w-full text-left" onClick={item.onClick}>
                          {item.label}
                        </button>
                      )}
                    </div>
                  );
                })}
              </nav>
            )}
          </div>
        </div>
      </div>

      {/* Booking Overlay */}
      {showBookingOverlay && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center backdrop-blur-md bg-white/30 border border-white/20"
          onClick={() => setShowBookingOverlay(false)}
        >
          <div
            className="relative bg-white rounded-[4px] shadow-xl max-w-[95vw] max-h-[95vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowBookingOverlay(false)}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-lg transition-colors"
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
