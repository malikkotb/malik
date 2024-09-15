import React from "react";
import FlipLink from "./FlipLink";

export default function Header() {
  return (
    <div className="z-50 flex text-xs justify-between w-full fixed p-4">
      <h1>MALIK KOTB</h1>
      <nav className="flex gap-2">
        <div className="headerLink">
          <FlipLink href="#about">ABOUT</FlipLink>
        </div>
        <div className="headerLink">
          <FlipLink href="/blog">BLOG</FlipLink>
        </div>
        <div className="headerLink">
          <FlipLink href="/blog">WORKS</FlipLink>
        </div>
        <div className="headerLink">
          <FlipLink href="/blog">CONTACT</FlipLink>
        </div>
      </nav>
    </div>
  );
}
