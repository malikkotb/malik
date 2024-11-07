"use client";
import { motion } from "framer-motion";

export default function Zoop({ children, isHovered }) {
  return (
    <motion.div
      initial="initial"
      animate={isHovered ? "hovered" : "initial"}
      className="relative cursor-pointer overflow-hidden whitespace-nowrap"
    >
      <motion.div
        variants={{
          initial: {
            y: 0,
          },
          hovered: {
            y: "-100%",
            transition: {
              duration: 0.3,
              ease: "easeOut", // Adds an ease-out effect
            },
          },
        }}
        className="flex gap-1 items-center"
      >
        {children}
      </motion.div>
      <motion.div
        className="absolute inset-0 flex gap-1 items-center"
        variants={{
          initial: { y: "100%" },
          hovered: {
            y: 0,
            // transition: {
            //   duration: 0.5,
            //   ease: "easeOut", // Adds an ease-out effect
            // },
          },
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
