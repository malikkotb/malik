
// export default function ActionCall() {
//   return (
//     <a href="mailto:hello@malik.com">
//       <div className="flex w-full cursor-pointer items-center justify-center text-5xl py-[10vh]">GET IN TOUCH</div>
//     </a>
//   );
// }

"use client";
import styles from "./style.module.css";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function ActionCall() {
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

  const animate = () => {
    if (xPercent > 0) {
      xPercent = -100;
    }
    gsap.set(firstText.current, { xPercent: xPercent });
    gsap.set(secondText.current, { xPercent: xPercent });
    requestAnimationFrame(animate);
    xPercent += 0.1;
  };

  return (
    <main className={styles.main}>
      <div className={styles.sliderContainer}>
        <div ref={slider} className={styles.slider}>
          <p ref={firstText}>Freelance Developer -</p>
          <p ref={secondText}>Freelance Developer -</p>
        </div>
      </div>
    </main>
  );
}
