import styles from "./style.module.scss";
import { motion } from "framer-motion";
import { useRef } from "react";
import gsap from "gsap";

export default function link({ project, index }) {
  const { projectTitle, category, client, year } = project;
  const outer = useRef(null);
  const inner = useRef(null);

  const manageMouseEnter = (e) => {
    const bounds = e.target.getBoundingClientRect();
    if (e.clientY < bounds.top + bounds.height / 2) {
      gsap.set(outer.current, { top: "-100%" });
      gsap.set(inner.current, { top: "100%" });
    } else {
      gsap.set(outer.current, { top: "100%" });
      gsap.set(inner.current, { top: "-100%" });
    }
    gsap.to(outer.current, { top: "0%", duration: 0.3 });
    gsap.to(inner.current, { top: "0%", duration: 0.3 });
  };

  const manageMouseLeave = (e) => {
    const bounds = e.target.getBoundingClientRect();
    if (e.clientY < bounds.top + bounds.height / 2) {
      gsap.to(outer.current, { top: "-100%", duration: 0.3 });
      gsap.to(inner.current, { top: "100%", duration: 0.3 });
    } else {
      gsap.to(outer.current, { top: "100%", duration: 0.3 });
      gsap.to(inner.current, { top: "-100%", duration: 0.3 });
    }
  };

  return (
    <motion.div
      onMouseEnter={(e) => {
        manageMouseEnter(e);
      }}
      onMouseLeave={(e) => {
        manageMouseLeave(e);
      }}
      className={styles.el}
    >
      <section className="group py-3 text-sm items-center h-full font-medium w-full grid grid-cols-2 md:grid-cols-4">
        <span className="text-nowrap text-xl text-left">{projectTitle}</span>
        <span className="hidden md:block text-nowrap text-left">
          {category}
        </span>
        <span className="hidden md:block text-nowrap text-left ml-12">
          {client}
        </span>
        <span className="md:text-right text-nowrap ">{year}</span>
      </section>
      <div ref={outer} className={styles.outer}>
        <div ref={inner} className={styles.inner}></div>
      </div>
    </motion.div>
  );
}
