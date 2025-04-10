import { useScroll, useTransform, motion } from "framer-motion";
import React, { useRef } from "react";
import styles from "./style.module.css";

export default function TextFadeGradient({ paragraph }) {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start 0.9", "start 0.25"],
    marker: true,
  });

  const words = paragraph.split(" ");
  return (
    <div className='h-fit flex justify-center items-center'>
      <div className='h4 text-white text-center'>
        <p ref={container} className={styles.paragraph}>
          {words.map((word, i) => {
            const start = i / words.length;
            const end = start + 1 / words.length;
            return (
              <Word
                key={i}
                progress={scrollYProgress}
                range={[start, end]}
              >
                {word}
              </Word>
            );
          })}
        </p>
      </div>
    </div>
  );
}

const Word = ({ children, progress, range }) => {
  const opacity = useTransform(progress, range, [0, 1]);

  return (
    <span className={styles.word}>
      <span className={styles.shadow}>{children}</span>
      <motion.span style={{ opacity }}>{children}</motion.span>
      &nbsp;
    </span>
  );
};
