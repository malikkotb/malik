"use client";
import ScrambleText from "../ScrambleText";

export default function Services() {
  const links = [
    { id: "linkedin", text: "LINKEDIN", href: "https://www.linkedin.com/in/malik-kotb/" },
    { id: "instagram", text: "INSTAGRAM", href: "https://instagram.com/malikkotbb" },
    { id: "tiktok", text: "TIKTOK", href: "https://www.tiktok.com/@malik.code" },
    { id: "github", text: "GITHUB", href: "https://github.com/malikkotb" },
  ];

  return (
    <div className='relative text-[14px] grid gap-2 grid-cols-12 w-full h-full' id='services'>
      <div className='col-span-3 flex flex-col'>
        <h3 className='eyebrow eyebrow-light'>Services</h3>
        <div className='flex w-full'>
          <ul className='flex flex-col'>
            <li>Web Design, Figma</li>
            <li>Frontend Development</li>
            <li>Next, React</li>
            <li>WebGL, Three.js</li>
            <li>Creative Coding</li>
            <li>Headless CMS, Sanity</li>
            <li>Headless E-commerce, Shopify</li>
            <li>Webflow</li>
          </ul>
        </div>
      </div>
      <div className='col-span-3 flex flex-col'>
        <h3 className='eyebrow eyebrow-light'>Clients</h3>
        <div className='flex w-full '>
          <ul className='flex flex-col'>
            <li>BODYARMOR</li>
            <li>Coca-Cola</li>
            <li>A Unified Whole</li>
            <li>Lou Phelps</li>
            <li>Prudentos</li>
            <li>Iffy Studios</li>
            <li>From The Farm</li>
            <li>Hotel Kühbacher</li>
            <li>Secret Nature</li>
            <li>Meklit Fekadu Photography</li>
          </ul>
        </div>
      </div>
      <div className='col-span-3 flex flex-col'>
        <h3 className='eyebrow eyebrow-light'>Links</h3>
        <div className='flex w-full '>
          <ul className='flex flex-col'>
            {links.map((link) => (
              <li key={link.id}>
                <a href={link.href} target='_blank' rel='noopener noreferrer' className='cursor-pointer'>
                  <ScrambleText text={link.text} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className='col-span-3 flex flex-col'>
       <div className="w-full h-full bg-red-500"></div>
        </div>
    </div>
  );
}
