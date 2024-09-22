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
        <div className="w-[50vw] text-white">
          <div className="introLine">
            <p>Nathan</p>

            <p>Smith</p>
          </div>

          <div className="introLine">
            <p>Design</p>

            <p>&</p>
          </div>

          <div className="introLine">
            <p>Art</p>

            <p>Direction</p>
          </div>

          <TextDipserse>
            <p>+447533063596</p>
          </TextDipserse>

          <TextDipserse>
            <p>→Email</p>
          </TextDipserse>

          <TextDipserse>
            <p>→Insta</p>
          </TextDipserse>
        </div>
      </motion.div>

      {/* landing page section (archived) */}
      {/* <motion.div
        style={{
          scale: scaleTransform,
          opacity: opacityTransform,
          y: yTranslate,
        }}
        ref={scrollContainer}
        className="containeR"
      >
        <div className="items">
          <div className="item item-main">
            <div className="item-img">
              <img
                ref={itemMainImg}
                className=""
                src="./profile.jpeg"
                alt="Image description"
              />
            </div>
          </div>
        </div>

        <div className="text-sm fixed overflow-hidden text-white font-bold bottom-[30%] left-[15%]">
          <div ref={servicesRef} className="flex gap-2">
            <span className="items-center flex">
              <CornerDownRight />
            </span>
            <div className="uppercase flex flex-col">
              <span>UXUI Design</span>
              <span>Web Development</span>
              <span>Interaction</span>
            </div>
          </div>
        </div>

        <div ƒ ref={nameHeaderRef} className="header">
          <div ref={headerItem1} className="header-item header-item-1">
            <div className="letter">
              <div ref={addToLetterWrapperRefs} className="letter-wrapper">
                M
              </div>
            </div>
            <div className="letter">
              <div ref={addToLetterWrapperRefs} className="letter-wrapper">
                A
              </div>
            </div>
            <div className="letter">
              <div ref={addToLetterWrapperRefs} className="letter-wrapper">
                L
              </div>
            </div>
            <div className="letter">
              <div ref={addToLetterWrapperRefs} className="letter-wrapper">
                I
              </div>
            </div>
            <div className="letter">
              <div ref={addToLetterWrapperRefs} className="letter-wrapper">
                K
              </div>
            </div>
          </div>

          <div ref={headerItem2} className="header-item header-item-2">
            <div className="letter">
              <div ref={addToLetterWrapperRefs} className="letter-wrapper">
                K
              </div>
            </div>
            <div className="letter">
              <div ref={addToLetterWrapperRefs} className="letter-wrapper">
                O
              </div>
            </div>
            <div className="letter">
              <div ref={addToLetterWrapperRefs} className="letter-wrapper">
                T
              </div>
            </div>
            <div className="letter">
              <div ref={addToLetterWrapperRefs} className="letter-wrapper">
                B
              </div>
            </div>
          </div>
        </div>
      </motion.div> */}

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
