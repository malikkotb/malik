import React from "react";
import FlipLink from "./FlipLink";

export default function Header() {
  return (
    <div className="borderr flex text-xs justify-between w-full fixed p-4">
      <h1>MALIK KOTB</h1>
      <nav className="flex gap-2">
        <FlipLink href="/blog">BLOG</FlipLink>
        <FlipLink href="/blog">SERVICES</FlipLink>
        <FlipLink href="/blog">WORKS</FlipLink>
        <FlipLink href="/blog">CONTACT</FlipLink>
      </nav>
    </div>
  );
}
