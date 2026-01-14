"use client";
import { useRef, useEffect } from "react";
import gsap from "gsap";

export default function Services() {
  const linkRefs = useRef({
    linkedin: [],
    instagram: [],
    tiktok: [],
    github: [],
  });

  const links = [
    { id: "linkedin", text: "LinkedIn", href: "https://www.linkedin.com/in/malik-kotb/" },
    { id: "instagram", text: "Instagram", href: "https://instagram.com/malikkotbb" },
    { id: "tiktok", text: "TikTok", href: "https://www.tiktok.com/@malik.code" },
    { id: "github", text: "GitHub", href: "https://github.com/malikkotb" },
  ];

  const splitTextIntoLetters = (text) => {
    return text.split("").map((char, index) => ({
      char: char === " " ? "\u00A0" : char,
      id: index,
    }));
  };

  const handleLinkHover = (linkId) => {
    const validRefs = linkRefs.current[linkId].filter(Boolean);
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
    <div className='relative grid gap-2 grid-cols-12 w-full h-full' id='services'>
      <div className='col-span-3 flex flex-col'>
        <h3 className='eyebrow eyebrow-light'>Services</h3>
        <div className='flex w-full '>
          <ul>
            <li>Web Design, Figma</li>
            <li>Frontend Development</li>
            <li>Next, React</li>
            <li>WebGL, Three.js</li>
            <li>Creative Coding</li>
            <li>Headless CMS, Sanity</li>
            <li>Headless E-commerce, Shopify</li>
            <li>Webflow</li>
          </ul>
        </div>
      </div>
      <div className='col-span-3 flex flex-col'>
        <h3 className='eyebrow eyebrow-light'>Clients</h3>
        <div className='flex w-full '>
          <ul>
            <li>BODYARMOR</li>
            <li>Coca-Cola</li>
            <li>A Unified Whole</li>
            <li>Lou Phelps</li>
            <li>Prudentos</li>
            <li>Iffy Studios</li>
            <li>From The Farm</li>
            <li>Hotel Kühbacher</li>
            <li>Secret Nature</li>
            <li>Meklit Fekadu Photography</li>
          </ul>
        </div>
      </div>
      <div className='col-span-3 flex flex-col'>
        <h3 className='eyebrow eyebrow-light'>Links</h3>
        <div className='flex w-full '>
          <ul>
            {links.map((link) => {
              const letters = splitTextIntoLetters(link.text);
              return (
                <li key={link.id}>
                  <a
                    href={link.href}
                    target='_blank'
                    rel='noopener noreferrer'
                    onMouseEnter={() => handleLinkHover(link.id)}
                    className='cursor-pointer'
                  >
                    {letters.map((letter, index) => (
                      <span
                        key={letter.id}
                        ref={(el) => {
                          if (el) {
                            if (!linkRefs.current[link.id]) {
                              linkRefs.current[link.id] = [];
                            }
                            linkRefs.current[link.id][index] = el;
                          }
                        }}
                        style={{ display: "inline-block" }}
                      >
                        {letter.char}
                      </span>
                    ))}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
