import React from "react";
import FlipLink from "./FlipLink";

export default function Header() {
  return (
    <div style={{ fontWeight: "600"}} className="z-50 text-white flex text-xs justify-between w-full fixed p-5 md:p-4">
      <h1>MALIK KOTB</h1>
      <nav className="flex gap-2">
        <div className="headerLink">
          <FlipLink href="#about">ABOUT</FlipLink>
        </div>
        <div className="headerLink">
          <FlipLink href="#blog">BLOG</FlipLink>
        </div>
        <div className="headerLink">
          <FlipLink href="#projects">WORKS</FlipLink>
        </div>
        <div className="headerLink">
          <FlipLink href="#contact">CONTACT</FlipLink>
        </div>
      </nav>
    </div>
  );
}
