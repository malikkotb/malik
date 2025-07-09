"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);
export default function Hero() {
  return (
    <div className='relative h-[calc(100vh-20px)] justify-center hidden md:grid grid-cols-6 gap-5 grid-rows-12'>
      <h1 className='row-start-5 items-end'>
        Independent
        <br />
        <span className=' whitespace-nowrap'>Creative Developer</span>
      </h1>
      <h3 className='uppercase text-sm md:col-span-6 lg:col-span-5 xl:col-span-4 md:-mt-5 lg:mt-2 xl:mt-5 row-start-7'>
        {/* I turn design-led ideas into powerful websites—because great
        work deserves a great presence. */}
        Design deserves more than pixels — it deserves presence. I
        turn creative visions into powerful web experiences that look
        as good as they feel. Let&apos;s make your next project
        unforgettable.
      </h3>
    </div>
  );
}

{
  /* <GooeyText
          texts={["     ", "malik"]}
          morphTime={5}
          cooldownTime={1}
          className='font-neuemontreal-bold tracking-[-0.5vw] text-[25vw] pt-72'
        /> */
}
{
  /* <div className='h-[150vh] w-full items-center justify-center flex'>
        <GooeyScroll
          texts={["     ", "MALIK"]}
          start={0.2} // Start morphing at 20% scroll
          end={0.6} // Complete morph at 60% scroll
          className='font-neuemontreal-bold text-[250px] pt-80'
        />
      </div> */
}
