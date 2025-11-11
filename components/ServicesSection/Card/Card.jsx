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
const Card = ({ service, description, style, i }) => {
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

    return () =>
      window.removeEventListener("resize", updateCarouselWidth);
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
    <div
      className={`${styles.cardContainer} bg-transparent`}
      style={style}
    >
      <div
        className={`${styles.card}  `}
        style={{
          top: `calc(-5vh + ${i * 2.5}em)`,
        }}
      >
        <div className='w-full'>
          <h3 className='w-full md:w-[80%] text-xl font-medium md:text-2xl lg:text-[28px]'>
            {service}
          </h3>
          <p className='w-full md:w-[80%] text-xl font-medium md:text-2xl lg:text-[28px]'>
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Card;
