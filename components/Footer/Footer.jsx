"use client";
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
  return (
    <footer className='md:mt-[5vh] p-5 h-[80vh] md:h-[50vh] flex flex-col justify-between'>
      <div className='flex gap-28 md:gap-0 flex-col md:flex-row w-full'>
        <div
          style={{
            lineHeight: "75%",
          }}
          className='w-full ml-[-1vw] md:ml-[-0.5vw] md:w-4/8 tracking-[-0.5vw] text-[25vw] md:text-[15vw] font-neuemontreal-bold h-fit'
        >
          malik
        </div>
        <div className='gap-1 w-2/8 flex flex-col'>
          {menuLinks.map((link, index) => (
            <a
              href='#'
              key={index}
              className='flex h-fit w-fit underline-link uppercase text-xs md:text-sm'
            >
              {link.name}
            </a>
          ))}
        </div>
        <div>
          <a
            href='mailto:hello@malikkotb.com'
            className='underline-link uppercase text-xs md:text-sm'
          >
            hello@malikkotb.com
          </a>
        </div>
      </div>
      <div className='flex w-full text-xs md:text-sm'>
        <div className='w-4/8'>
          <div className='uppercase'>
            © 2025 Malik Kotb
            {/* <br />
            All rights reserved. */}
          </div>
        </div>
        <div className='flex justify-end md:justify-start w-4/8 md:w-3/8 items-end gap-1 uppercase'>
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
        <div className='w-1/8 hidden md:flex items-end justify-end'>
          <ScrollToTopButton />
        </div>
      </div>
    </footer>
  );
}
