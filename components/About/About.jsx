"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState } from "react";
import AboutImage from "./AboutImage";

export default function About() {
  const [open, setOpen] = useState(null); // currently active accordion
  const [closing, setClosing] = useState(null); // the one that's fading out

  const accordionItems = [
    {
      value: "item-1",
      heading: "Web Development",
      content: (
        <>
          I design and develop interactive, visually bold websites -
          combining design and code into one cohesive process. I build
          custom experiences with React.js and also develop in Webflow
          when a design-first, fast-to-launch solution is needed.
          <br />
          <br />
          Note: Design is offered only as part of a development
          project - not as a standalone service.
        </>
      ),
      className: "flex",
    },
    {
      value: "item-2",
      heading: "Frontend Development",
      content: (
        <>
          From Figma to life - I build interactive, visually bold
          experiences that merge design and code. Whether it&apos;s
          scroll-based animation, immersive 3D, WebGL, or generative
          visuals, I use tools like GSAP and Three.js to craft smooth,
          memorable websites that go far beyond templates.
        </>
      ),
    },
    {
      value: "item-3",
      heading: "E-Commerce Development",
      content: (
        <>
          I build custom e-commerce stores using Shopify and Hydrogen.
          A framework by shopify where you can build your own custom
          e-commerce storefronts. Always optimized for conversion,
          with dynamic animations and custom experiences that stand
          out.
        </>
      ),
    },
    {
      value: "item-4",
      heading: "Webflow Development",
      content: (
        <>
          I deliver fast-to-launch, design-led websites in Webflow -
          either from scratch or by converting Figma designs into
          clean, responsive builds. Built for visual clarity,
          responsive layout, and seamless use of Webflow&apos;s native
          CMS. Perfect for clients who want flexibility without
          compromise.
        </>
      ),
    },
    {
      value: "item-5",
      heading: "CMS Integration",
      content: (
        <>
          I integrate your website with a CMS like Sanity or
          Contentful, allowing you to manage content easily. Perfect
          for clients who want to update their website without
          touching code.
        </>
      ),
    },
    {
      value: "item-6",
      heading: "SEO",
      content: (
        <>
          I optimize your website for search engines - covering
          technical SEO, on-page optimization, and in-depth audits to
          ensure your content is discoverable and easily found.
        </>
      ),
    },
  ];

  // Toggle accordion functionality
  const toggleAccordion = (section) => {
    if (open === section) {
      setOpen(null); // just close
    } else {
      setClosing(open); // start closing previous
      setOpen(section); // open new one right away
    }
  };

  return (
    <div className='relative section-padding' id='about'>
      <h3 className='eyebrow eyebrow-light'>About</h3>
      <div className='grid grid-cols-12 gap-5 w-full'>
        <div className='md:col-span-6 col-span-12'>
          <AboutImage src='/about.jpeg' alt='about' />
        </div>
        <p className='md:col-start-7 md:col-span-6 col-start-1 col-span-12'>
          I&apos;m a creative developer who loves design, motion, and
          pushing the boundaries of what&apos;s possible on the web.
          <br />
          <br />
          I build websites that look great and work smoothly, with a
          focus on beautiful execution and precise attention to
          detail. My expertise lies in elevating web experiences
          through motion, animations, and immersive 3D elements using
          WebGL and Three.js.
          <br />
          <br />
          Every project is focused on performance and smooth
          usability, turning ideas into real experiences that feel
          alive and engaging.
          <br />
          <br />
          Let&apos;s create something together.
        </p>
      </div>
    </div>
  );
}
