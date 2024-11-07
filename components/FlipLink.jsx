"use client";
import { motion } from "framer-motion";

const DURATION = 0.45;
const STAGGER = 0.025;

export default function FlipLink({ children, href, newPage }) {
  return (
    <a href={href} className="cursor-pointer" target={newPage ? "_blank" : ""}>
      <motion.div
        initial="initial"
        whileHover="hovered"
        // style={{ lineHeight: "0.8" }}
        // inline-flex allows the container to only take up the width of the content, not the full width of the parent.
        className="relative cursor-pointer overflow-hidden whitespace-nowrap"
      >
        <div className="">
          {children.split("").map((l, i) => {
            return (
              <motion.span
                variants={{
                  initial: { y: 0 },
                  hovered: { y: "-100%" }, // this will fully transform the element off of the bottom of the element
                }}
                transition={{
                  duration: DURATION,
                  ease: "easeInOut",
                  delay: STAGGER * i,
                }}
                className="inline-block"
                key={i}
              >
                {l === " " ? <span>&nbsp;</span> : l}
              </motion.span>
            );
          })}
        </div>
        <div className="absolute inset-0">
          {children.split("").map((l, i) => {
            return (
              <motion.span
                variants={{
                  initial: { y: "100%" },
                  hovered: { y: 0 }, // this will fully transform the element off of the bottom of the element
                }}
                transition={{
                  duration: DURATION,
                  ease: "easeInOut",
                  delay: STAGGER * i,
                }}
                className="inline-block"
                key={i}
              >
                {l === " " ? <span>&nbsp;</span> : l}
              </motion.span>
            );
          })}
        </div>
      </motion.div>
    </a>
  );
}
