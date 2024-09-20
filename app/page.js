"use client";
import Lenis from "lenis";
import { useEffect } from "react";
import ActionCall from "../components/ActionCall/ActionCall";
import TextFadeGradient from "../components/TextFadeGradient/TextFadeGradient";
import Projects from "../components/ProjectsSection/Projects";
import { ArrowDownIcon } from "@radix-ui/react-icons";
export default function Home() {
  useEffect(() => {
    const lenis = new Lenis();

    function raf(time) {
      lenis.raf(time);

      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
  }, []);

  // TODO: use section-padding for all sections
  // TODO: take care of all todos
  // TODO: add animations for all text on landing page (also scroll button)

  return (
    <main className="">
      {/* TODO: add grainy noise background as ::before on body */}
      {/* TODO: make landing page section sticky and fade out on scroll downs */}
      <section className="justify-center relative flex items-center bg-black text-white h-screen">
        <div className="flex flex-col gap-2 text-left tracking-tight font-semibold leading-tight uppercase">
          <span className="text-[15vw] md:text-[8vw]">Malik Kotb</span>
          <div className="flex flex-col">
            <span>Web Developer</span>
            <span>Based in Paris</span>
          </div>
          <div className="text-[2vw]">PORTFOLIO_20/24</div>
        </div>
        <div className="absolute bottom-3 flex gap-1 items-center">SCROLL <ArrowDownIcon /></div>
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
