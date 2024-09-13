import React from "react";
import FlipLink from "./FlipLink";

export default function StickyFooter() {
  return (
    <div className="section-padding">
      <div className="w-full container text-sm">
        <div className="column">
          <h1 className="w-full border-b pb-1 border-black">Menu</h1>
          <ul className="mt-2 space-y-1">
            {["Home", "Projects", "About", "Contact", "GitHub"].map((link) => (
              <li key={link} className="flex h-fit w-fit">
                <FlipLink href="/">{link}</FlipLink>
              </li>
            ))}
          </ul>
        </div>
        <div className="column">
          <h1 className="w-full border-b pb-1 border-black">Socials</h1>
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
        <div className="column">
          <h1 className="w-full border-b pb-1 border-black">Resources</h1>
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
