"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState } from "react";

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
    <div className='relative text-white bg-black' id='about'>
      <h2 className='subheading pb-8 pt-12'>About</h2>
      <div className='w-full'>
        <p className='body-text opacity-50 lg:pr-[50%]'>
          Malik is a freelance web designer and developer driven by
          curiosity and precision. He crafts digital experiences where
          design meets functionality, bringing concepts to life
          through iteration, creativity, and careful attention to
          every detail.
          <br />
          <br />
          Passionate about the intersection of design and code, Malik
          loves pushing the boundaries of web development to help
          bring visions to life.
          <br />
          <br />
          His goal: to elevate your digital presence with bold,
          thoughtful, and creative solutions that perform and inspire.
        </p>
      </div>
    </div>
  );
}
