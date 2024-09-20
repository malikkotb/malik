"use client";
import { motion } from "framer-motion";
import styles from "./style.module.scss";
import HorizontalImageCard from "../HorizontalImageCard/HorizontalImageCard";
import { animate, useMotionValue } from "framer-motion";
import { useMeasure } from "@uidotdev/usehooks";
import { useEffect } from "react";
import CustomCursor from "../../CustomCursor";
const Card = ({
  projectTitle,
  category,
  client,
  year,
  description,
  tags,
  link,
  images,
  style,
  i,
}) => {
  // TODO: make responive !!
  // TODO: don't show the horizontal infinty scroll on small screens
  // and show images in vertical column instead

  let [ref, { width }] = useMeasure();

  const xTranslation = useMotionValue(0);

  useEffect(() => {
    let controls;
    let finalPosition = -width / 2 - 16; // -8 (because of the gap-4 between images)

    controls = animate(xTranslation, [0, finalPosition], {
      repeat: Infinity,
      duration: 10,
      ease: "linear",
      repeatType: "loop",
      repeatDelay: 0,
    });
  }, [xTranslation, width]);

  return (
    <div className={`${styles.cardContainer} bg-transparent`} style={style}>
      <div
        className={`${styles.card} bg-black dark:bg-black text-white dark:text-white`}
        style={{
          top: `calc(-5vh + ${i * 2.5}em)`,
        }}
      >
        {i === 0 && (
          <div className="absolute uppercase -top-7 items-center text-zinc-400 text-xs w-full grid grid-cols-2 md:grid-cols-4">
            <span>Project</span>
            <span className="hidden md:block">Category</span>
            <span className="hidden md:block text-left ml-12">Client</span>
            <span className="md:text-right">Year</span>
          </div>
        )}
        {/* A dynamic top position is set depending on the index of each cards, creating a simple stacking effect.
         And that's how the color of each card is set. */}
        <div className="text-sm font-semibold w-full grid grid-cols-2 md:grid-cols-4">
          {/* <span className="font-bold">00{i + 1}</span> */}
          <span className="">{projectTitle}</span>
          <span className="hidden md:block text-left">{category}</span>
          <span className="hidden md:block text-left ml-12">{client}</span>
          <span className="md:text-right">{year}</span>
        </div>
        <div className={styles.body}>
          <p className="w-full md:w-[80%] text-base md:text-xl">
            {description} Lorem ipsum, dolor sit amet consectetur adipisicing
            elit. Perspiciatis suscipit modi adipisci quasi blanditiis nostrum
            veniam.
          </p>

          <div className="flex gap-2">
            {tags.map((tag) => {
              return (
                <div key={tag} className="rounded-full text-xs md:text-sm text-black bg-white px-2 py-1">
                  {tag}
                </div>
              );
            })}
          </div>

          <CustomCursor link={link}>
            <motion.div
              // style={{ x: xTranslation }}
              className="flex w-full flex-col md:flex-row gap-4 borderr"
              ref={ref}
              // creates a copy of images, that will update and then seem like its scrolling infintely
              // [...images, ...images]
            >
              {[...images].map((src, i) => {
                return <HorizontalImageCard src={src} key={`img_${i}`} i={i} />;
              })}
            </motion.div>
          </CustomCursor>
        </div>
      </div>
    </div>
  );
};

export default Card;
