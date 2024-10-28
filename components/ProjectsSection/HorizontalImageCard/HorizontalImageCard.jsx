"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export default function HorizontalImageCard({ src, i }) {
  return (
    <div className="relative flex-1 aspect-square md:aspect-video">
      <Image fill src={`/${src}`} alt="image" className="object-contain object-top" />
    </div>
  );
}
