"use client";
import FlipLink from "@/components/FlipLink";
import Lenis from "lenis";
import { useEffect, useRef } from "react";
import ActionCall from "../components/ActionCall/ActionCall";
import Projects from "../components/ProjectsSection/Projects";
import TextDipserse from "../components/TextDisperse";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
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

  const loader = useRef(null);
  const path = useRef(null);
  const initialCurve = 200;

  const duration = 600;
  let start;

  useEffect(() => {
    setPath(initialCurve);
    setTimeout(() => {
      requestAnimationFrame(animate);
    }, 500);
  }, []);

  const animate = (timestamp) => {
    if (start === undefined) {
      start = timestamp;
    }

    const elapsed = timestamp - start;

    const newCurve = easeOutQuad(elapsed, initialCurve, -200, duration);

    setPath(newCurve);

    loader.current.style.top =
      easeOutQuad(elapsed, 0, -loaderHeight(), duration) + "px";

    if (elapsed < duration) {
      requestAnimationFrame(animate);
    }
  };

  const easeOutQuad = (time, start, end, duration) => {
    return -end * (time /= duration) * (time - 2) + start;
  };

  const loaderHeight = () => {
    const loaderBounds = loader.current.getBoundingClientRect();

    return loaderBounds.height;
  };

  const setPath = (curve) => {
    const width = window.innerWidth;
    console.log(width);
    const height = loaderHeight();
    console.log("heihgt;", height);
    path.current.setAttributeNS(
      null,
      "d",
      `M0 0
      L${width} 0
      L${width} ${height}
      Q${width / 2} ${height - curve} 0 ${height}
      L0 0`
    );
  };

  const nav = useRef(null);
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
      <div
        className="h-screen w-full flex items-center justify-center text-white"
        ref={scrollContainer}
      >
        <div ref={loader} className="loader">
          <svg>
            <path ref={path}></path>
          </svg>
        </div>
        <motion.div
          style={{
            scale: scaleTransform,
            opacity: opacityTransform,
            y: yTranslate,
            position: "fixed",
          }}
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
              <p>BOOK A CALL</p>
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
      </div>

      {/* to make space for scrolling */}
      {/* <div className="h-screen"></div> */}

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
