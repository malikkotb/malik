import React from "react";
import FlipLink from "./FlipLink";

export default function StickyFooter() {
  return (
    <div className="flex flex-col section-padding w-full text-sm">
      <div className="w-full flex gap-2">
        <div className="w-[50%] border-b border-black">Menu</div>
        <div className="w-[25%] border-b border-black">Socials</div>
        <div className="w-[25%] border-b border-black">Resources</div>
      </div>
      <div className="w-full flex gap-2">
        <div className="w-[50%]">
          <ul className="mt-2 space-y-1">
            {["Home", "Projects", "About", "Contact", "GitHub"].map((link) => (
              <li key={link} className="flex h-fit w-fit">
                <FlipLink href="/">{link}</FlipLink>
              </li>
            ))}
          </ul>
        </div>
        <div className="w-[50%] lg:w-[25%]">
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
        <div className="w-full lg:w-[25%]">
          <ul className="mt-2 space-y-1">
            {["Blog", "Figma Templates", "GitHub"].map((link) => (
              <li key={link} className="flex h-fit w-fit">
                <FlipLink href="/">{link}</FlipLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex w-full text-5xl">LET'S MAKE IT HAPPEN</div>
    </div>
  );
}
