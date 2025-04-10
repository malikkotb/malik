"use client";
import Clock from "react-live-clock";
import FlipLink from "./FlipLink";
import ScrollTopButton from "./ScrollTopButton";
import Zoop from "./Zoop";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import AnimatedLink from "@/components/AnimatedLink/AnimatedLink";
import ScrollToTopButton from "./ScrollTopButton";

export default function StickyFooter() {
  const [isHovered, setIsHovered] = useState(false);

  const menuLinks = [
    { name: "Home", href: "#home" },
    { name: "Work", href: "#projects" },
    { name: "Services", href: "#about" },
    { name: "About", href: "#about" },
    { name: "Contact", href: "mailto:hello@malikkotb.com" },
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
    {
      name: "GitHub",
      href: "https://github.com/malikkotb",
      newPage: true,
    },
  ];
  const stack = [
    "Javascript",
    "HTML5, CSS",
    "Webflow",
    "GSAP, Motion",
    "Three.js",
  ];

  return (
    <footer
      className='relative h-[50vh] md:h-[60vh]'
      style={{
        clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)",
      }}
    >
      {/* height of parent div and child div needs to be the same for sticky footer to work */}
      {/* <div className='text-black pt-10 p-5 text-sm flex flex-col gap-8 justify-end bg-white fixed bottom-0 w-full h-[50vh] md:h-[55vh]'>
        <div className='flex w-full '>
          <ul className='w-2/8 flex flex-col'>
            <li className='flex h-fit w-fit text-[#909090]'>
              Navigation
            </li>
            {menuLinks.map((link, index) => (
              <li key={index} className='flex h-fit w-fit'>
                <AnimatedLink href={link.href}>
                  {link.name}
                </AnimatedLink>
              </li>
            ))}
          </ul>
          <ul className='w-3/8 flex flex-col gap-1'>
            <li className='flex h-fit w-fit text-[#909090]'>
              Socials
            </li>
            {socialLinks.map((link, index) => (
              <li key={index} className='flex h-fit w-fit'>
                <AnimatedLink href={link.href}>
                  {link.name}
                </AnimatedLink>
              </li>
            ))}
          </ul>
          <ul className='w-3/8 flex flex-col gap-1'>
            <li className='flex h-fit w-fit text-[#909090]'>Stack</li>
            {stack.map((link, index) => (
              <li key={index} className='flex h-fit w-fit'>
                <AnimatedLink>{link}</AnimatedLink>
              </li>
            ))}
          </ul>
        </div>
        <div className='flex w-full '>
          <div
            style={{
              lineHeight: "75%",
              marginLeft: "-0.5vw",
            }}
            className='tracking-[-1vw] text-[20vw] font-neuemontreal-bold w-5/8 h-fit'
          >
            malik
          </div>
          <div
            style={{
              lineHeight: "85%",
              marginLeft: "1vw",
            }}
            className='flex items-end'
          >
            © 2025 Malik Kotb
            <br />
            All rights reserved.
          </div>

          <div className='w-2/8 flex items-end justify-end'>
            <ScrollTopButton />
          </div>
        </div>
      </div> */}
      <div className='fixed bottom-0 w-full h-[50vh] mt-[25vh] p-5 flex flex-col justify-between'>
        <div className='flex w-full'>
          <div
            style={{
              lineHeight: "75%",
              marginLeft: "-0.5vw",
            }}
            className='w-4/8 tracking-[-0.5vw] text-[15vw] font-neuemontreal-bold h-fit'
          >
            malik
          </div>
          <div className='gap-1 w-2/8 flex flex-col'>
            {menuLinks.map((link, index) => (
              <a
                href='#'
                key={index}
                className='flex h-fit w-fit underline-link uppercase text-sm'
              >
                {link.name}
              </a>
            ))}
          </div>
          <div>
            <a
              href='mailto:hello@malikkotb.com'
              className='underline-link uppercase text-sm'
            >
              hello@malikkotb.com
            </a>
          </div>
        </div>
        <div className='flex w-full text-sm'>
          <div className='w-4/8'>
            <div className='uppercase'>
              © 2025 Malik Kotb
              <br />
              All rights reserved.
            </div>
          </div>
          <div className='flex w-3/8 items-end gap-1 uppercase'>
            <a
              href='https://www.linkedin.com/in/malik-kotb'
              className='underline-link'
              target='_blank'
            >
              LinkedIn
            </a>
            <a
              href='https://www.instagram.com/malik.code'
              className='underline-link'
              target='_blank'
            >
              Instagram
            </a>
            {/* <a
          href='https://www.twitter.com'
          className='underline-link'
          target='_blank'
        >
          X
        </a> */}
            <a
              href='https://www.youtube.com/@maliik.mp4'
              className='underline-link'
              target='_blank'
            >
              YouTube
            </a>
          </div>
          <div className='w-1/8 flex items-end justify-end'>
            <ScrollToTopButton />
          </div>
        </div>
      </div>
    </footer>
  );
}
