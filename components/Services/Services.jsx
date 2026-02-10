"use client";
import ScrambleText from "../ScrambleText";

export default function Services() {
  const services = [
    "Web Design, Figma",
    "Frontend Development",
    "Next.js, React",
    "WebGL, Three.js",
    "Creative Coding",
    "Headless CMS, Sanity",
    "Headless E-commerce, Shopify",
    "Webflow",
  ];

  const clients = [
    "BODYARMOR",
    "Coca-Cola",
    "A Unified Whole",
    "Lou Phelps",
    "Prudentos",
    "Iffy Studios",
    "From The Farm",
    "Hotel Kühbacher",
    "Secret Nature",
    "Meklit Fekadu Photography",
  ];

  const links = [
    { label: "EMAIL", value: "hello@malikkotb.com", href: "mailto:hello@malikkotb.com" },
    { label: "LINKEDIN", value: "MALIK-KOTB", href: "https://www.linkedin.com/in/malik-kotb/" },
    { label: "INSTAGRAM", value: "@MALIKKOTBB", href: "https://instagram.com/malikkotbb" },
    { label: "TIKTOK", value: "@MALIKRUNS", href: "https://www.tiktok.com/@malikruns" },
    { label: "GITHUB", value: "@MALIKKOTB", href: "https://github.com/malikkotb" },
  ];

  return (
    <div className='relative text-[12px] uppercase w-full' id='services'>
      {/* Desktop: 3 columns side by side */}
      <div className='hidden lg:grid grid-cols-12 gap-x-4'>
        {/* Services Section */}
        <div className='col-span-1 opacity-50'>Services</div>
        <div className='col-span-3'>
          {services.join(", ")}
        </div>

        {/* Clients Section */}
        <div className='col-span-1 opacity-50'>Clients</div>
        <div className='col-span-3'>
          {clients.join(", ")}
        </div>

        {/* Links Section */}
        <div className='col-span-1 opacity-50'>Links</div>
        <div className='col-span-3'>
          <ul className='flex flex-col'>
            {links.map((link) => (
              <li key={link.label} className='grid grid-cols-[80px_1fr]'>
                <span>{link.label}</span>
                <a href={link.href} target='_blank' rel='noopener noreferrer' className='cursor-pointer'>
                  <ScrambleText text={link.value} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Mobile: stacked layout */}
      <div className='flex flex-col gap-6 lg:hidden'>
        {/* Services Section */}
        <div className='grid grid-cols-[80px_1fr] gap-4'>
          <div className='opacity-50'>Services</div>
          <div>{services.join(", ")}</div>
        </div>

        {/* Clients Section */}
        <div className='grid grid-cols-[80px_1fr] gap-4'>
          <div className='opacity-50'>Clients</div>
          <div>{clients.join(", ")}</div>
        </div>

        {/* Links Section */}
        <div className='grid grid-cols-[80px_1fr] gap-4'>
          <div className='opacity-50'>Links</div>
          <ul className='flex flex-col'>
            {links.map((link) => (
              <li key={link.label} className='grid grid-cols-[80px_1fr]'>
                <span>{link.label}</span>
                <a href={link.href} target='_blank' rel='noopener noreferrer' className='cursor-pointer lowercase'>
                  <ScrambleText text={link.value} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
