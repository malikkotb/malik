import React from "react";
import Image from "next/image";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

export default function TopSection() {

  return (
    <div className="w-full mb-36">
      <div className="images flex gap-5 ">
        <div className="image1 relative w-[30%] min-w-[600px] h-[800px]">
          <Image src="/demos/10.avif" alt="Description" fill />
        </div>
        <div className="image2 relative w-[70%] ">
          <Image src="/demos/11.avif" alt="Description" fill />
        </div>
      </div>
      <div className="body">
        <div className="flex justify-between mt-5 item">
          <h1 className="text-7xl">Horizontal Section</h1>
          <h2 className="text-4xl">With Framer Motion and Next.js</h2>
        </div>
        <p className={inter.className}>Pictures by @laraaceliaa</p>
      </div>
    </div>
  );
}
