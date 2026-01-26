"use client";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import styles from "./style.module.css";
import Lenis from "lenis";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const container = useRef(null);
  const images = useRef([]);

  useEffect(() => {
    const lenis = new Lenis();
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }, []);

  useGSAP(() => {
    images.current.forEach((image, index) => {
      gsap.to(image, {
        scrollTrigger: {
          trigger: container.current,
          start: `${1000 * index}vh top`,
          // start: "top 30%",
          end: "+=900",
          // end: `${350 * (index + 1)}vh top`,
          scrub: true,
        },
        maskSize: "300%",
        webkitMaskSize: "300%",
        ease: "none",
      });
    });
  }, []);

  return (
    <main className={`${styles.main} overflow-x-hidden`}>
      <div ref={container} className={styles.container}>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            ref={(el) => (images.current[i] = el)}
            className={styles.imageWrapper}
          >
            <img src={`/img${i + 1}.png`} alt={`Image ${i + 1}`} />
          </div>
        ))}
      </div>
    </main>
  );
}
