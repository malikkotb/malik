"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

export default function Header() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const lenisRef = useRef(null);

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
        // Scrolling down
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div
      style={{ fontWeight: 500, mixBlendMode: "difference" }}
      className={`text-sm lg:text-base z-50 text-white flex justify-between w-full fixed top-0 left-0 right-0 px-4 py-4 transition-transform ease-in-out duration-500 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <h1>Malik Kotb</h1>
      <div className='flex gap-2'>
        <div className='headerLink'>
          <SmoothLink href='#projects'>Work</SmoothLink>
        </div>
        {/* <div className='headerLink'>
          <Link href='#about'>About</Link>
        </div> */}
        <div className='headerLink'>
          <Link target='_blank' href='https://demos-4ckq.vercel.app/'>
            Playground
          </Link>
        </div>
        {/* <div className='headerLink'>
          <Link
            target='_blank'
            href='https://malikkotb.github.io/blog/'
          >
            Blog
          </Link>
        </div> */}
        <div className='headerLink'>
          <a href='mailto:malikkotb@icloud.com'>Contact</a>
        </div>
      </div>
    </div>
  );
}

const SmoothLink = ({ href, children, target, ...props }) => {
  const handleClick = (e) => {
    if (href && href.startsWith("#") && typeof window !== "undefined") {
      e.preventDefault();
      const targetElement = document.querySelector(href);
      if (targetElement && window.lenis) {
        window.lenis.scrollTo(targetElement, {
          duration: 1.5,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      }
    }
  };

  if (target || !href?.startsWith("#")) {
    return (
      <Link target={target} href={href} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
};
