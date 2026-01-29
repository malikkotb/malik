"use client";
import * as React from "react";
import { useRouter, usePathname } from "next/navigation";

const frameworks = [
  { value: "animated-counter", label: "Animated Counter" },
  { value: "horizontal-section", label: "Horizontal Section" },
  { value: "mouse-image-distorter", label: "Mouse Image Distorter" },
  { value: "cursor-blend", label: "Cursor Blend" },
  { value: "bulge-distortion-shader", label: "Bulge Distortion Shader" },
  { value: "flashlight-gradient", label: "Flashlight Gradient" },
  { value: "particle-distorter", label: "Particle Distorter" },
  { value: "threedwave", label: "3D Wave on Scroll" },
  { value: "3d-image-universe", label: "3D Image Universe" },
  { value: "3d-video-throwback", label: "3D Video Throwback" },
  { value: "tile-hover-distortion", label: "Tile Hover Distortion" },
  { value: "gradient-shader", label: "Gradient Shader" },
  { value: "ripple-shader", label: "Ripple Shader" },
  { value: "particle-morphing-canvas", label: "Particle Morphing Canvas" },
  { value: "svgMaskScroll", label: "SVG Mask Scroll" },
  { value: "textScrolly", label: "Text Scrolly" },
  { value: "imageTrailEffect", label: "Image Trail Effect" },
  { value: "pixelated-infinite-scroll", label: "Pixelated Infinite Scroll" },
];

export function Combobox({ setProject }) {
  const router = useRouter();
  const pathname = usePathname();

  // Get current project from URL path (after /demos/)
  const currentProject = pathname?.split("/")[2] || "";

  const handleChange = (e) => {
    const selectedValue = e.target.value;
    if (selectedValue) {
      router.push("/demos/" + selectedValue);
    }
  };

  return (
    <select
      value={currentProject}
      onChange={handleChange}
      className="bg-transparent border-none uppercase outline-none cursor-pointer text-[12px] w-[140px] min-w-0"
    >
      <option value="">Experiments [{frameworks.length}]</option>
      {frameworks.map((framework) => (
        <option key={framework.value} value={framework.value}>
          {framework.label}
        </option>
      ))}
    </select>
  );
}
