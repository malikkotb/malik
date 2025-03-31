"use client";
import { motion } from "framer-motion";
import styles from "./style.module.scss";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import HorizontalImageCard from "../HorizontalImageCard/HorizontalImageCard";
import { animate, useMotionValue } from "framer-motion";
import { useMeasure, useWindowSize } from "@uidotdev/usehooks";
import { useEffect, useState, useRef } from "react";
import CustomCursor from "../../CustomCursor";
import Image from "next/image";
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
  style,
  i,
}) => {
  let [ref, { width }] = useMeasure();

  const size = useWindowSize();

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

  const [api, setApi] = useState();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const carouselRef = useRef(null);

  const [carouselWidth, setCarouselWidth] = useState(0);
  useEffect(() => {
    // Assuming you have a way to get the carousel width
    const updateCarouselWidth = () => {
      const carouselWidth = carouselRef.current?.offsetWidth;
      setCarouselWidth(carouselWidth);
    };

    window.addEventListener("resize", updateCarouselWidth);
    updateCarouselWidth();

    return () => window.removeEventListener("resize", updateCarouselWidth);
  }, []);

  const itemWidth = carouselWidth ? carouselWidth / images.length : 0;
  const leftPosition = current * itemWidth;

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <div className={`${styles.cardContainer} bg-transparent`} style={style}>
      <div
        className={`${styles.card}  text-white`}
        style={{
          top: `calc(-5vh + ${i * 2.5}em)`,
        }}
      >
        {i === 0 && (
          <div className="absolute uppercase -top-7 items-center border-white py-[5px] text-zinc-400 text-xs w-full grid grid-cols-2 md:grid-cols-4">
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
          <span className="text-nowrap">{projectTitle}</span>
          <span className="hidden md:block text-nowrap text-left">
            {category}
          </span>
          <span className="hidden md:block text-nowrap text-left ml-12">
            {client}
          </span>
          <span className="md:text-right text-nowrap">{year}</span>
        </div>
        <div className={styles.body}>
          <p className="w-full mt-7 md:w-[80%] text-xl font-medium md:text-2xl lg:text-[28px]">
            {description}
          </p>

          {/* {size.width <= 768 && ( */}
          <a
            href={link}
            target="_blank"
            className="flex text-sm items-center mt-5 px-3 py-2 w-fit rounded-full text-black bg-white"
          >
            Visit Site <ArrowTopRightIcon />
          </a>
          {/* )} */}

          <ul className="flex md:flex-col gap-2 mt-5 mb-10 md:mb-5">
            {tags.map((tag) => (
              <li
                key={tag}
                className={`${styles.customLi} text-xs md:text-base text-white md:py-1`}
              >
                {tag}
              </li>
            ))}
          </ul>

          {/* <div>
                <HorizontalImageCard src={images[0]} i={i} />
              </div> */}
          {size.width <= 768 ? (
            <>
              <Carousel setApi={setApi} ref={carouselRef} className="w-full">
                <CarouselContent>
                  {images.map((img, index) => (
                    <CarouselItem key={index}>
                      <div
                        // style={{ aspectRatio: "9/12" }}
                        className="relative borderr w-full flex flex-col aspect-video transition-opacity duration-200"
                      >
                        <Image
                          className="object-cover"
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                          src={`/${img}`}
                          alt="Product Image"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="flex  transition-all duration-500">
                  <CarouselPrevious />
                </div>
                <div className="flex transition-all duration-500">
                  <CarouselNext />
                </div>
              </Carousel>
            </>
          ) : (
            // <CustomCursor link={link}>
            <motion.div
              // style={{ x: xTranslation }}
              className="mt-5 flex w-full flex-col md:flex-row gap-4"
              ref={ref}
              // creates a copy of images, that will update and then seem like its scrolling infintely
              // [...images, ...images]
            >
              {[...images].map((src, i) => {
                return <HorizontalImageCard src={src} key={`img_${i}`} i={i} />;
              })}
            </motion.div>
            // </CustomCursor>
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;
