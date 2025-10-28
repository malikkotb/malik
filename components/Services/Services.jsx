"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState } from "react";

export default function Services() {
  const [open, setOpen] = useState(null); // currently active accordion
  const [closing, setClosing] = useState(null); // the one that's fading out

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
    <div className='pb-40 text-white' id='services'>
      <h2 className='h2'>Services</h2>
      <div className='bg-white opacity-65 w-full h-[1px] my-4'></div>
      <div className='w-full'>
        <style jsx global>{`
          [data-slot="accordion-item"]
            [data-slot="accordion-trigger"] {
            opacity: 1;
            transition: opacity 0.3s ease;
          }

          [data-slot="accordion"]:has(
              [data-slot="accordion-item"]:hover
            )
            [data-slot="accordion-item"]:not(:hover)
            [data-slot="accordion-trigger"] {
            opacity: 0.65;
          }
        `}</style>
        <Accordion
          type='single'
          collapsible
          className='w-full'
          // defaultValue="item-1"
        >
          <AccordionItem value='item-1'>
            <AccordionTrigger>Web Development</AccordionTrigger>
            <AccordionContent className='flex'>
              I design and develop interactive, visually bold websites
              - combining design and code into one cohesive process. I
              build custom experiences with React.js and also develop
              in Webflow when a design-first, fast-to-launch solution
              is needed.
              <br />
              <br />
              Note: Design is offered only as part of a development
              project - not as a standalone service.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='item-2'>
            <AccordionTrigger>Frontend Development</AccordionTrigger>
            <AccordionContent>
              From Figma to life - I build interactive, visually bold
              experiences that merge design and code. Whether
              it&apos;s scroll-based animation, immersive 3D, WebGL,
              or generative visuals, I use tools like GSAP and
              Three.js to craft smooth, memorable websites that go far
              beyond templates.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='item-3'>
            <AccordionTrigger>
              E-Commerce Development
            </AccordionTrigger>
            <AccordionContent>
              I build custom e-commerce stores using Shopify and
              Hydrogen. A framework by shopify where you can build
              your own custom e-commerce storefronts. Always optimized
              for conversion, with dynamic animations and custom
              experiences that stand out.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='item-4'>
            <AccordionTrigger>Webflow Development</AccordionTrigger>
            <AccordionContent>
              I deliver fast-to-launch, design-led websites in Webflow
              - either from scratch or by converting Figma designs
              into clean, responsive builds. Built for visual clarity,
              responsive layout, and seamless use of Webflow&apos;s
              native CMS. Perfect for clients who want flexibility
              without compromise.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='item-5'>
            <AccordionTrigger>CMS Integration</AccordionTrigger>
            <AccordionContent>
              I integrate your website with a CMS like Sanity or
              Contentful, allowing you to manage content easily.
              Perfect for clients who want to update their website
              without touching code.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='item-6'>
            <AccordionTrigger>SEO</AccordionTrigger>
            <AccordionContent>
              I optimize your website for search engines - covering
              technical SEO, on-page optimization, and in-depth audits
              to ensure your content is discoverable and easily found.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
