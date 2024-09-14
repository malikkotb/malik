"use client";
import Image from "next/image";
import styles from "./style.module.scss";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";

const Card = ({
  projectTitle,
  category,
  client,
  year,
  description,
  tags,
  link,
  images,
  i,
}) => {
  // TODO: make responive !!
  // TODO: only show project and year columns on smaller screens
  return (
    <div className={styles.cardContainer}>
      {/* TODO: change the top to show a little more */}
      <div
        className={styles.card}
        style={{
          top: `calc(-5vh + ${i * 3}em)`,
          // top: `calc(20vh + 5.75em);margin-bottom:11.5em`,
        }}
      >
        {/* A dynamic top position is set depending on the index of each cards, creating a simple stacking effect.
         And that's how the color of each card is set. */}
        <div className="borderr w-full flex justify-between">
          <p className=" font-bold">00{i + 1}</p>
          <p>{projectTitle}</p>
          <p>{category}</p>
          <p>{year}</p>
        </div>
        <div className={styles.body}>
          <div className={styles.description}>
            <p>{description}</p>
            <span>
              <a href={link} target="_blank">
                Visit Site <ArrowTopRightIcon />
              </a>
            </span>
          </div>

          <div className={styles.imageContainer}>
            {images.map((src, i) => {
              return (
                <div key={`img_${i}`} className={styles.inner}>
                  <Image fill src={`/${src}`} alt="image" />
                </div>
              );
            })}
          </div>
          <div className={styles.imageContainer}>
            {images.map((src, i) => {
              return (
                <div key={`img_${i}`} className={styles.inner}>
                  <Image fill src={`/${src}`} alt="image" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
