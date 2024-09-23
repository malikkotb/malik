import React from "react";
import FlipLink from "./FlipLink";

export default function Header() {
  return (
    <div
      style={{ fontWeight: "600" }}
      className="z-50 text-white flex text-xs justify-between w-full fixed p-5"
    >
      <h1>MALIK KOTB</h1>
      <div className="flex gap-2">
        <div className="headerLink">
          <FlipLink href="#about">ABOUT</FlipLink>
        </div>
        <div className="headerLink">
          <FlipLink newPage={true} href="https://malikkotb.github.io/blog/">
            BLOG
          </FlipLink>
        </div>
        <div className="headerLink">
          <FlipLink href="#projects">PROJECTS</FlipLink>
        </div>
        <div className="headerLink">
          <FlipLink href="mailto:malikkotb@icloud.com">CONTACT</FlipLink>
        </div>
      </div>
    </div>
  );
}
