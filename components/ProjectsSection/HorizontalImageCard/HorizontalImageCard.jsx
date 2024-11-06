import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
// import fs from "node:fs/promises";
// import { getPlaiceholder } from "plaiceholder";



export default function HorizontalImageCard({ src, i }) {
  return (
    <div className="relative flex-1 aspect-square md:aspect-video">
      <Image fill src={`/${src}`} alt="image" className="object-contain object-top" />
    </div>
  );
}



// export default async function About() {

//   const horizontalSrc = "/about_horizontal.webp";
//   const horizontalBuffer = await fs.readFile(`./public${horizontalSrc}`);
//   const { base64: horizontalBase64 } = await getPlaiceholder(horizontalBuffer);

//   const verticalSrc = "/about_vertical.webp";
//   const verticalBuffer = await fs.readFile(`./public${verticalSrc}`);
//   const { base64: verticalBase64 } = await getPlaiceholder(verticalBuffer);


//   return (
//     <div className="h-fit w-fit">
//       <div className="z-40 fixed inset-0 bg-black opacity-50"></div>
//       <Image
//         src={verticalSrc.replace("./public", "")}
//         fill
//         alt="abouzt image"
//         placeholder="blur"
//         blurDataURL={verticalBase64}
//         className="object-cover md:hidden"
//       />
//       <Image
//         src={horizontalSrc.replace("./public", "")}
//         fill
//         alt="abouzt image"
//         placeholder="blur"
//         blurDataURL={horizontalBase64}
//         className="object-cover hidden md:block"
//       />
//       <div className="fixed z-50 inset-0 flex flex-col justify-center items-center">
//         <span className="text-white text-sm mt-20 uppercase tracking-wide w-[80vw] sm:w-[50vw] md:w-[40vw] lg:w-[30vw] text-center">
//           Prudentos was founded in 2024 by Samira Lorene Prudentos in Berlin, in
//           memory of her father and one of her closest friends. These influences
//           sparked her desire to use her passion for fashion to create something
//           meaningful and give back to society.
//           <br />
//           <br />
//           Prudentos represents a harmonious blend of emotion and aesthetics. The
//           brand combines love, friendship, and inspiration, translating these
//           values into timeless fashion that reflects lightness, simplicity, and
//           beauty. Samira sees fashion as a means of expressing individuality and
//           a way to turn memories, dreams, and visions into reality.
//         </span>
//       </div>
//     </div>
//   );
// }
