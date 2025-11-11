"use client";
import { useState } from "react";

const services = [
  {
    title: "Web Design",
    description: [
      "I craft visually striking and user-centric web designs that blend aesthetics with functionality.",
      "Design intuitive interfaces in Figma",
      "Build with Webflow or custom solutions",
      "Focus on user journeys that drive results",
    ],
  },

  {
    title: "Web Development",
    description: [
      "I build high-performance, scalable websites using cutting-edge technologies.",
      "Develop with Next.js and React",
      "Animate with GSAP and Framer Motion",
      "Integrate flexible CMS solutions",
    ],
  },
  {
    title: "3D Development",
    description: [
      "I create immersive 3D web experiences that push the boundaries of browser capabilities.",
      "Build with Three.js and WebGL",
      "Create interactive 3D visualizations",
      "Deliver performant cross-device experiences",
    ],
  },
];

export default function Services() {
  return (
    <div
      className='relative w-full h-full section-padding'
      id='services'
    >
      <h3 className='eyebrow eyebrow-light'>Services</h3>
      <div className='flex flex-col gap-10 lg:gap-20 w-full'>
        <div className='flex flex-col lg:grid grid-cols-12 gap-5'>
          <div className='text-[24px] leading-[100%] lg:text-[32px] col-span-5'>
            {services[0].title}
          </div>
          <div className='col-start-7 col-span-6'>
            <p>{services[0].description[0]}</p>
            <ul className='list-disc list-inside mt-2 space-y-1'>
              {services[0].description.slice(1).map((description, i) => (
                <li key={i + 1}>{description}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className='flex flex-col lg:grid grid-cols-12 gap-5'>
          <div className='text-[24px] leading-[100%] lg:text-[32px] col-span-5'>
            {services[1].title}
          </div>
          <div className='col-start-7 col-span-6'>
            <p>{services[1].description[0]}</p>
            <ul className='list-disc list-inside mt-2 space-y-1'>
              {services[1].description.slice(1).map((description, i) => (
                <li key={i + 1}>{description}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className='flex flex-col lg:grid grid-cols-12 gap-5'>
          <div className='text-[24px] leading-[100%] lg:text-[32px] col-span-5'>
            {services[2].title}
          </div>
          <div className='col-start-7 col-span-6'>
            <p>{services[2].description[0]}</p>
            <ul className='list-disc list-inside mt-2 space-y-1'>
              {services[2].description.slice(1).map((description, i) => (
                <li key={i + 1}>{description}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// STRATEGY
// Visual Research
// Mitbewerber Analyse
// Wireframes
// Content Mapping
// User Flow
// Konzepte

// DESIGN
// Unternehmenswebsites
// Marketing Websites
// Design System
// Animation
// Design Support
// Barrierefreies Design

// BUILD

// Webflow Entwicklung
// Web Animation
// Webflow CMS
// Barrierefreie Entwicklung
// Technisches SEO
// Frontend Support
