import { useEffect } from "react";
import DynamicCurrentTime from "../DynamicCurrentTime/DynamicCurrentTime";
import ScrambleLink from "../Scramble/ScrambleLink";
import { getCalApi } from "@calcom/embed-react";

export default function Navigation() {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi();
      cal("ui", {
        theme: "dark",
        styles: {
          branding: { brandColor: "#000000" },
        },
      });
    })();
  }, []);

  return (
    <div className='md:sticky md:top-5 flex flex-col justify-between h-[calc(100vh-20px)] md:h-[calc(100vh-40px)] pb-5 md:pb-0 col-span-6'>
      <div className='flex justify-between'>
        <div className='text-sm flex flex-col'>
          <h2 style={{ letterSpacing: "-0.03em" }}>MALIK KOTB</h2>
          <h2>CREATIVE DEVELOPER</h2>
        </div>
        <nav className='uppercase text-sm md:hidden flex flex-col'>
          <ScrambleLink href='#top'>INDEX</ScrambleLink>
          <ScrambleLink href='#services'>SERVICES</ScrambleLink>
          <ScrambleLink href='#work'>WORK</ScrambleLink>
          <ScrambleLink href='#about'>ABOUT</ScrambleLink>
        </nav>
      </div>
      <nav className='uppercase text-sm hidden md:flex flex-col'>
        <ScrambleLink href='#top'>INDEX</ScrambleLink>
        <ScrambleLink href='#services'>SERVICES</ScrambleLink>
        <ScrambleLink href='#work'>WORK</ScrambleLink>
        <ScrambleLink href='#about'>ABOUT</ScrambleLink>
        <div
          id='status'
          data-cal-link='malikkotb'
          data-cal-config='{"theme":"dark"}'
          className='w-fit'
        >
          <ScrambleLink href='#lets-talk'>LET&apos;S TALK</ScrambleLink>
        </div>
      </nav>
      <div className='flex flex-col md:hidden mt-4 gap-4'>
        <h1 className='items-end'>
          Independent
          <br />
          <span className='whitespace-nowrap'>
            Creative Developer
          </span>
        </h1>
        <div className='grid-cols-4 grid'>
          <h3 className='uppercase text-sm opacity-65 col-span-3'>
            I turn design-led ideas into powerful websites—because
            great work deserves a great presence.
          </h3>
        </div>
        <div
          id='status'
          data-cal-link='malikkotb'
          data-cal-config='{"theme":"dark"}'
          className='w-fit uppercase text-xl'
        >
          Book a call
        </div>
      </div>
      <div className='flex md:hidden items-end flex-col w-full h-fit'>
        <div
          style={{ lineHeight: "120%" }}
          className='uppercase text-sm opacity-65'
        >
          Available for
          <br />
          Freelance Work
        </div>
        <div className='font-neuemontreal-medium text-4xl'>
          Sep &apos;25
        </div>
      </div>
      <div className='uppercase text-sm hidden md:flex flex-col gap-5'>
        <DynamicCurrentTime />

        <div className='flex flex-col'>
          <div className='flex gap-1'>
            <p className='opacity-65 group-hover:opacity-100 transition-opacity duration-300 ease-in-out'>
              →
            </p>
            <ScrambleLink
              target='_blank'
              href='https://www.tiktok.com/@malik.code'
            >
              TIKTOK
            </ScrambleLink>
          </div>
          <div className='flex gap-1'>
            <p className='opacity-65 group-hover:opacity-100 transition-opacity duration-300 ease-in-out'>
              →
            </p>
            <ScrambleLink
              target='_blank'
              href='https://www.instagram.com/malik.code'
            >
              INSTAGRAM
            </ScrambleLink>
          </div>
          <div className='group flex gap-1'>
            <p className='opacity-65 group-hover:opacity-100 transition-opacity duration-300 ease-in-out'>
              →
            </p>
            <ScrambleLink
              target='_blank'
              href='https://www.linkedin.com/in/malik-kotb/'
            >
              LINKEDIN
            </ScrambleLink>
          </div>
        </div>
        <div className='flex flex-col'>
          <ScrambleLink href='mailto:hello@malikkotb.com'>
            {/* TODO: change this to: hello@malikotb.com WITH ONLY ON "K" */}
            HELLO@MALIKKOTB.COM
          </ScrambleLink>
        </div>
      </div>
    </div>
  );
}
