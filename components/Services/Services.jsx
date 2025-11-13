"use client";
import { motion } from "framer-motion";

const services = [
  {
    title: "Web Design",
    description: [
      "Craft clean, engaging, user-focused web designs.",
      "Figma interfaces",
      "Webflow & custom builds",
      "User journeys & flows",
    ],
  },

  {
    title: "Web Development",
    description: [
      "Build fast, scalable, modern websites.",
      "Next.js & React",
      "GSAP & Framer Motion",
      "CMS integrations",
    ],
  },

  {
    title: "3D Development",
    description: [
      "Create immersive 3D web experiences.",
      "Three.js & WebGL",
      "Interactive visualizations",
      "Cross-device performance",
    ],
  },
];

// const services = [
//   {
//     title: "Web Design",
//     description: [
//       "I craft visually striking and user-centric web designs that blend aesthetics with functionality.",
//       "Design intuitive interfaces in Figma",
//       "Focus on user journeys that make sense",
//       "Build with Webflow or custom solutions",
//     ],
//   },

//   {
//     title: "Web Development",
//     description: [
//       "I build high-performance, scalable websites using cutting-edge technologies.",
//       "Develop with Webflow or Custom Solutions (Next.js, React, etc.)",
//       "Animate with GSAP and Framer Motion",
//       "Integrate flexible CMS solutions",
//     ],
//   },
//   {
//     title: "3D Development",
//     description: [
//       "I create immersive 3D web experiences that push the boundaries of browser capabilities.",
//       "Build with Three.js and WebGL",
//       "Create interactive 3D visualizations",
//       "Deliver performant cross-device experiences",
//     ],
//   },
// ];

export default function Services() {
  const titleVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.02,
      },
    },
  };

  const letterVariants = {
    hidden: { y: "100%", opacity: 0 },
    visible: {
      y: "0%",
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <div
      className='relative w-full h-full section-padding'
      id='services'
    >
      <h3 className='eyebrow eyebrow-light'>Services</h3>
      <div className='flex flex-col gap-10 lg:gap-20 w-full'>
        {services.map((service, serviceIndex) => (
          <div
            key={service.title}
            className='flex flex-col md:grid grid-cols-12 gap-5'
          >
            <motion.div
              className='text-[24px] leading-[110%] lg:text-[32px] col-span-5 overflow-hidden'
              variants={titleVariants}
              initial='hidden'
              whileInView='visible'
              viewport={{ once: true, amount: 0.8 }}
            >
              {[...service.title].map((char, idx) => (
                <motion.span
                  key={`${service.title}-${idx}`}
                  variants={letterVariants}
                  className='inline-block'
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </motion.div>
            <div className='col-start-7 lg:text-[18px] col-span-6'>
              <p>{service.description[0]}</p>
              <ul className='list-disc list-inside mt-2 space-y-1'>
                {service.description.slice(1).map((desc, idx) => (
                  <li key={`${service.title}-desc-${idx}`}>{desc}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// const services = [
//   {
//     id: "01",
//     title: "Web Design",
//     items: [
//       "Go-To-Market Strategy",
//       "Brand Strategy",
//       "Visual Identities",
//       "Brand Guidelines",
//       "Logo Creation",
//       "Value Propositions",
//     ],
//   },
//   {
//     id: "02",
//     title: "Web Development",
//     items: [
//       "UX/UI Design",
//       "CMS Implementation",
//       "Web Design",
//       "Development",
//       "Webflow",
//     ],
//   },
//   {
//     id: "03",
//     title: "3D Development",
//     items: [
//       "Content",
//       "Social",
//       "Paid Media",
//       "Campaigns",
//       "SEO",
//       "Marketing Ops",
//       "Analytics",
//     ],
//   },
// ];

// export default function Services() {
//   return (
//     <div
//       className='relative w-full h-full section-padding'
//       id='services'
//     >
//       <h3 className='eyebrow eyebrow-light'>Services</h3>
//       <section className='py-16 borderr md:pl-[5%]'>
//         <div className='flex flex-col md:flex-row gap-12 justify-center borderr w-full'>
//           {services.map((service, index) => (
//             <div
//               key={service.id}
//               className='flex flex-col flex-1 md:w-[25vw]'
//             >
//               <span className='eyebrow eyebrow-light md:mb-2'>{service.id}</span>
//               <h3 className='text-[32px] mb-4'>{service.title}</h3>
//               <ul className='space-y-1'>
//                 {service.items.map((item, index) => (
//                   <li key={index} className='text-lg'>
//                     {item}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           ))}
//         </div>
//       </section>
//       {/* <div className='flex flex-col gap-10 lg:gap-20 w-full'>
//         <div className='flex flex-col lg:grid grid-cols-12 gap-5'>
//           <div className='text-[24px] leading-[100%] lg:text-[32px] col-span-5'>
//             {services[0].title}
//           </div>
//           <div className='col-start-7 col-span-6'>
//             <p>{services[0].description[0]}</p>
//             <ul className='list-disc list-inside mt-2 space-y-1'>
//               {services[0].description
//                 .slice(1)
//                 .map((description, i) => (
//                   <li key={i + 1}>{description}</li>
//                 ))}
//             </ul>
//           </div>
//         </div>
//         <div className='flex flex-col lg:grid grid-cols-12 gap-5'>
//           <div className='text-[24px] leading-[100%] lg:text-[32px] col-span-5'>
//             {services[1].title}
//           </div>
//           <div className='col-start-7 col-span-6'>
//             <p>{services[1].description[0]}</p>
//             <ul className='list-disc list-inside mt-2 space-y-1'>
//               {services[1].description
//                 .slice(1)
//                 .map((description, i) => (
//                   <li key={i + 1}>{description}</li>
//                 ))}
//             </ul>
//           </div>
//         </div>
//         <div className='flex flex-col lg:grid grid-cols-12 gap-5'>
//           <div className='text-[24px] leading-[100%] lg:text-[32px] col-span-5'>
//             {services[2].title}
//           </div>
//           <div className='col-start-7 col-span-6'>
//             <p>{services[2].description[0]}</p>
//             <ul className='list-disc list-inside mt-2 space-y-1'>
//               {services[2].description
//                 .slice(1)
//                 .map((description, i) => (
//                   <li key={i + 1}>{description}</li>
//                 ))}
//             </ul>
//           </div>
//         </div>
//       </div> */}
//     </div>
//   );
// }
