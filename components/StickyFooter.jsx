"use client";
// import Clock from "react-live-clock";
import FlipLink from "./FlipLink";
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
    { name: "Home", href: "#home" },
    { name: "Projects", href: "#projects" },
    // { name: "About", href: "/about" },
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
      href: "https://instagram.com/malikhavemercy",
      newPage: true,
    },
    {
      name: "TikTok",
      href: "https://tiktok.com/@malikruns",
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
      className='relative header-footer-text h-[50vh] md:h-[40vh] border-t border-white border-opacity-50 bg-black'
      style={{
        clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)",
      }}
    >
      {/* height of parent div and child div needs to be the same */}
      <div className='text-white containerFooter fixed pb-4 bottom-0 md:h-[40vh] h-[50vh] w-full'>
        <div className='columnFooter'>
          <h1 className='w-full mb-1 opacity-50'>Navigation</h1>
          <ul className='space-y-1'>
            {menuLinks.map((link) => (
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
        <div className='columnFooter'>
          <h1 className='w-full mb-1 opacity-50'>Socials</h1>
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
        <div className='columnFooter mt-4 md:mt-0'>
          <h1 className='w-full mb-1 opacity-50'>Resources</h1>
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
        <div className='items-end flex'>Malik Kotb</div>
        <h1 className='items-end flex text-left cursor-default'>
          <div className='flex flex-col'>
            <span className=''>Made by me with ♥</span>
          </div>
        </h1>
      </div>
    </div>
  );
}
