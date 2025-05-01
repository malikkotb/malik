"use client";
import { useState } from "react";
import AnimatedLink from "../AnimatedLink/AnimatedLink";
import ScrollToTopButton from "../ScrollTopButton";
import TextFadeGradient from "../TextFadeGradient/TextFadeGradient";
export default function ActionCall() {
  const menuLinks = [
    { name: "Work", href: "#projects" },
    { name: "Services", href: "#services" },
    { name: "About", href: "#about" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "Contact", href: "mailto:hello@malikkotb.com" },
    { name: "Book A Call", href: "mailto:hello@malikkotb.com" },
  ];

  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className='h-[100vh] relative flex gap-12 flex-col px-[5vw] justify-center items-center'>
      <div className='text-sm uppercase'>Have a project in mind?</div>
      <TextFadeGradient
        paragraph={"Let’s tell your story - together."}
      />
      <a
        href='mailto:hello@malikotb.com'
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className='px-12 py-6 rounded-full border-white border font-neuemontreal-medium leading-[100%] tracking-[-0.35px]'
      >
        {/* TODO: change every email to malikotb.com with only 1  */}
        {/* TODO: fix hover functionality */}
        <AnimatedLink hovered={isHovered}>
          HELLO@MALIKOTB.COM
        </AnimatedLink>
      </a>
      {/* TODO: calendar link */}
      {/* <div className='uppercase text-sm absolute bottom-0 left-0'>
        LET'S CHAT
      </div>
      <div className='uppercase text-sm absolute bottom-0 right-0'>
        BOOK A CALL
      </div> */}
    </section>
  );
}
