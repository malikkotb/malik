"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { GooeyScroll } from "../ui/gooey-scroll";
import { GooeyText } from "@/components/ui/gooey-text-morphing";

gsap.registerPlugin(useGSAP);
export default function Home() {
  // TODO: add scroll interactions on more sections
  // to keep the user engaged
  // TODO: hook up to new domain makikotb.com
  // TODO: incorporate google analytics
  return (
    <div className='relative'>
      <div className='h-screen'>
        <GooeyText
          texts={["     ", "malik"]}
          morphTime={5}
          cooldownTime={1}
          className='font-neuemontreal-bold tracking-[-0.5vw] text-[25vw] pt-72'
        />
      </div>
      {/* <div className='h-[150vh] w-full items-center justify-center flex'>
        <GooeyScroll
          texts={["     ", "MALIK"]}
          start={0.2} // Start morphing at 20% scroll
          end={0.6} // Complete morph at 60% scroll
          className='font-neuemontreal-bold text-[250px] pt-80'
        />
      </div> */}
    </div>
  );
}
