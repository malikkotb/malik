"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import ScrambleText from "./ScrambleText";

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
      style={{
        mixBlendMode: "difference",
        color: "#fff",
      }}
      className={`header-footer-text uppercase z-50 grid grid-cols-12 gap-[8px] justify-between w-full fixed top-0 left-0 right-0 p-[14px] transition-all ease-in-out duration-500 ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "-translate-y-[150%] opacity-0 lg:-translate-y-full lg:opacity-100"
      }`}
    >
      <Link href='/' className={`col-span-3 w-fit cursor-pointer`}>
        <ScrambleText text="Malik Kotb" />
      </Link>
      {/* <div className='hidden md:flex opacity-60 gap-2 col-span-4 col-start-5'>
        Creative Web Development
      </div> */}
      <div className='flex gap-2 lg:gap-4 col-span-3 col-start-10 justify-end'>
        <div className='headerLink'>
          <Link href='/work'>
            <ScrambleText text="Work" />
          </Link>
        </div>
        <div className='headerLink'>
          <Link href='/about'>
            <ScrambleText text="About" />
          </Link>
        </div>
        <div className='headerLink'>
          <Link href='/lab'>
            <ScrambleText text="Lab" />
          </Link>
          {/* TODO: add correct link to the lab */}
          {/* <a
            href='https://maliks-playground.vercel.app/'
            target='_blank'
            rel='noreferrer'
          >
            Lab
          </a> */}
        </div>
        {/* <div className='headerLink'>
          <Link href='/blog'>Blog</Link>
        </div> */}

        <div className='headerLink'>
          <a href='mailto:malikkotb@icloud.com'>
            <ScrambleText text="Contact" />
          </a>
        </div>
      </div>
    </div>
  );
}
