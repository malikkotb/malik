import React from "react";
import FlipLink from "./FlipLink";

export default function StickyFooter() {
  return (
    <div
      className="section-padding text-sm relative h-[200px]"
      style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
    >
      {/* <div
        className="relative h-[800px]"
        style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
      >
        <div className="fixed bottom-0 h-[800px] w-full">
          <Content />
        </div>
      </div> */}
      <div className="containerFooter fixed bottom-0 h-[200px] w-full">
        <div className="columnFooter mr-4">
          <h1 className="w-full border-b pb-1 ">Menu</h1>
          <ul className="mt-2 space-y-1">
            {["Home", "Projects", "About", "Contact", "GitHub"].map((link) => (
              <li key={link} className="flex h-fit w-fit">
                <FlipLink href="/">{link}</FlipLink>
              </li>
            ))}
          </ul>
        </div>
        <div className="columnFooter mr-0 md:mr-4">
          <h1 className="w-full border-b pb-1 ">Socials</h1>
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
          <h1 className="w-full border-b pb-1 ">Resources</h1>
          <ul className="mt-2 space-y-1">
            {["Blog", "Figma Templates", "GitHub"].map((link) => (
              <li key={link} className="flex h-fit w-fit">
                <FlipLink href="/">{link}</FlipLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* <div className="flex justify-between">
        <h1 className="text-3xl">Malik Kotb</h1>
        <h2>All rights reserved. ©</h2>
      </div> */}
    </div>
  );
}
