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
  // TODO: don't show the horizontal infinty scroll on small screens
  return (
    <div className={styles.cardContainer}>
      <div
        className={styles.card}
        style={{
          top: `calc(-5vh + ${i * 3}em)`,
        }}
      >
        {i === 0 && (
          <div className="absolute -top-7 items-center text-sm w-full grid grid-cols-2 md:grid-cols-4">
            <span>Project</span>
            <span className="hidden md:block">Category</span>
            <span className="hidden md:block text-left ml-12">Client</span>
            <span className="md:text-right">Year</span>
          </div>
        )}
        {/* A dynamic top position is set depending on the index of each cards, creating a simple stacking effect.
         And that's how the color of each card is set. */}
        <div className="text-sm w-full grid grid-cols-2 md:grid-cols-4">
          {/* <span className="font-bold">00{i + 1}</span> */}
          <span className="">{projectTitle}</span>
          <span className="hidden md:block text-left">{category}</span>
          <span className="hidden md:block text-left ml-12">{client}</span>
          <span className="md:text-right">{year}</span>
        </div>
        <div className={styles.body}>
          <p>{description}</p>

          <div>
            {tags.map((tag) => {
              return <div className="">{tag}</div>;
            })}
          </div>
          <a
            href={link}
            target="_blank"
            className="flex items-center uppercase text-xs"
          >
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
