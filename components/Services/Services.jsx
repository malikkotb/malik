"use client";
import { useState } from "react";

export default function Services() {
  return (
    <div
      className='relative text-white w-full h-full bg-black'
      id='services'
    >
      <h2 className='subheading pb-8 pt-12'>How I can help</h2>
      <div className='w-full'>
        <p className='grid body-text grid-cols-2 gap-4 opacity-50 lg:pr-[50%]'>
          <span>Web Development</span>
          <span>Web Design</span>
          <span>E-Commerce Development</span>
          <span>3D/WebGL Development</span>
          <span>Webflow Development</span>
          <span>SEO</span>
          <span>CMS Integration</span>
          <span>Performance Optimization</span>
        </p>
      </div>
    </div>
  );
}
