"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Card } from "./Card";
import Image from "next/image";


export default function HorizontalScroll() {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    // will return progress of scrolling vertically on the section
    target: targetRef,
    offset: ["start start", "end end"],
  });

  // takes motionValue, array of values to map FROM, array of values to map TO,
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-70%"]);

  return (
    // height of 300vh to have lots of room for scrolling
    // position: realtive, so the inner element can be sticky to it
    <section ref={targetRef} className="h-[300vh]">
      {/* we can follow our viewport as we scroll further down, by setting position sticky and top-0
        => when we scroll, the below div stays in view until we reach the bottom of the outer component */}
      <div className="h-[80vh] pt-[10vh] sticky top-0 flex items-center overflow-hidden">
        <motion.div style={{ x: x }} className="flex gap-24">
          <div className="intro w-[80vw] h-full flex flex-col flex-shrink-0">
            <div className="flex gap-5 whitespace-normal">
              <h2 className="text-[40px] m-0 w-full whitespace-nowrap">
                Lorem ipsum
              </h2>
              <p>
                Sed neque purus, imperdiet eu purus sit amet, hendrerit semper
                quam. Praesent elementum, nisl sit amet tincidunt tincidunt, ex
                tortor cursus lorem, non tempus purus libero et metus.
              </p>
            </div>
            <div className="relative h-[70vh] w-[80vw] overflow-hidden">
              <Image
                src="/demos/25.avif" 
                alt="Description"
                fill
              />
            </div>
          </div>
          <div className="flex gap-5">
            <Card key={2} source="/demos/26.avif" />
            <Card key={3} source="/demos/27.avif" />
          </div>
          <div className="h-[75vh] w-[30vw] flex items-center justify-center flex-shrink-0">
            <p>
              Aliquam metus lacus, efficitur sit amet ligula a, vehicula
              eleifend dolor. Pellentesque vulputate consectetur lectus, sit
              amet pellentesque leo congue ut. Vivamus turpis est, mollis et
              elit eget, venenatis dictum nisl. Suspendisse sit amet erat vel
              ipsum elementum mattis. In vel sagittis velit.
            </p>
          </div>
          <div className="flex gap-12 w-[60vw] flex-shrink-0">
            <div className="relative h-[30%] w-[40%] overflow-hidden">
              <Image
                src="/demos/24.avif"
                alt="Description"
                fill
              />
            </div>
            <div className="relative h-[full] w-[50%] overflow-hidden">
              <Image
                src="/demos/16.avif" 
                alt="Description"
                fill
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
