"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { localFont } from "next/font/local";
import gsap from "gsap";

const monoRegular = localFont({
  src: [
    {
      path: "../app/fonts/PPNeueMontrealMono-Regular.otf",
      weight: "400",
      style: "normal",
    },
  ],
});

export default function Header() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const lenisRef = useRef(null);
  const lettersRef = useRef([]);

  const nameText = "Malik Kotb";
  const letters = nameText.split("").map((char, index) => ({
    char: char === " " ? "\u00A0" : char,
    id: index,
  }));

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

  // Collect letter refs after render
  useEffect(() => {
    lettersRef.current = lettersRef.current.slice(0, letters.length);
  }, []);

  // Handle hover animation
  const handleMouseEnter = () => {
    const validRefs = lettersRef.current.filter(Boolean);
    if (validRefs.length === 0) return;

    gsap.to(validRefs, {
      opacity: 0,
      duration: 0.2,
      stagger: 0.02,
      ease: "power2.out",
      onComplete: () => {
        gsap.to(validRefs, {
          opacity: 1,
          duration: 0.2,
          stagger: 0.02,
          ease: "power2.out",
        });
      },
    });
  };

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
      <Link
        href='/'
        onMouseEnter={handleMouseEnter}
        className={`col-span-3 w-fit cursor-pointer`}
      >
        {letters.map((letter, index) => (
          <span
            key={letter.id}
            ref={(el) => {
              if (el) lettersRef.current[index] = el;
            }}
            style={{ display: "inline-block" }}
          >
            {letter.char}
          </span>
        ))}
      </Link>
      <div className='hidden md:flex opacity-60 gap-2 col-span-4 col-start-5'>
        Creative Web Development
      </div>
      <div className='flex gap-2 col-span-3 col-start-10 justify-end'>
        <div className='headerLink'>
          <Link href='/work'>Work</Link>
        </div>
        <div className='headerLink'>
          <Link href='/about'>About</Link>
        </div>
        <div className='headerLink'>
          {/* TODO: add correct link to the lab */}
          <a
            href='https://maliks-playground.vercel.app/'
            target='_blank'
            rel='noreferrer'
          >
            Lab
          </a>
        </div>
        {/* <div className='headerLink'>
          <Link href='/blog'>Blog</Link>
        </div> */}

        <div className='headerLink'>
          <a href='mailto:malikkotb@icloud.com'>Contact</a>
        </div>
      </div>
    </div>
  );
}
