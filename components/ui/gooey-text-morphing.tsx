"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface GooeyTextProps {
  texts: string[];
  morphTime?: number;
  cooldownTime?: number;
  className?: string;
  textClassName?: string;
}

export function GooeyText({
  texts,
  morphTime = 1,
  cooldownTime = 0.25,
  className,
  textClassName,
}: GooeyTextProps) {
  const text1Ref = React.useRef<HTMLSpanElement>(null);
  const text2Ref = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    if (texts.length < 2) return; // Ensure we have at least two texts

    let textIndex = 0;
    let time = new Date();
    let morph = 0;
    let cooldown = cooldownTime;
    let animationFrameId: number;

    const setMorph = (fraction: number) => {
      if (text1Ref.current && text2Ref.current) {
        text2Ref.current.style.filter = `blur(${Math.min(
          8 / fraction - 8,
          100
        )}px)`;
        text2Ref.current.style.opacity = `${
          Math.pow(fraction, 0.4) * 100
        }%`;

        fraction = 1 - fraction;
        text1Ref.current.style.filter = `blur(${Math.min(
          8 / fraction - 8,
          100
        )}px)`;
        text1Ref.current.style.opacity = `${
          Math.pow(fraction, 0.4) * 100
        }%`;
      }
    };

    function animate() {
      const newTime = new Date();
      const dt = (newTime.getTime() - time.getTime()) / 1000;
      time = newTime;

      cooldown -= dt;

      if (cooldown <= 0) {
        morph += dt;
        let fraction = morph / morphTime;

        if (fraction > 1) {
          fraction = 1;
        }

        setMorph(fraction);

        if (fraction >= 1) {
          cancelAnimationFrame(animationFrameId);
          return;
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    }

    // if (text1Ref.current && text2Ref.current) {
    //   text1Ref.current.textContent = texts[0];
    //   text2Ref.current.textContent = texts[1];
    // }

    if (text1Ref.current && text2Ref.current) {
      text1Ref.current.textContent = texts[0];
      text2Ref.current.textContent = texts[1];

      // Hide the second text initially to prevent flashing
      text2Ref.current.style.opacity = "0";
      text2Ref.current.style.filter = "blur(10px)";
    }

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [texts, morphTime, cooldownTime]);

  return (
    <div className={cn("relative text-white", className)}>
      <svg
        className='absolute h-0 w-0'
        aria-hidden='true'
        focusable='false'
      >
        <defs>
          <filter id='threshold'>
            <feColorMatrix
              in='SourceGraphic'
              type='matrix'
              values='1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 255 -140'
            />
          </filter>
        </defs>
      </svg>

      <div
        className='flex items-center justify-center'
        style={{ filter: "url(#threshold)" }}
      >
        <span
          ref={text1Ref}
          className={cn(
            "absolute inline-block select-none text-start text-6xl md:text-[250px]",
            "text-foreground",
            textClassName
          )}
        />
        <span
          ref={text2Ref}
          className={cn(
            "absolute inline-block select-none text-center text-6xl md:text-[250px]",
            "text-foreground",
            textClassName
          )}
        />
      </div>
    </div>
  );
}

// "use client";

// import * as React from "react";
// import { cn } from "@/lib/utils";

// interface GooeyTextProps {
//   texts: string[];
//   morphTime?: number;
//   cooldownTime?: number;
//   className?: string;
//   textClassName?: string;
// }

// export function GooeyText({
//   texts,
//   morphTime = 1,
//   cooldownTime = 0.25,
//   className,
//   textClassName,
// }: GooeyTextProps) {
//   const text1Ref = React.useRef<HTMLSpanElement>(null);
//   const text2Ref = React.useRef<HTMLSpanElement>(null);

//   React.useEffect(() => {
//     let textIndex = texts.length - 1;
//     let time = new Date();
//     let morph = 0;
//     let cooldown = cooldownTime;

//     const setMorph = (fraction: number) => {
//       if (text1Ref.current && text2Ref.current) {
//         text2Ref.current.style.filter = `blur(${Math.min(
//           8 / fraction - 8,
//           100
//         )}px)`;
//         text2Ref.current.style.opacity = `${
//           Math.pow(fraction, 0.4) * 100
//         }%`;

//         fraction = 1 - fraction;
//         text1Ref.current.style.filter = `blur(${Math.min(
//           8 / fraction - 8,
//           100
//         )}px)`;
//         text1Ref.current.style.opacity = `${
//           Math.pow(fraction, 0.4) * 100
//         }%`;
//       }
//     };

//     const doCooldown = () => {
//       morph = 0;
//       if (text1Ref.current && text2Ref.current) {
//         text2Ref.current.style.filter = "";
//         text2Ref.current.style.opacity = "100%";
//         text1Ref.current.style.filter = "";
//         text1Ref.current.style.opacity = "0%";
//       }
//     };

//     const doMorph = () => {
//       morph -= cooldown;
//       cooldown = 0;
//       let fraction = morph / morphTime;

//       if (fraction > 1) {
//         cooldown = cooldownTime;
//         fraction = 1;
//       }

//       setMorph(fraction);
//     };

//     function animate() {
//       requestAnimationFrame(animate);
//       const newTime = new Date();
//       const shouldIncrementIndex = cooldown > 0;
//       const dt = (newTime.getTime() - time.getTime()) / 1000;
//       time = newTime;

//       cooldown -= dt;

//       if (cooldown <= 0) {
//         if (shouldIncrementIndex) {
//           textIndex = (textIndex + 1) % texts.length;
//           if (text1Ref.current && text2Ref.current) {
//             text1Ref.current.textContent =
//               texts[textIndex % texts.length];
//             text2Ref.current.textContent =
//               texts[(textIndex + 1) % texts.length];
//           }
//         }
//         doMorph();
//       } else {
//         doCooldown();
//       }
//     }

//     animate();

//     return () => {
//       // Cleanup function if needed
//     };
//   }, [texts, morphTime, cooldownTime]);

//   return (
//     <div className={cn("relative", className)}>
//       <svg
//         className='absolute h-0 w-0'
//         aria-hidden='true'
//         focusable='false'
//       >
//         <defs>
//           <filter id='threshold'>
//             <feColorMatrix
//               in='SourceGraphic'
//               type='matrix'
//               values='1 0 0 0 0
//                       0 1 0 0 0
//                       0 0 1 0 0
//                       0 0 0 255 -140'
//             />
//           </filter>
//         </defs>
//       </svg>

//       <div
//         className='flex items-center justify-center'
//         style={{ filter: "url(#threshold)" }}
//       >
//         <span
//           ref={text1Ref}
//           className={cn(
//             "absolute inline-block select-none text-center text-6xl md:text-[250px]",
//             "text-foreground",
//             textClassName
//           )}
//         />
//         <span
//           ref={text2Ref}
//           className={cn(
//             "absolute inline-block select-none text-center text-6xl md:text-[250px]",
//             "text-foreground",
//             textClassName
//           )}
//         />
//       </div>
//     </div>
//   );
// }
