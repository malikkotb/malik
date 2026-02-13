"use client";
import Link from "next/link";
import TransitionLink from "@/components/TransitionLink";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import ScrambleText from "./ScrambleText";

export default function Header() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
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
    <div
      style={{
        mixBlendMode: "difference",
        color: "#fff",
      }}
      className={`header-footer-text uppercase z-[100] grid grid-cols-12 gap-[8px] justify-between w-full fixed top-0 left-0 right-0 p-[12px] transition-all ease-in-out duration-500 ${isVisible
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
          <a href='mailto:malikkotb@icloud.com'>
            <ScrambleText text="Contact" underline />
          </a>
        </div>

      </div>
    </div>
  );
}
