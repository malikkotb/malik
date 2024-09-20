"use client";
import FlipLink from "@/components/FlipLink";
import Lenis from "lenis";
import { useEffect, useRef } from "react";
import ActionCall from "../components/ActionCall/ActionCall";
import TextFadeGradient from "../components/TextFadeGradient/TextFadeGradient";
import Projects from "../components/ProjectsSection/Projects";
import { ArrowDownIcon } from "@radix-ui/react-icons";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
export default function Home() {
  useEffect(() => {
    const lenis = new Lenis();

    function raf(time) {
      lenis.raf(time);

      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
  }, []);

  // animation refs
  const nav = useRef(null);
  const letterWrapper = useRef(null);
  const itemCopyWrapper = useRef(null);

  useGSAP(() => {
    gsap.set(nav.current, { y: -100 });
    gsap.set(letterWrapper.current, { y: 400 }) // letter wrapper needs overflow hidden
    gsap.set(itemCopyWrapper.current, { y: 50 }) // letter wrapper needs overflow hidden


    gsap.defaults({ duration: 1, ease: "power3.out" });

    // "paused" might be "pause"
    const tl = gsap.timeline({ paused: true, delay: 0.5 });

    tl.to(letterWrapper.current, {
      y: 0,
      stagger: 0.1
    })
  });

  return (
    <main className="">
      {/* TODO: add grainy noise background as ::before on body */}
      {/* TODO: make landing page section sticky and fade out on scroll downs */}
      <nav
        ref={nav}
        style={{ fontWeight: "600" }}
        className="z-50 text-white flex text-xs overflow-hidden justify-between w-full fixed p-5"
      >
        <h1>MALIK KOTB</h1>
        <nav className="flex gap-2">
          <div className="headerLink">
            <FlipLink href="#about">ABOUT</FlipLink>
          </div>
          <div className="headerLink">
            <FlipLink href="#blog">BLOG</FlipLink>
          </div>
          <div className="headerLink">
            <FlipLink href="#projects">WORKS</FlipLink>
          </div>
          <div className="headerLink">
            <FlipLink href="#contact">CONTACT</FlipLink>
          </div>
        </nav>
      </nav>
      <section className="justify-center relative flex items-center bg-black text-white h-screen">
        <div className="flex flex-col gap-2 text-left tracking-tight font-semibold leading-tight uppercase">
          <span className="text-[15vw] uppercase md:text-[8vw]">Malik Kotb</span>
          <div className="flex flex-col">
            <span>Web Developer</span>
            <span>Based in Paris</span>
          </div>
          <div className="text-[2vw]">PORTFOLIO_20/24</div>
        </div>
        <div className="absolute bottom-3 flex gap-1 items-center">
          SCROLL <ArrowDownIcon />
        </div>
      </section>
      <Projects />
      {/* <TextFadeGradient
        paragraph={
          "I am a frontend developer based in Paris and working globally. With a passion for creating seamless, engaging web experiences, I focus on ensuring every project leaves users with a feel-good sensation through attention to detail and a user-centric design approach."
        }
      /> */}
      <ActionCall />
    </main>
  );
}
