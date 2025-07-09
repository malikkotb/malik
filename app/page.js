"use client";
import Lenis from "lenis";
import { useEffect, useState } from "react";
import Services from "@/components/Services/Services";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Hero from "@/components/Hero/Hero";
import Navigation from "@/components/Navigation/Navigation";
gsap.registerPlugin(useGSAP);
export default function Home() {
  useEffect(() => {
    const lenis = new Lenis();
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }, []);

  // const documentTitleStore = document.title;
  // const documentTitleOnBlur = "Come back! We miss you"; // Define your custom title here

  // // Set original title if user is on the site
  // window.addEventListener("focus", () => {
  //   document.title = documentTitleStore;
  // });

  // // If user leaves tab, set the alternative title
  // window.addEventListener("blur", () => {
  //   document.title = documentTitleOnBlur;
  // });

  const [isHovered, setIsHovered] = useState(false);

  return (
    <main className='relative bg-[#0f0928] p-5 font-neuemontreal-mono-regular flex flex-col md:grid grid-cols-12 gap-5'>
      <Navigation />
      <div className='h-full col-span-6'>
        <Hero />
        <Services />
      </div>
    </main>
  );
}
