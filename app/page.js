"use client";
import Lenis from "lenis";
import { useEffect } from "react";
import ActionCall from "../components/ActionCall";
import TextFadeGradient from "../components/TextFadeGradient";
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

  return (
    <main>
      {/* TODO: add grainy noise background as ::before on body */}
      <section className="justify-center flex items-center bg-white h-screen">
        <div className="flex flex-col tracking-tight font-semibold leading-tight text-[5vw] text-center text-black uppercase">
          <span>Malik Kotb</span>
          <span>Independent Web</span>
          <span>Developer</span>
          <span>Based in Paris</span>
        </div>
      </section>
      <section className="h-[30vh] bg-red-200"></section>
      <TextFadeGradient />
      <ActionCall />
    </main>
  );
}
