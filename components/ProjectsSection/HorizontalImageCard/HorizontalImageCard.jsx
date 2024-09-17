"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export default function HorizontalImageCard({ src, i }) {
  return (
    <div className="relative h-[320px] min-w-[400px]">
      <Image fill src={`/${src}`} alt="image" className="object-cover" />
    </div>
  );
}
