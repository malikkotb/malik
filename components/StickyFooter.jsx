"use client";
// import Clock from "react-live-clock";
import FlipLink from "./FlipLink";
import ScrollToTopButton from "./ScrollTopButton";
import ScrollTopButton from "./ScrollTopButton";
import Zoop from "./Zoop";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function StickyFooter() {
  {
    /* <div
        className="relative h-[800px]"
        style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
      >
        <div className="fixed bottom-0 h-[800px] w-full">
          <Content />
        </div>
      </div> */
  }

  const [isHovered, setIsHovered] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({
    x: 0,
    y: 0,
  });
  const [showCustomCursor, setShowCustomCursor] = useState(false);
  const getInTouchRef = useRef(null);

  const menuLinks = [
    { name: "Home", href: "/" },
    { name: "Work", href: "#work" },
    { name: "Services", href: "#services" },
    { name: "About", href: "#about" },
    { name: "Contact", href: "mailto:malikkotb@icloud.com" },
  ];

  const socialLinks = [
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/in/malik-kotb-682412189/",
      newPage: true,
    },
    {
      name: "Instagram",
      href: "https://instagram.com/malikkotbb",
      newPage: true,
    },
    {
      name: "TikTok",
      href: "https://www.tiktok.com/@malik.code",
      newPage: true,
    },
  ];

  const resourceLinks = [
    {
      name: "Playground",
      href: "https://maliks-playground.vercel.app/",
      newPage: true,
    },
    {
      name: "Blog",
      href: "https://malikkotb.github.io/blog/",
      newPage: true,
    },
    {
      name: "GitHub",
      href: "https://github.com/malikkotb",
      newPage: true,
    },
  ];

  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () =>
      window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleMouseEnter = (e) => {
    setShowCustomCursor(true);
    setCursorPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setShowCustomCursor(false);
  };

  return (
    <div className='relative h-full border-t border-black border-opacity-30 sticky-footer'>
      <div className='header-footer-text pt-5 containerFooter h-full w-full'>
        <div className='columnFooter md:pb-12 pb-0 col-span-6 md:col-span-4'>
          <h1 className='w-full mb-1 eyebrow eyebrow-footer'>
            Navigation
          </h1>
          <ul className='space-y-1'>
            {menuLinks.map((link) => (
              <li key={link.name} className='flex h-fit w-fit'>
                <a className='headerLink' href={link.href}>
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className='columnFooter pb-12 md:pb-0 col-span-5 md:col-span-1'>
          <h1 className='w-full mb-1 eyebrow eyebrow-footer'>
            Socials
          </h1>
          <ul className='space-y-1'>
            {socialLinks.map((link) => (
              <li key={link.name} className='flex h-fit w-fit'>
                <a
                  target='_blank'
                  className='headerLink'
                  href={link.href}
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className='columnFooter pb-12 md:pb-0 col-span-12 md:col-start-6 md:col-span-2 mt-4 md:mt-0'>
          <h1 className='w-full mb-1 eyebrow eyebrow-footer'>
            Resources
          </h1>
          <ul className='space-y-1'>
            {resourceLinks.map((link) => (
              <li key={link.name} className='flex h-fit w-fit'>
                <a
                  target='_blank'
                  className='headerLink'
                  href={link.href}
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className='items-end eyebrow eyebrow-footer flex col-span-6 md:col-start-1 md:col-span-3'>
          Malik Kotb© 2025
        </div>
        <div className='hidden md:flex items-end text-left cursor-default md:col-start-5 md:col-span-3'>
          <div className='flex flex-col'>
            <span className='eyebrow eyebrow-footer'>
              Made by me with love
            </span>
          </div>
        </div>
        <div className='flex items-end justify-end col-span-6 md:col-start-11 md:col-span-2 relative z-10'>
          <div
            style={{ color: "black", opacity: 1 }}
            className='pb-0 p-3 w-fit pr-0 pl-2 pt-2 eyebrow eyebrow-footer hover:opacity-60 transition-all duration-300 relative cursor-pointer z-10'
            onClick={() =>
              window.scrollTo({ top: 0, behavior: "smooth" })
            }
          >
            Back to top
          </div>
        </div>
      </div>
      <a
        ref={getInTouchRef}
        href='mailto:malikkotb@icloud.com'
        style={{
          letterSpacing: "-0.02em",
          userSelect: "none",
        }}
        className='w-full cursor-pointer text-[17.5vw] md:translate-x-[-12px] leading-[90%] inline-block md:text-[19.5vw] h-full whitespace-nowrap'
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        Get in touch
      </a>

      <AnimatePresence>
        {showCustomCursor && (
          <motion.div
            className='fixed pointer-events-none z-[99999]'
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 8 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
            style={{
              left: `${cursorPosition.x - 116}px`,
              top: `${cursorPosition.y}px`,
            }}
          >
            <div className='bg-black text-white px-3 uppercase py-1.5 rounded font-mono text-xs leading-none shadow-lg shadow-black/30'>
              Let's go!
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
