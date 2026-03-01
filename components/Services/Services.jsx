"use client";
import ScrambleText from "../ScrambleText";

export default function Services() {
  const services = [
    "Web Design, Figma",
    "Next.js/ React.js",
    "Nuxt.js/ Vue.js",
    "WebGL, Three.js",
    "React Three Fiber",
    "Creative Coding",
    "Headless CMS, Sanity",
    "Headless E-commerce, Shopify",
    "Webflow",
  ];

  const bio = (
    <>
      Malik Kotb is a web designer and developer who loves design, motion, and pushing the boundaries of what's possible on the web.
      <br /><br />
      He builds websites that look great and work smoothly, with a focus on beautiful execution and precise attention to detail.
      <br /><br />
      His expertise lies in elevating web experiences through eye-catching design, smooth animations, and immersive 3D elements using WebGL and Three.js.
    </>
  );

  const links = [
    { label: "E-mail", value: "hello@malikkotb.com", href: "mailto:hello@malikkotb.com" },
    { label: "LinkedIn", value: "malik-kotb", href: "https://www.linkedin.com/in/malik-kotb/" },
    { label: "Instagram", value: "malikkotbb", href: "https://instagram.com/malikkotbb" },
    { label: "TikTok", value: "malikruns", href: "https://www.tiktok.com/@malikruns" },
    { label: "GitHub", value: "malikkotb", href: "https://github.com/malikkotb" },
  ];

  return (
    <div className='relative text-[12px] w-full' id='services'>
      {/* Desktop: 3 parent columns, each with internal 4-column grid */}
      <div className='hidden lg:grid grid-cols-3'>
        {/* Bio Section */}
        <div className='grid grid-cols-4 mr-6'>
          <div className='col-span-1'>About</div>
          <div className='col-span-3 leading-[130%] normal-case' style={{ letterSpacing: '0.01em' }}>
            {bio}
          </div>
        </div>

        {/* Services Section */}
        <div className='grid grid-cols-4 mr-6'>
          <div className='col-span-1'>Services</div>
          <div className='col-span-3 leading-[130%] flex flex-col ' style={{ letterSpacing: '0.01em' }}>
            {services.map((service, index) => (
              <span key={index}>{service}</span>
            ))}
          </div>
        </div>

        {/* Links Section */}
        <div className='grid grid-cols-4 mr-6'>
          <div className='col-span-1'>Contact</div>
          <div className='col-span-1 flex flex-col'>
            {links.map((link) => (
              <span key={link.label}>{link.label}</span>
            ))}
          </div>
          <div className='col-span-2 flex flex-col '>
            {links.map((link) => (
              <a key={link.label} href={link.href} target='_blank' rel='noopener noreferrer' className='cursor-pointer'>
                <ScrambleText text={link.value} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile: stacked layout */}
      <div className='flex flex-col gap-6 lg:hidden'>
        {/* Bio Section */}
        <div className='grid grid-cols-[80px_1fr] gap-4'>
          <div className=''>About</div>
          <div className='leading-[130%] normal-case' style={{ letterSpacing: '0.01em' }}>{bio}</div>
        </div>

        {/* Services Section */}
        <div className='grid grid-cols-[80px_1fr] gap-4'>
          <div className=''>Services</div>
          <div className='leading-[130%] flex flex-col' style={{ letterSpacing: '0.01em' }}>
            {services.map((service, index) => (
              <span key={index}>{service}</span>
            ))}
          </div>
        </div>

        {/* Links Section */}
        <div className='grid grid-cols-[80px_1fr] gap-4'>
          <div className=''>Contact</div>
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
    </div>
  );
}
