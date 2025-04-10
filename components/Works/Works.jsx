"use client";
// import "./Projects.css";
// import { useRef } from "react";
// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import { useGSAP } from "@gsap/react";

// gsap.registerPlugin(ScrollTrigger);

// export default function Works() {
//   const galleryRef = useRef(null);
//   const rightRef = useRef(null);
//   const photoRefs = useRef([]);

//   const detailSections = useRef([]);

//   useGSAP(() => {
//     // Pinning the right side
//     ScrollTrigger.create({
//       trigger: galleryRef.current,
//       start: "top top",
//       end: "bottom bottom",
//       pin: rightRef.current,
//     });

//     detailSections.current.forEach((section, index) => {
//       if (index === 0) return; // Skip first photo (already visible)

//       const photo = photoRefs.current[index];
//       if (!photo) return;

//       gsap.to(photo, {
//         clipPath: "inset(0% 0% 0% 0%)",
//         duration: 1,
//         ease: "power2.inOut",
//         scrollTrigger: {
//           trigger: section,
//           start: "top center",
//           end: "bottom center",
//           toggleActions: "play reverse play reverse",
//         },
//       });
//     });
//   }, []);

//   return (
//     <>
//       <h2 className='h2'>Selected</h2>
//       <div className='spacer'></div>

//       <div ref={galleryRef} className='gallery'>
//         <div className='left'>
//           <div className='detailsWrapper'>
//             {Array.from({ length: 3 }).map((_, i) => (
//               <div
//                 key={i}
//                 ref={(el) => (detailSections.current[i] = el)}
//                 className='details'
//               >
//                 <div className='headline'></div>
//                 <div className='text'></div>
//                 <div className='text'></div>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div ref={rightRef} className='right'>
//           <div className='photos'>
//             {["red", "blue", "green"].map((color, i) => (
//               <div
//                 key={i}
//                 ref={(el) => (photoRefs.current[i] = el)}
//                 className='photoBlock'
//                 style={{ backgroundColor: color }}
//               />
//             ))}
//           </div>
//         </div>
//       </div>

//       <div className='spacer'></div>
//     </>
//   );
// }

import "./Projects.css";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function Works() {
  const galleryRef = useRef(null);
  const rightRef = useRef(null);
  const photoRefs = useRef([]);

  const detailSections = useRef([]);

  useGSAP(() => {
    // Pinning the right side
    ScrollTrigger.create({
      trigger: galleryRef.current,
      start: "top top",
      end: "bottom bottom",
      pin: rightRef.current,
    });

    detailSections.current.forEach((section, index) => {
      const photo = photoRefs.current[index];
      if (!photo) return;

      // Only trigger animation for photos after the first
      if (index === 0) return; // Skip first photo (already visible)

      gsap.to(photo, {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: section,
          start: "top center",
          end: "bottom center",
          scrub: true, // Adds smooth scroll-following effect
          toggleActions: "play reverse play reverse",
        },
      });
    });
  }, []);

  return (
    <>
      <h2 className='h2'>Selected</h2>
      <div className='spacer'></div>

      <div ref={galleryRef} className='gallery'>
        <div className='left'>
          <div className='detailsWrapper'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                ref={(el) => (detailSections.current[i] = el)}
                className='details'
              >
                <div className='headline'></div>
                <div className='text'></div>
                <div className='text'></div>
              </div>
            ))}
          </div>
        </div>

        <div ref={rightRef} className='right'>
          <div className='photos'>
            {["red", "blue", "green"].map((color, i) => (
              <div
                key={i}
                ref={(el) => (photoRefs.current[i] = el)}
                className='photoBlock'
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className='spacer'></div>
    </>
  );
}
