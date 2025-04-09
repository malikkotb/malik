"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { GooeyScroll } from "../ui/gooey-scroll";
import { GooeyText } from "@/components/ui/gooey-text-morphing";

gsap.registerPlugin(useGSAP);
export default function Home() {
  return (
    <div className='relative w-full h-screen'>
      <div className=''>
        <GooeyText
          texts={["     ", "malik"]}
          morphTime={3}
          cooldownTime={1}
          className='font-neuecorp-compact-ultrabold text-[250px] pt-64'
        />
        <GooeyScroll
          texts={["     ", "malik"]}
          start={0.2} // Start morphing at 20% scroll
          end={0.6} // Complete morph at 60% scroll
          className='font-neuecorp-compact-ultrabold text-[250px] pt-80'
        />
      </div>
    </div>
  );
}
