"use client";
// import Clock from "react-live-clock";
import FlipLink from "./FlipLink";
import ScrollToTopButton from "./ScrollTopButton";
import ScrollTopButton from "./ScrollTopButton";
import Zoop from "./Zoop";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import { useState } from "react";

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
      href: "https://maliks-demos.vercel.app/",
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

  return (
    <div
      className='relative header-footer-text h-[50vh] md:h-[40vh] border-t border-white border-opacity-60 sticky-footer'
      style={{
        clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)",
      }}
    >
      {/* height of parent div and child div needs to be the same */}
      <div className='containerFooter md:h-[40vh] h-[50vh] w-full'>
        <div className='columnFooter col-span-6 md:col-span-4'>
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
        <div className='columnFooter col-span-5 md:col-span-1'>
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
        <div className='columnFooter col-span-12 md:col-start-6 md:col-span-2 mt-4 md:mt-0'>
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
        <div className='items-end flex col-span-6 md:col-start-1 md:col-span-1'>
          Malik Kotb
        </div>
        <div className='hidden md:flex items-end text-left cursor-default md:col-start-5 md:col-span-2'>
          <div className='flex flex-col'>
            <span className=''>Made by me with love</span>
          </div>
        </div>
        <div className='flex items-end justify-end col-span-6 md:col-start-11 md:col-span-2'>
          <div
            className='pb-0 hover:opacity-60 transition-all duration-300 p-3 relative cursor-pointer'
            onClick={() =>
              window.scrollTo({ top: 0, behavior: "smooth" })
            }
          >
            Back to top
          </div>
        </div>
      </div>
    </div>
  );
}
