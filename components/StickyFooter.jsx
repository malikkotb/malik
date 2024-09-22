"use client";
import Clock from "react-live-clock";
import FlipLink from "./FlipLink";
import ScrollTopButton from "./ScrollTopButton";

export default function StickyFooter() {
  {
    /* <div
        className="relative h-[800px]"
        style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
      >
        <div className="fixed bottom-0 h-[800px] w-full">
          <Content />
        </div>
      </div> */
  }

  return (
    <div
      className="relative h-[45vh] md:h-[35vh]"
      style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
    >
      {/* height of parent div and child div needs to be the same */}
      <div className="text-white containerFooter section-padding fixed text-sm bottom-0 md:h-[35vh] h-[45vh] w-full">
        <div className="columnFooter mr-4">
          <h1 className="w-full border-b pb-1 font-bold">Menu</h1>
          <ul className="mt-2 space-y-1">
            {["Home", "Projects", "About", "Contact", "GitHub"].map((link) => (
              <li key={link} className="flex h-fit w-fit">
                <FlipLink href="/">{link}</FlipLink>
              </li>
            ))}
          </ul>
        </div>
        <div className="columnFooter mr-0 md:mr-4">
          <h1 className="w-full border-b pb-1 font-bold">Socials</h1>
          <ul className="mt-2 space-y-1">
            {["LinkedIn", "Instagram", "TikTok", "YouTube", "GitHub"].map(
              (link) => (
                <li key={link} className="flex h-fit w-fit">
                  <FlipLink href="/">{link}</FlipLink>
                </li>
              )
            )}
          </ul>
        </div>
        <div className="columnFooter mt-4 md:mt-0">
          <h1 className="w-full border-b pb-1 font-bold">Resources</h1>
          <ul className="mt-2 space-y-1">
            {["Blog", "Figma Templates", "GitHub"].map((link) => (
              <li key={link} className="flex h-fit w-fit">
                <FlipLink href="/">{link}</FlipLink>
              </li>
            ))}
          </ul>
        </div>
        {/* TODO: .roboto-mono {
            font-family: 'Roboto Mono', monospace;
      } */}
        <h1 className="items-end flex font-bold uppercase">Malik Kotb</h1>
        <h1 className="items-end flex justify-end md:justify-start pr-4 md:pr-0 text-left cursor-default">
          <div className="flex flex-col">
            <span className="font-bold ">LOCAL TIME</span>
            <span>
              <Clock format={"h:mm A"} />, PAR
            </span>
          </div>
        </h1>
        <h1 className="items-end hidden md:flex justify-end">
          <ScrollTopButton />
        </h1>
      </div>
    </div>
  );
}
