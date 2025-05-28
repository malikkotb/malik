"use client";
import { motion } from "framer-motion";

const DURATION = 0.25;

export default function AnimatedLink({
  selected = false, // ✅ allow manual override
  children,
  hovered = false, // ✅ allow manual override
  href,
  newPage,
}) {
  return (
    <motion.div
      initial='initial'
      animate={hovered ? "hovered" : "initial"} // ✅ control with prop
      whileHover='hovered' // still allows self-hover
      className={`relative cursor-pointer overflow-hidden whitespace-nowrap`}
    >
      {/* Top word (visible) */}
      <motion.span
        variants={{
          initial: { y: 0 },
          hovered: { y: "-100%" },
        }}
        transition={{
          duration: DURATION,
          ease: "easeInOut",
        }}
        className={`inline-block font-neuemontreal-medium ${
          selected ? "opacity-50" : "opacity-100"
        }`}
      >
        {children}
      </motion.span>

      {/* Bottom word (hidden then revealed on hover) */}
      <motion.span
        variants={{
          initial: { y: "100%" },
          hovered: { y: 0 },
        }}
        transition={{
          duration: DURATION,
          ease: "easeInOut",
        }}
        className={`absolute left-0 top-0 inline-block ${
          selected ? "opacity-50" : "opacity-100"
        } font-neuemontreal-medium`}
      >
        {children}
      </motion.span>
    </motion.div>
  );
}
