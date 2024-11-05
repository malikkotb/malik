"use client";
import styles from "./style.module.css";
import { useEffect, useRef, forwardRef } from "react";
import gsap from "gsap";
import { motion } from "framer-motion";

export default function MarqueeButton({ modal, projects }) {
  const { active, index } = modal;

  const scaleAnimation = {
    initial: {
      scale: 1,
      //   x: "-50%",
      //   y: "-50%",
    },
    enter: {
      scale: 1,
      //   x: "-50%",
      //   y: "-50%",
      transition: { duration: 0.4, ease: [0.76, 0, 0.24, 1] },
    },
    closed: {
      scale: 0,
      //   x: "-50%",
      //   y: "-50%",
      transition: { duration: 0.4, ease: [0.32, 0, 0.67, 0] },
    },
  };
  const firstText = useRef(null);
  const secondText = useRef(null);
  const slider = useRef(null);

  let xPercent = 0;

  // Marquee Code:
  useEffect(() => {
    gsap.set(secondText.current, {
      left: secondText.current.getBoundingClientRect().width,
    });
    requestAnimationFrame(animate);
  }, []);

  //    to animate to the left
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
    xPercent -= 0.3; // Adjust the speed by changing the decrement value
  };

  const modalContainer = useRef(null);

  const cursor = useRef(null);

  const cursorLabel = useRef(null);

  useEffect(() => {
    //Move cursor
    let xMoveCursor = gsap.quickTo(cursor.current, "left", {
      duration: 0.5,
      ease: "power3",
    });

    let yMoveCursor = gsap.quickTo(cursor.current, "top", {
      duration: 0.5,
      ease: "power3",
    });

    //Move cursor label
    let xMoveCursorLabel = gsap.quickTo(cursorLabel.current, "left", {
      duration: 0.45,
      ease: "power3",
    });

    let yMoveCursorLabel = gsap.quickTo(cursorLabel.current, "top", {
      duration: 0.45,
      ease: "power3",
    });

    window.addEventListener("mousemove", (e) => {
      const { clientX, clientY } = e;
      xMoveCursor(clientX);
      yMoveCursor(clientY);
      xMoveCursorLabel(clientX);
      yMoveCursorLabel(clientY);
    });
  }, []);

  return (
    <div>
      <motion.div
        ref={cursor}
        variants={scaleAnimation}
        initial="initial"
        animate={active ? "enter" : "closed"}
        className={styles.main}
      >
        <div ref={slider} className={styles.slider}>
          <p ref={firstText}>View Details •</p>
          <p ref={secondText}>View Details •</p>
        </div>
      </motion.div>
    </div>
  );
}
