'use client';

import { useState, useCallback } from 'react';

export default function DebugUI({ values, onChange }) {
  const [collapsed, setCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    const configStr = `{
  curveDepth: ${values.curveDepth.toFixed(2)},
  curveWidth: ${values.curveWidth.toFixed(2)},
  scrollSensitivity: ${values.scrollSensitivity.toFixed(4)},
  smoothing: ${values.smoothing.toFixed(2)},
  gap: ${values.gap.toFixed(3)},
  columns: ${values.columns},
  rows: ${values.rows},
}`;
    navigator.clipboard.writeText(configStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [values]);

  const Slider = ({ label, name, min, max, step, value }) => (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <label style={{ fontSize: 11, color: '#999' }}>{label}</label>
        <span style={{ fontSize: 11, color: '#fff', fontFamily: 'monospace' }}>
          {value.toFixed(step < 0.01 ? 4 : 2)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(name, parseFloat(e.target.value))}
        style={{
          width: '100%',
          height: 4,
          appearance: 'none',
          background: '#333',
          borderRadius: 2,
          cursor: 'pointer',
        }}
      />
    </div>
  );

  const NumberInput = ({ label, name, min, max, step, value }) => (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ fontSize: 11, color: '#999' }}>{label}</label>
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(name, parseInt(e.target.value))}
          style={{
            width: 50,
            padding: '4px 8px',
            fontSize: 11,
            background: '#222',
            border: '1px solid #444',
            borderRadius: 4,
            color: '#fff',
            fontFamily: 'monospace',
          }}
        />
      </div>
    </div>
  );

  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        width: collapsed ? 'auto' : 240,
        background: 'rgba(0, 0, 0, 0.85)',
        borderRadius: 8,
        padding: collapsed ? 8 : 16,
        fontFamily: 'system-ui, sans-serif',
        zIndex: 1000,
        backdropFilter: 'blur(10px)',
        border: '1px solid #333',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: collapsed ? 0 : 16,
          cursor: 'pointer',
        }}
        onClick={() => setCollapsed(!collapsed)}
      >
        <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>
          {collapsed ? '▶' : '▼'} Debug
        </span>
        {!collapsed && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            style={{
              padding: '4px 12px',
              fontSize: 10,
              background: copied ? '#22c55e' : '#3b82f6',
              border: 'none',
              borderRadius: 4,
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'background 0.2s',
            }}
          >
            {copied ? 'Copied!' : 'Copy Values'}
          </button>
        )}
      </div>

      {!collapsed && (
        <>
          <div style={{ fontSize: 10, color: '#666', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
            Curve
          </div>
          <Slider
            label="Curve Depth"
            name="curveDepth"
            min={0}
            max={3}
            step={0.05}
            value={values.curveDepth}
          />
          <Slider
            label="Curve Width"
            name="curveWidth"
            min={0.5}
            max={5}
            step={0.1}
            value={values.curveWidth}
          />

          <div style={{ fontSize: 10, color: '#666', marginBottom: 12, marginTop: 20, textTransform: 'uppercase', letterSpacing: 1 }}>
            Scroll
          </div>
          <Slider
            label="Sensitivity"
            name="scrollSensitivity"
            min={0.0005}
            max={0.005}
            step={0.0001}
            value={values.scrollSensitivity}
          />
          <Slider
            label="Smoothing"
            name="smoothing"
            min={0.01}
            max={0.3}
            step={0.01}
            value={values.smoothing}
          />

          <div style={{ fontSize: 10, color: '#666', marginBottom: 12, marginTop: 20, textTransform: 'uppercase', letterSpacing: 1 }}>
            Grid
          </div>
          <NumberInput
            label="Columns"
            name="columns"
            min={1}
            max={8}
            step={1}
            value={values.columns}
          />
          <NumberInput
            label="Rows"
            name="rows"
            min={1}
            max={8}
            step={1}
            value={values.rows}
          />
          <Slider
            label="Gap"
            name="gap"
            min={0}
            max={0.2}
            step={0.005}
            value={values.gap}
          />
        </>
      )}
    </div>
  );
}
