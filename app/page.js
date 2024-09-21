"use client";
import FlipLink from "@/components/FlipLink";
import Lenis from "lenis";
import { useEffect, useRef } from "react";
import ActionCall from "../components/ActionCall/ActionCall";
import { Projects } from "../components/ProjectsSection/Projects";
import { ArrowBottomRightIcon, ArrowDownIcon } from "@radix-ui/react-icons";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CornerDownRight } from "lucide-react";
import { useScroll, useTransform, motion } from "framer-motion";
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
  const opacityTransform = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const yTranslate = useTransform(scrollYProgress, [0, 1], [0, 50]);

  const letterWrapperRefs = useRef([]);
  const addToRefs = (refsArray) => (el) => {
    if (el && !refsArray.current.includes(el)) {
      refsArray.current.push(el);
    }
  };

  const addToLetterWrapperRefs = addToRefs(letterWrapperRefs);

  useGSAP(() => {
    gsap.registerPlugin(ScrollTrigger);
    gsap.set(nav.current, { y: -100 });
    gsap.set(servicesRef.current, { y: -100 });
    gsap.set(letterWrapperRefs.current, { y: 400 }); // letter wrapper needs overflow hidden

    gsap.defaults({ duration: 1, ease: "power3.out" });

    // TODO: onScroll decrease opacity of text and image
    // and scale it down like by Huy's website

    // "paused" might be "pause"
    const tl = gsap.timeline({ delay: 0.5 });

    tl.to(letterWrapperRefs.current, {
      y: 0,
      stagger: 0.05,
    })
      .to(headerItem1.current, {
        left: "6vw",
      })
      .to(
        headerItem2.current,
        {
          right: "8vw",
        },
        "<"
      )
      .to(
        // ".item-main .item-img img",
        itemMainImg.current,
        {
          clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)",
        },
        "<"
      )
      .to(headerItem1.current, {
        left: 0,
        scale: 0.95,
      })
      .to(
        headerItem2.current,
        {
          right: 0,
          scale: 0.95,
        },
        "<"
      )
      .to(
        itemMainImg.current,
        {
          scale: 1,
        },
        "<"
      )
      .to(
        nameHeaderRef.current,
        {
          // bottom: "-2em",
          top: "15%",
        },
        "<"
      )
      .to(
        // move the image container down
        ".items .item-main",
        {
          bottom: "2em",
        },
        "<"
      )
      .to(
        nav.current,
        {
          y: 0,
        },
        "<"
      )
      .to(
        servicesRef.current,
        {
          y: 0,
        },
        "<"
      );
  });

  return (
    <main className="">
      {/* TODO: add grainy noise background as ::before on body */}
      {/* TODO: make landing page section sticky and fade out on scroll downs */}
      <nav
        ref={nav}
        style={{ fontWeight: "600" }}
        className="z-50 text-white flex text-xs overflow-hidden justify-between w-full fixed p-5"
      >
        <h1>MALIK KOTB</h1>
        <nav className="flex gap-2">
          <div className="headerLink">
            <FlipLink href="#about">ABOUT</FlipLink>
          </div>
          <div className="headerLink">
            <FlipLink href="#blog">BLOG</FlipLink>
          </div>
          <div className="headerLink">
            <FlipLink href="#projects">WORKS</FlipLink>
          </div>
          <div className="headerLink">
            <FlipLink href="#contact">CONTACT</FlipLink>
          </div>
        </nav>
      </nav>
      {/* landing page section */}
      <motion.div
        style={{
          scale: scaleTransform,
          opacity: opacityTransform,
          y: yTranslate,
        }}
        ref={scrollContainer}
        className="containeR"
      >
        <div className="items">
          <motion.div
            // style={{
            //   scale: scaleTransform,
            //   opacity: opacityTransform,
            //   y: yTranslate,
            // }}
            className="item item-main"
          >
            <div className="item-img">
              <img
                ref={itemMainImg}
                className=""
                src="./profile.jpeg"
                alt="Image description"
              />
            </div>
          </motion.div>
        </div>

        {/* services/description */}
        <motion.div
          // style={{
          //   scale: scaleTransform,
          //   opacity: opacityTransform,
          //   y: yTranslate,
          // }}
          className="text-sm fixed overflow-hidden text-white font-bold bottom-[30%] left-[15%]"
        >
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
        </motion.div>

        {/* nameHeader */}
        <motion.div
          // style={{
          //   scale: scaleTransform,
          //   opacity: opacityTransform,
          //   y: yTranslate,
          // }}
          ref={nameHeaderRef}
          className="header"
        >
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
        </motion.div>
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
