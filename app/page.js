"use client";
import Lenis from "lenis";
import { useEffect, useState } from "react";
import Hero from "../components/Hero/Hero";
import { useGSAP } from "@gsap/react";
import HoverProjectSection from "../components/HoverProject/HoverProjectSection";
import gsap from "gsap";
import ActionCall from "@/components/ActionCall/ActionCall";
import Services from "@/components/Services/Services";
import StickyFooter from "@/components/StickyFooter";
import Header from "@/components/Header";
import Works from "@/components/Works/Works";
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
    <main className='relative'>
      <Header />
      <Hero />
      <Services />
      <Works />
      <ActionCall />
    </main>
  );
}
