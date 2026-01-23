"use client";
import styles from "../style.module.css";
import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";
export default function CursorBlend() {
  const [isHovering, setIsHovering] = useState(false); // hover state
  const cursorSize = isHovering ? 400 : 40;

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothMouseX = useSpring(mouseX, { damping: 30, stiffness: 150, mass: 1.2 });
  const smoothMouseY = useSpring(mouseY, { damping: 30, stiffness: 150, mass: 1.2 });

  const maskPosition = useMotionTemplate`${smoothMouseX}px ${smoothMouseY}px`;

  const manageMouseMove = (e: { clientX: any; clientY: any }) => {
    const { clientX, clientY } = e;
    mouseX.set(clientX - cursorSize / 2);
    mouseY.set(clientY - cursorSize / 2);
  };

  useEffect(() => {
    window.addEventListener("mousemove", manageMouseMove);
    return () => {
      window.removeEventListener("mousemove", manageMouseMove);
    };
  }, [cursorSize]);

  return (
    <main className="section fixed top-0 left-0 w-full h-full bg-black">
      <motion.div
        animate={{
          WebkitMaskSize: `${cursorSize}px`,
        }}
        transition={{ type: "tween", ease: "backOut", duration: 0.5 }}
        style={{
          WebkitMaskPosition: maskPosition,
          maskRepeat: "no-repeat",
          maskSize: "40px",
          position: "absolute",
          color: "black",
          backgroundColor: "#433bff",
        }}
        className={`${styles.mask} w-full h-full flex items-center justify-center text-[#afa18f] text-6xl leading-[66px] cursor-default`}
      >
        <p
          className="w-[80vw] p-10"
          onMouseEnter={() => {
            setIsHovering(true);
          }}
          onMouseLeave={() => {
            setIsHovering(false);
          }}
        >
          Sapphire dreams cascade through lemonade rivers, tickling stars with
          feathered laughter, as time pirouettes in a kaleidoscope of forgotten
          melodies.
        </p>
      </motion.div>

      <div className="w-full h-full flex items-center justify-center text-[#afa18f] text-6xl leading-[66px] cursor-default">
        <p className="w-[80vw] p-10">
          Purple feathers <span className="text-[#433bff]">dance atop</span>{" "}
          glass mountains, whispering secrets to the moon&apos;s reflection, while
          elephants juggle galaxies in a cosmic tea party.
        </p>
      </div>
    </main>
  );
}
