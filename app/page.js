"use client";
import Lenis from "lenis";
import { useEffect } from "react";
import Services from "@/components/Services/Services";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Hero from "@/components/Hero/Hero";
import Navigation from "@/components/Navigation/Navigation";
import MobileFooter from "@/components/Footer/MobileFooter";
import Projects from "@/components/Projects/Projects";
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

  useEffect(() => {
    const handleAnchorClick = (e) => {
      const href = e.target.closest("a")?.getAttribute("href");
      if (href?.startsWith("#")) {
        e.preventDefault();
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);
    return () =>
      document.removeEventListener("click", handleAnchorClick);
  }, []);

  return (
    <main
      id='top'
      className='relative bg-[#0f0928] p-5 font-neuemontreal-mono-regular flex flex-col md:grid grid-cols-12 gap-5'
    >
      <Navigation />
      <div className='h-full col-span-6'>
        <Hero />
        <Services />
        <Projects />
      </div>
      <MobileFooter />
    </main>
  );
}
