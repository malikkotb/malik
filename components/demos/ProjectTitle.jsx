"use client";

import { usePathname } from "next/navigation";

export function ProjectTitle() {
  const pathname = usePathname();

  const projectName =
    pathname
      ?.split("/")[2] // Get the segment after /demos/
      ?.replace(/-/g, " ") // Replace hyphens with spaces
      ?.replace(/\b\w/g, (l) => l.toUpperCase()) || ""; // Capitalize first letter of each word

  return <div className='text-center text-white'>{projectName}</div>;
}
