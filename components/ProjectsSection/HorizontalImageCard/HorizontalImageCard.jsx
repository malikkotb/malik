"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export default function HorizontalImageCard({ src, i }) {
  return (
    <div className="relative flex-1 aspect-square md:aspect-[4/3]">
      <Image fill src={`/${src}`} alt="image" className="object-fit" />
    </div>
  );
}
