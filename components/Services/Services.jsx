"use client";
import ScrambleText from "../ScrambleText";

export default function Services() {
  const services = [
    "Web Design, Figma",
    "Next.js / React.js",
    "Nuxt.js / Vue.js",
    "WebGL, Three.js",
    "React Three Fiber",
    "Creative Coding",
    "Headless CMS, Sanity",
    "Headless E-commerce, Shopify",
    "Webflow",
  ];

  const bio = (
    <>
      Malik Kotb is a web designer and developer who loves design, motion, and pushing the boundaries of what&apos;s possible on the web.
      <br /><br />
      He builds websites that look great and work smoothly, with a focus on beautiful execution and precise attention to detail.
      <br /><br />
      His expertise lies in elevating web experiences through eye-catching design, smooth animations, and immersive 3D elements using WebGL and Three.js.
    </>
  );

  const links = [
    { label: "E-mail", value: "hello@malikkotb.com", href: "mailto:hello@malikkotb.com" },
    { label: "LinkedIn", value: "malik-kotb", href: "https://www.linkedin.com/in/malik-kotb/" },
    { label: "Instagram", value: "malikkotbb", href: "https://instagram.com/malikkotbb" },
    { label: "TikTok", value: "malikruns", href: "https://www.tiktok.com/@malikruns" },
    { label: "GitHub", value: "malikkotb", href: "https://github.com/malikkotb" },
  ];

  return (
    <div className="flex flex-col w-full" id="services">

      {/* Bio */}
      <div className="flex flex-col">
        <span className="hero-heading">About</span>
        <p className="hero-heading normal-case leading-[130%]">{bio}</p>
      </div>

      {/* Services */}
      <div className="flex flex-col">
        <span className="hero-heading">Services</span>
        <div className="flex flex-col">
          {services.map((service, index) => (
            <span key={index} className="hero-heading">{service}</span>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="flex flex-col">
        <span className="hero-heading">Contact</span>
        <div className="flex flex-col">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hero-heading cursor-pointer"
            >
              <ScrambleText text={link.value} />
            </a>
          ))}
        </div>
      </div>

    </div>
  );
}
