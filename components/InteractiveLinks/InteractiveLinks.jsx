"use client";

import ScrambleText from "../ScrambleText";

const links = [
  { label: "EMAIL", value: "hello@malikkotb.com", href: "mailto:hello@malikkotb.com" },
  { label: "LINKEDIN", value: "MALIK-KOTB", href: "https://www.linkedin.com/in/malik-kotb/" },
  { label: "INSTAGRAM", value: "@MALIKKOTBB", href: "https://instagram.com/malikkotbb" },
  { label: "TIKTOK", value: "@MALIKRUNS", href: "https://www.tiktok.com/@malikruns" },
  { label: "GITHUB", value: "@MALIKKOTB", href: "https://github.com/malikkotb" },
];

export default function InteractiveLinks() {
  return (
    <div className="flex flex-col">
      <span className="text-[12px] text-zinc-400 mb-3">Links</span>
      <ul className="flex flex-col text-[12px] uppercase leading-[1.5]">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer hover:opacity-70 transition-opacity"
            >
              <ScrambleText text={link.value} />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
