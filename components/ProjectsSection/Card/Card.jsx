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
      <div
        className={styles.card}
        style={{
          top: `calc(-5vh + ${i * 3}em)`,
        }}
      >
        {/* A dynamic top position is set depending on the index of each cards, creating a simple stacking effect.
         And that's how the color of each card is set. */}
        <div className="text-sm w-full grid grid-cols-2 md:grid-cols-4">
          <p className="font-bold">00{i + 1}</p>
          <p className="">{projectTitle}</p>
          <p className="hidden md:block text-right">{category}</p>
          <p className="hidden md:block text-right">{year}</p>
        </div>
        <div className={styles.body}>
          <p>{description}</p>

          <div>
            {tags.map((tag) => {
              return <div className="">{tag}</div>;
            })}
          </div>
          <a href={link} target="_blank" className="flex items-center uppercase text-xs">
            Visit Site <ArrowTopRightIcon />
          </a>

          <div className="flex gap-4">
            {images.map((src, i) => {
              return (
                <div key={`img_${i}`} className="relative w-80 borderr h-80">
                  <Image
                    fill
                    src={`/${src}`}
                    alt="image"
                    className="object-cover"
                  />
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
