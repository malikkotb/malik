"use client";

const SLIDERS = [
  { key: "fontSize", label: "Font Size", min: 4, max: 20, step: 1 },
  { key: "density", label: "Density", min: 1, max: 28, step: 1 },
  { key: "brightness", label: "Brightness", min: -100, max: 100, step: 1 },
  { key: "contrast", label: "Contrast", min: -100, max: 100, step: 1 },
  { key: "alphaThresh", label: "Alpha Threshold", min: 0, max: 255, step: 1 },
  { key: "cursorRadius", label: "Cursor Radius", min: 20, max: 400, step: 5 },
  { key: "cursorForce", label: "Cursor Force", min: 0.5, max: 15, step: 0.5 },
  { key: "returnSpeed", label: "Return Speed", min: 1, max: 20, step: 1 },
  { key: "friction", label: "Friction", min: 50, max: 99, step: 1 },
  { key: "scrollForce", label: "Scroll Force", min: 1, max: 80, step: 1 },
  { key: "scrollDecay", label: "Scroll Decay", min: 50, max: 99, step: 1 },
  { key: "scrollMult", label: "Scroll Mult", min: 1, max: 10, step: 1 },
];

export default function DebugPanel({ config, onChange }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        left: 16,
        zIndex: 9999,
        background: "rgba(0,0,0,0.88)",
        color: "#fff",
        padding: "14px 18px",
        borderRadius: 12,
        fontSize: 12,
        fontFamily: "monospace",
        maxHeight: "70vh",
        overflowY: "auto",
        minWidth: 240,
        backdropFilter: "blur(8px)",
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 13 }}>
        Debug Panel
      </div>

      {/* Invert toggle */}
      <div style={{ marginBottom: 12 }}>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={config.invert}
            onChange={(e) => onChange("invert", e.target.checked)}
          />
          <span style={{ opacity: 0.7 }}>Invert</span>
        </label>
      </div>

      {/* Sliders */}
      {SLIDERS.map(({ key, label, min, max, step }) => (
        <div key={key} style={{ marginBottom: 8 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              opacity: 0.7,
              marginBottom: 2,
            }}
          >
            <span>{label}</span>
            <span>{config[key]}</span>
          </div>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={config[key]}
            onChange={(e) => onChange(key, parseFloat(e.target.value))}
            style={{ width: "100%", accentColor: "#888" }}
          />
        </div>
      ))}
    </div>
  );
}
