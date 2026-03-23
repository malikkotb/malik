"use client";

import { useState, useCallback } from "react";
import AsciiArt from "./AsciiArt";
import DebugPanel from "./DebugPanel";
import { CFG } from "./constants";

const IMAGES = [
  "/demos/1.png",
  "/demos/2.png",
  "/demos/3.png",
  "/demos/4.png",
  "/demos/fancy_img4.webp",
  "/demos/6.png",
];

export default function HuskyArtCanvas() {
  const [config, setConfig] = useState(CFG);
  const [imageSrc, setImageSrc] = useState(IMAGES[0]);

  const handleChange = useCallback((key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <>
      <div className="w-full h-full fixed inset-0 flex items-center justify-center py-20 pb-[136px]">
        <AsciiArt
          imageSrc={imageSrc}
          color="#000"
          config={config}
        />
        {/* <DebugPanel config={config} onChange={handleChange} /> */}
      </div>

      {/* Image picker banner */}
      <div className="fixed bottom-0 left-0 w-full flex justify-center gap-3 py-4 bg-white/80 backdrop-blur-sm z-10">
        {IMAGES.map((src) => (
          <img
            key={src}
            src={src}
            alt={src}
            onClick={() => setImageSrc(src)}
            style={{
              height: 100,
              width: 80,
              objectFit: "cover",
              cursor: "pointer",
              outline: imageSrc === src ? "1px solid #000" : "1px solid transparent",
            }}
          />
        ))}
      </div>
    </>
  );
}
