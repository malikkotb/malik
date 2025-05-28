"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { GooeyScroll } from "../ui/gooey-scroll";
import { GooeyText } from "@/components/ui/gooey-text-morphing";

gsap.registerPlugin(useGSAP);
export default function Hero() {
  // TODO: add scroll interactions on more sections
  // to keep the user engaged
  // TODO: hook up to new domain makikotb.com
  // TODO: incorporate google analytics
  return (
    <div className='relative h-screen font-neuemontreal-medium overflow-hidden'>
      <h1
        style={{
          letterSpacing: "-3%",
          lineHeight: "0.85",
        }}
        className='uppercase pt-[15vh] text-[10vw] text-center'
      >
        Game-changing websites
      </h1>
      <div className='p-5 absolute items-end bottom-0 w-full flex justify-between'>
        <div className='text-3xl w-[40%]'>
          As a creative developer, I turn design-led ideas into
          powerful websites—because great work deserves a great
          presence.
        </div>
        <div className='uppercase text-sm'>SCROLL</div>
      </div>
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
