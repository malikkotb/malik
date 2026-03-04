"use client";

import { useState, useCallback } from "react";
import AsciiArt from "./AsciiArt";
import DebugPanel from "./DebugPanel";
import { CFG } from "./constants";

export default function HuskyArtCanvas() {
  const [config, setConfig] = useState(CFG);

  const handleChange = useCallback((key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <>
      <div
        style={{
          width: "100vw",
          height: "100vh",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
          boxSizing: "border-box",
        }}
      >
        <div style={{ width: "100%", maxWidth: 800, height: "80vh" }}>
          <AsciiArt
            imageSrc="/demos/fish.png"
            color="#000"
            config={config}
          />
        </div>
        <DebugPanel config={config} onChange={handleChange} />
      </div>

      <div
        style={{
          width: "100vw",
          height: "100vh",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxSizing: "border-box",
        }}
      >
        <img
          src="/demos/fish.png"
          alt="Fish"
          style={{
            maxWidth: "80%",
            maxHeight: "80%",
            objectFit: "contain",
          }}
        />
      </div>
    </>
  );
}
