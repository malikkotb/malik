"use client";
import FlipLink from "@/components/FlipLink";
import Clock from "react-live-clock";
import Lenis from "lenis";
import { useEffect, useRef, useState } from "react";
import TextDipserse from "../components/TextDisperse";
import {
  ArrowDownIcon,
  ArrowTopRightIcon,
} from "@radix-ui/react-icons";
import { useGSAP } from "@gsap/react";
import HoverProjectSection from "../components/HoverProject/HoverProjectSection";
import gsap from "gsap";
import { useScroll, useTransform, motion } from "framer-motion";
import MagenticButton from "@/components/MagneticButton";
import { Tinos } from "next/font/google";
import { getCalApi } from "@calcom/embed-react";
import Zoop from "../components/Zoop";

const tinos = Tinos({
  weight: "400",
  subsets: ["latin"],
});
gsap.registerPlugin(useGSAP);
export default function OldHome() {
  useEffect(() => {
    const lenis = new Lenis();
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }, []);

  useEffect(() => {
    (async function () {
      const cal = await getCalApi();
      cal("ui", {
        theme: "dark",
        styles: {
          branding: { brandColor: "#000000" },
        },
      });
    })();
  }, []);

  const loader = useRef(null);
  const path = useRef(null);
  const initialCurve = 200;

  const [isHovered, setIsHovered] = useState(false);

  const duration = 600;
  let start;

  useEffect(() => {
    setPath(initialCurve);
    requestAnimationFrame(animate);
    document.body.style.backgroundColor = "black";
  }, []);

  const animate = (timestamp) => {
    if (start === undefined) {
      start = timestamp;
    }
    const elapsed = timestamp - start;
    const newCurve = easeOutQuad(
      elapsed,
      initialCurve,
      -200,
      duration
    );
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
    const height = loaderHeight();
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

  const scaleTransform = useTransform(
    scrollYProgress,
    [0, 1],
    [1, 0.9]
  );
  const opacityTransform = useTransform(
    scrollYProgress,
    [0, 0.3],
    [1, 0]
  );
  const yTranslate = useTransform(scrollYProgress, [0, 1], [0, 50]);

  const background = useRef(null);
  const setBackground = (isActive) => {
    gsap.to(background.current, { opacity: isActive ? 0.8 : 0 });
  };

  const statusOpacity = useTransform(
    scrollYProgress,
    [0, 0.05],
    [1, 0]
  );

  const revealRefs = useRef([]);
  const headerRevealRefs = useRef([]);

  const addToRefs = (refsArray) => (el) => {
    if (el && !refsArray.current.includes(el)) {
      refsArray.current.push(el);
    }
  };

  const addToRevealRefs = addToRefs(revealRefs);
  const addToHeaderRevealRefs = addToRefs(headerRevealRefs);

  const [removeWrapper, setRemoveWrapper] = useState(false);

  const setInitialStates = () => {
    gsap.set(revealRefs.current, {
      yPercent: 100,
    });
    gsap.set(headerRevealRefs.current, {
      yPercent: 100,
    });
  };

  const preloaderAnimation = () => {
    const tl = gsap.timeline({
      onComplete: () => {
        setRemoveWrapper(true);
        if (nav.current) {
          // nav.current.style.backgroundColor = "rgb(18, 18, 18)";
        }
      },
      defaults: {},
    });
    tl.to(revealRefs.current, {
      visibility: "visible",
      delay: 0.2,
    })
      .to(
        revealRefs.current,
        {
          yPercent: 0,
          duration: 1,
          ease: "power2.out",
          stagger: 0.08,
        },
        "<"
      )
      .to(
        headerRevealRefs.current,
        {
          visibility: "visible",
          delay: 0.2,
        },
        "<"
      )
      .to(
        headerRevealRefs.current,
        {
          yPercent: 0,
          duration: 1,
          ease: "power2.out",
          // stagger: 0.08,
        },
        "<"
      );
  };

  useGSAP(() => {
    const master = gsap.timeline();
    master.add(setInitialStates).add(preloaderAnimation());
  }, []);

  return (
    <main className='relative'>
      <div ref={loader} className='loader'>
        <svg>
          <path ref={path}></path>
        </svg>
      </div>
      {/* header */}
      <nav
        ref={nav}
        style={{ fontWeight: "600" }}
        className='z-50 text-white flex text-xs overflow-hidden justify-between w-full fixed p-5 px-4'
      >
        <div className='overflow-hidden'>
          <div
            className='flex gap-3 invisible'
            ref={addToHeaderRevealRefs}
          >
            {/* <MagenticButton> */}
            <h1 className={`cursor-pointer`}>MALIK KOTB</h1>
            {/* </MagenticButton> */}
            <Clock format={"h:mm A"} />
          </div>
        </div>
        <div className='overflow-hidden'>
          <div
            className='flex gap-2 invisible'
            ref={addToHeaderRevealRefs}
          >
            <div className='headerLink'>
              <FlipLink
                newPage={true}
                href='https://malikkotb.github.io/blog/'
              >
                BLOG
              </FlipLink>
            </div>
            <div className='headerLink'>
              <FlipLink href='#projects'>PROJECTS</FlipLink>
            </div>
            <div className='headerLink'>
              <FlipLink href='mailto:hello@malikkotb.com'>
                CONTACT
              </FlipLink>
            </div>
          </div>
        </div>
      </nav>
      {/* landing page section */}
      <div
        id='home'
        className='h-[100vh] w-full flex items-center justify-center text-white'
        ref={scrollContainer}
      >
        <motion.div
          style={{
            scale: scaleTransform,
            opacity: opacityTransform,
            y: yTranslate,
            position: "fixed",
          }}
        >
          <div className='maiN'>
            <div className={`body ${tinos.className} tracking-tight`}>
              <div className='overflow-hidden'>
                <div
                  className={`introLine invisible justify-center`}
                  ref={addToRevealRefs}
                >
                  <p className='tracking-tight'>Malik Kotb</p>
                </div>
              </div>

              <div className='overflow-hidden'>
                <div
                  className='introLine invisible'
                  ref={addToRevealRefs}
                >
                  <p
                    style={{
                      filter: "grayscale(100%)",
                    }}
                  >
                    Front 🖼️ End ☀
                  </p>
                </div>
              </div>

              <div className='overflow-hidden'>
                <div
                  className='introLine invisible'
                  ref={addToRevealRefs}
                >
                  {/* <p>Web</p> */}
                  <p style={{ filter: "grayscale(100%)" }}>
                    Developer
                  </p>
                </div>
              </div>

              {removeWrapper ? (
                <TextDipserse
                  link={"https://github.com/malikkotb"}
                  setBackground={setBackground}
                  flipped={false}
                >
                  <p>PORTFOLIO 24</p>
                </TextDipserse>
              ) : (
                <div style={{ overflow: "hidden" }}>
                  <div className='' ref={addToRevealRefs}>
                    <TextDipserse
                      link={"https://github.com/malikkotb"}
                      setBackground={setBackground}
                      flipped={false}
                    >
                      <p>PORTFOLIO 24</p>
                    </TextDipserse>
                  </div>
                </div>
              )}

              {removeWrapper ? (
                <>
                  <TextDipserse
                    link={"mailto:hello@malikkotb.com"}
                    setBackground={setBackground}
                    flipped={false}
                  >
                    <p>→Email</p>
                  </TextDipserse>

                  <TextDipserse
                    link={"https://instagram.com/malikhavemercy"}
                    setBackground={setBackground}
                    flipped={true}
                  >
                    <p>→Insta</p>
                  </TextDipserse>
                </>
              ) : (
                <div style={{ overflow: "hidden" }}>
                  <div className='gap-8 flex' ref={addToRevealRefs}>
                    <TextDipserse
                      link={"mailto:hello@malikkotb.com"}
                      setBackground={setBackground}
                      flipped={false}
                    >
                      <p>→Email</p>
                    </TextDipserse>

                    <TextDipserse
                      link={"https://instagram.com/malikhavemercy"}
                      setBackground={setBackground}
                      flipped={true}
                    >
                      <p>→Insta</p>
                    </TextDipserse>
                  </div>
                </div>
              )}
            </div>
            <div ref={background} className='background'></div>
          </div>
        </motion.div>
      </div>

      <motion.div
        style={{
          opacity: statusOpacity,
          position: "fixed",
        }}
        id='status'
        className='text-white bottom-4 flex uppercase tracking-tight flex-col right-4'
      >
        <div className='overflow-hidden'>
          <div
            ref={addToRevealRefs}
            className='opacity-70 flex md:gap-1 flex-col md:flex-row text-xs'
          >
            <span>Available for</span>
            <span>Freelance Work</span>
          </div>
        </div>
        <div className='overflow-hidden'>
          <div
            ref={addToRevealRefs}
            className='text-3xl md:text-4xl font-medium'
          >
            FEB &apos;25
          </div>
        </div>
      </motion.div>

      <motion.div
        style={{
          opacity: statusOpacity,
          position: "fixed",
        }}
        id='status'
        className='text-white bottom-4 flex uppercase tracking-tight flex-col left-1/2'
      >
        <div className='overflow-hidden'>
          <div
            ref={addToRevealRefs}
            className='text-3xl icon md:text-4xl font-medium'
          >
            <ArrowDownIcon />
          </div>
        </div>
      </motion.div>

      <motion.div
        style={{
          opacity: statusOpacity,
          position: "fixed",
        }}
        id='status'
        data-cal-link='malikkotb'
        data-cal-config='{"theme":"dark"}'
        className='font-medium text-white bottom-4 flex uppercase tracking-tight flex-col left-4'
      >
        <div className='overflow-hidden'>
          <div
            ref={addToRevealRefs}
            className='overflow-hidden relative py-3 px-4 btn btn2 rounded-full font-medium'
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Zoop isHovered={isHovered}>
              BOOK A CALL <ArrowTopRightIcon />
            </Zoop>
          </div>
        </div>
      </motion.div>

      <HoverProjectSection />
      {/* <Projects /> */}
      {/* <TextFadeGradient
        paragraph={
          "I am a frontend developer based in Paris and working globally. With a passion for creating seamless, engaging web experiences, I focus on ensuring every project leaves users with a feel-good sensation through attention to detail and a user-centric design approach."
        }
      /> */}
      {/* <ActionCall /> */}
    </main>
  );
}
