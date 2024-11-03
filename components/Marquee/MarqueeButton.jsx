"use client";
import styles from "./style.module.css";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { motion } from "framer-motion";

export default function MarqueeButton() {
  const scaleAnimation = {
    initial: { scale: 0, x: "-50%", y: "-50%" },
    enter: {
      scale: 1,
      x: "-50%",
      y: "-50%",
      transition: { duration: 0.4, ease: [0.76, 0, 0.24, 1] },
    },
    closed: {
      scale: 0,
      x: "-50%",
      y: "-50%",
      transition: { duration: 0.4, ease: [0.32, 0, 0.67, 0] },
    },
  };
  const firstText = useRef(null);
  const secondText = useRef(null);
  const slider = useRef(null);

  let xPercent = 0;

  useEffect(() => {
    gsap.set(secondText.current, {
      left: secondText.current.getBoundingClientRect().width,
    });
    requestAnimationFrame(animate);
  }, []);

  //   to animate to the right
  //   const animate = () => {
  //     if (xPercent > 0) {
  //       xPercent = -100;
  //     }
  //     gsap.set(firstText.current, { xPercent: xPercent });
  //     gsap.set(secondText.current, { xPercent: xPercent });
  //     requestAnimationFrame(animate);
  //     xPercent += 0.7;
  //   };

  //  to animate to the left
  const animate = () => {
    // Reset `xPercent` once it exceeds 100% to create the looping effect
    if (xPercent < -100) {
      xPercent = 0;
    }
    // Move first text to the left
    gsap.set(firstText.current, { xPercent: xPercent });

    // Move second text to the right
    gsap.set(secondText.current, { xPercent: xPercent });

    requestAnimationFrame(animate);
    xPercent -= 0.7; // Adjust the speed by changing the decrement value
  };

  return (
    <>
      <motion.div
        className={styles.cursor}
        variants={scaleAnimation}
        initial="initial"
        animate={active ? "enter" : "closed"}
      ></motion.div>

      <motion.div
        className={styles.cursorLabel}
        variants={scaleAnimation}
        initial="initial"
        animate={active ? "enter" : "closed"}
      >
        View
      </motion.div>
      {/* <div className={styles.main}>
        <div ref={slider} className={styles.slider}>
          <p ref={firstText}>View Details -</p>
          <p ref={secondText}>View Details -</p>
        </div>
      </div> */}
    </>
  );
}
