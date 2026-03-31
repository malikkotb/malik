"use client";
import { useState } from "react";

export default function Services() {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const services = [
    "Web Design, Figma",
    "Nuxt, Vue",
    "Next, React",
    "Creative Coding",
    "WebGL, Three.js",
    "Headless CMS, Sanity",
    "Headless E-commerce",
    "Shopify",
    "Webflow"
  ];

  const bio = (
    <>
      I'm a freelance web designer and developer who loves design, motion, and pushing the boundaries of what&apos;s possible on the web.
      My expertise lies in building web experiences through eye-catching design, smooth animations, and immersive 3D elements using WebGL and Three.js.
    </>
  );

  const links = [
    { label: "Email", value: "hello@malikkotb.com", href: "mailto:hello@malikkotb.com" },
    { label: "LinkedIn", value: "malik-kotb", href: "https://www.linkedin.com/in/malik-kotb/" },
    { label: "Instagram", value: "malikkotbb", href: "https://instagram.com/malikkotbb" },
    { label: "TikTok", value: "malikruns", href: "https://www.tiktok.com/@malikruns" },
    { label: "GitHub", value: "malikkotb", href: "https://github.com/malikkotb" },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-[80vw]" id="services">

      <div className="flex flex-col">
        <p className="hero-heading normal-case leading-[130%]">Malik Kotb</p>
        <p className="hero-heading normal-case leading-[130%]">Creative Web Development</p>
      </div>

      {/* Bio */}
      <div className="flex flex-col">
        <span className="text-[0.875rem] md:text-[1.125rem] leading-[1.1] tracking-[-0.02em] text-black/50 pb-1">Info</span>
        <p className="hero-heading normal-case leading-[130%]">{bio}</p>
      </div>

      {/* Services */}
      <div className="flex flex-col">
        <span className="text-[0.875rem] md:text-[1.125rem] leading-[1.1] tracking-[-0.02em] text-black/50 pb-1">Services</span>
        <div className="flex flex-col">
          {services.map((service, index) => (
            <span key={index} className="hero-heading">{service}</span>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="flex flex-col">
        <span className="text-[0.875rem] md:text-[1.125rem] leading-[1.1] tracking-[-0.02em] text-black/50 pb-1">Contact</span>
        <div className="flex flex-col" onMouseLeave={() => setHoveredIndex(null)}>
          {links.map((link, index) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`hero-heading cursor-pointer w-fit transition-opacity duration-200 motion-reduce:transition-none ${hoveredIndex !== null && hoveredIndex !== index ? "opacity-30" : ""}`}
              onMouseEnter={() => {
                if (window.matchMedia("(hover: hover)").matches) setHoveredIndex(index);
              }}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>

    </div>
  );
}
