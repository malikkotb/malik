"use client";
import FlipLink from "@/components/FlipLink";
import Lenis from "lenis";
import { useEffect, useRef } from "react";
import ActionCall from "../components/ActionCall/ActionCall";
import Projects from "../components/ProjectsSection/Projects";
import TextDipserse from "../components/TextDisperse";
import { ArrowBottomRightIcon, ArrowDownIcon } from "@radix-ui/react-icons";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CornerDownRight } from "lucide-react";
import { useScroll, useTransform, motion } from "framer-motion";
import MagenticButton from "@/components/MagneticButton";
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

  // animation refs
  const nav = useRef(null);
  const headerItem1 = useRef(null);
  const headerItem2 = useRef(null);
  const itemMainImg = useRef(null);
  const nameHeaderRef = useRef(null);
  const servicesRef = useRef(null);
  const scrollContainer = useRef(null); // use for scroll interaction: scale and opacity down
  const { scrollYProgress } = useScroll({
    target: scrollContainer,
    offset: ["start start", "end start"],
  });

  const scaleTransform = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const yTranslate = useTransform(scrollYProgress, [0, 1], [0, 50]);

  const background = useRef(null);
  const setBackground = (isActive) => {
    gsap.to(background.current, { opacity: isActive ? 0.8 : 0 });
  };

  return (
    <main className="">
      <nav
        ref={nav}
        style={{ fontWeight: "600" }}
        className="z-50 text-white flex text-xs overflow-hidden justify-between w-full fixed p-5"
      >
        <MagenticButton>
          <h1 className="cursor-pointer">MALIK KOTB</h1>
        </MagenticButton>
        <div className="flex gap-2">
          <div className="headerLink">
            <FlipLink href="#about">ABOUT</FlipLink>
          </div>
          <div className="headerLink">
            <FlipLink newPage={true} href="https://malikkotb.github.io/blog/">
              BLOG
            </FlipLink>
          </div>
          <div className="headerLink">
            <FlipLink href="#projects">WORKS</FlipLink>
          </div>
          <div className="headerLink">
            <FlipLink href="#contact">CONTACT</FlipLink>
          </div>
        </div>
      </nav>
      {/* landing page section */}
      <motion.div
        style={{
          scale: scaleTransform,
          opacity: opacityTransform,
          y: yTranslate,
          position: "fixed",
        }}
        className="h-screen w-screen flex items-center justify-center text-white"
        ref={scrollContainer}
      >
        <div className="body">
          <div className="introLine">
            <p>Malik</p>
            <p>Kotb</p>
          </div>

          <div className="introLine">
            <p>Design</p>
            <p>&</p>
          </div>

          <div className="introLine">
            <p>Web</p>
            <p>Creation</p>
          </div>

          <TextDipserse setBackground={setBackground}>
            <p>BOOK  A  CALL</p>
          </TextDipserse>

          <TextDipserse setBackground={setBackground}>
            <p>→Email</p>
          </TextDipserse>

          <TextDipserse setBackground={setBackground}>
            <p>→Insta</p>
          </TextDipserse>
        </div>
        <div ref={background} className="background"></div>
      </motion.div>

      {/* to make space for scrolling */}
      <div className="h-screen"></div>

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
