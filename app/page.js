"use client";
import Lenis from "lenis";
import Image from "next/image";
import { useEffect } from "react";
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
    <div>
      {/* TODO: add grainy noise background as ::before on body */}
      <section className="justify-center flex items-center bg-white h-screen">
        <div className="flex flex-col tracking-tight font-semibold leading-tight text-[5vw] text-center text-black uppercase">
          <span>Malik Kotb</span>
          <span>Independent Web</span>
          <span>Developer</span>
          <span>Based in Paris</span>
        </div>
      </section>
    </div>
  );
}
