"use client";
import Lenis from "lenis";
import { useEffect } from "react";
import ActionCall from "../components/ActionCall";
import TextFadeGradient from "../components/TextFadeGradient/TextFadeGradient";
import Projects from "../components/ProjectsSection/Projects";
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

  return (
    <main>
      {/* TODO: add grainy noise background as ::before on body */}
      {/* TODO: make landing page section sticky and fade out on scroll downs */}
      <section className="justify-center flex items-center bg-white h-screen">
        <div className="flex flex-col tracking-tight font-semibold leading-tight text-[5vw] text-center text-black uppercase">
          <span>Malik Kotb</span>
          <span>Independent Web</span>
          <span>Developer</span>
          <span>Based in Paris</span>
        </div>
      </section>
      <TextFadeGradient
        paragraph={
          "I am a frontend developer based in Paris and working globally. With a passion for creating seamless, engaging web experiences, I focus on ensuring every project leaves users with a feel-good sensation through attention to detail and a user-centric design approach."
        }
      />
      <Projects />
      <ActionCall />
    </main>
  );
}
