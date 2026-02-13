"use client";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { Instrument_Serif } from "next/font/google";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
});

export default function TextScrolly() {
  gsap.registerPlugin(ScrollTrigger);
  const svgRef = useRef(null);
  const pathRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis();
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }, []);

  useGSAP(() => {
    gsap.to(pathRef.current, {
      strokeDashoffset: 14000,
      scrollTrigger: {
        trigger: ".container", // mainCotainer in tutorial
        start: "top top", // Start when the top of SVG reaches the top of the viewport
        end: "bottom top", // End when the bottom of SVG leaves the top of the viewport
        scrub: true, // animate based on scroll position
      },
    });
    gsap.to(svgRef.current, {
      rotation: -75, // Rotate in the opposite direction
      scrollTrigger: {
        trigger: ".container",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
    gsap.to(svgRef.current, {
      scale: 10,
      opacity: 0,
      scrollTrigger: {
        trigger: ".scaleContainer",
        start: "top bottom",
        end: "bottom bottom",
        scrub: true,
      },
    });
  }, []);

  return (
    <div className={`${instrumentSerif.className} flex flex-col`}>
      <div className='container h-[900vh] flex justify-center items-start mt-40'>
        <svg
          ref={svgRef}
          className='w-[70%] fixed top-32 left-72 md:w-[50%] xl:max-h-[calc(100vh-15rem)]'
          overflow='visible'
          xmlns='http://www.w3.org/2000/svg'
          xmlnsXlink='http://www.w3.org/1999/xlink'
          viewBox='0 0 2167 2197'
          style={{
            transform: "rotate(-2.5545deg)",
          }}
        >
          <path
            id='a'
            d='M-.3 331c561.7-488.8 1413.2-429.7 1902 132 391 449.3 343.7 1130.6-105.6 1521.6a862.8 862.8 0 0 1-1217.3-84.5 690.2 690.2 0 0 1 67.6-973.8 552.2 552.2 0 0 1 779.1 54.1 441.6 441.6 0 0 1-43.3 623.2 353.5 353.5 0 0 1-498.6-34.6 282.7 282.7 0 0 1 27.7-398.9 226.2 226.2 0 0 1 319.1 22.1 181 181 0 0 1-17.7 255.3'
            fill='transparent'
            // stroke="black"
          ></path>
          <text>
            <textPath
              xlinkHref='#a'
              startOffset='0.5%'
              alignmentBaseline='middle'
              className='text-[212px] tracking-wider'
            >
              The quick brown fox{" "}
              <tspan alignmentBaseline='middle' className='italic'>
                jumps over a lazy dog
              </tspan>{" "}
              landing gracefully on the other side, its tail swishing as it
              sprints away.
            </textPath>
          </text>
          <path
            ref={pathRef}
            d='M-.3 331c561.7-488.8 1413.2-429.7 1902 132 391 449.3 343.7 1130.6-105.6 1521.6a862.8 862.8 0 0 1-1217.3-84.5 690.2 690.2 0 0 1 67.6-973.8 552.2 552.2 0 0 1 779.1 54.1 441.6 441.6 0 0 1-43.3 623.2 353.5 353.5 0 0 1-498.6-34.6 282.7 282.7 0 0 1 27.7-398.9 226.2 226.2 0 0 1 319.1 22.1 181 181 0 0 1-17.7 255.3'
            stroke='white'
            // strokeOpacity={0.8} // this can be used to have an opacity animation on scroll
            strokeWidth='250px' // this defines the width of the stroke, needs to cover the height of the letters to work
            fill='none'
            style={{
              strokeDasharray: "12000",
              strokeDashoffset: "24000",
            }}
          ></path>
        </svg>
      </div>
      <div className='scaleContainer h-[500vh] w-full'></div>
      <section className='h-screen'></section>
    </div>
  );
}
