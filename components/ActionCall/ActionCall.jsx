"use client";
import AnimatedLink from "../AnimatedLink/AnimatedLink";
import TextFadeGradient from "../TextFadeGradient/TextFadeGradient";
export default function ActionCall() {
  // TODO: opacity animation on scroll for this text
  // like https://www.spylt.com/ section
  return (
    <div className='h-[100vh] flex gap-12 flex-col px-[5vw] justify-center items-center'>
      <h3 className='h3'>
        <TextFadeGradient
          paragraph={
            "Everyone has a story, let me help you tell yours."
          }
        />
      </h3>
      <a
        href='mailto:hello@malikkotb.com'
        className='text-black px-5 py-4 bg-white font-neuemontreal-bold leading-[100%] tracking-[-0.35px] text-[1.5vw]'
      >
        <AnimatedLink className=''>BOOK A CALL</AnimatedLink>
      </a>
    </div>
  );
}
