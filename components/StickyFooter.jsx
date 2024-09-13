import React from "react";
import FlipLink from "./FlipLink";

export default function StickyFooter() {
  return (
    <div className="borderr section-padding containerFooter text-sm">
      <div className="columnFooter">
        <h1 className="w-full border-b pb-1 border-black">Menu</h1>
        <ul className="mt-2 space-y-1">
          {["Home", "Projects", "About", "Contact", "GitHub"].map((link) => (
            <li key={link} className="flex h-fit w-fit">
              <FlipLink href="/">{link}</FlipLink>
            </li>
          ))}
        </ul>
      </div>
      <div className="columnFooter">
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
      <div className="columnFooter">
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
  );
}
