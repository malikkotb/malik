'use client';

import { useState, useCallback } from 'react';

export default function DebugUI({ values, onChange }) {
  const [collapsed, setCollapsed] = useState(false);

  const Slider = ({ label, name, min, max, step, value }) => (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <label style={{ fontSize: 11, color: '#fff' }}>{label}</label>
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
          background: '#fff',
          borderRadius: 0,
          cursor: 'pointer',
        }}
      />
    </div>
  );

  const NumberInput = ({ label, name, min, max, step, value }) => (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ fontSize: 11, color: '#fff' }}>{label}</label>
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
            background: '#000',
            border: '1px solid #fff',
            borderRadius: 0,
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
        bottom: 16,
        left: 16,
        width: collapsed ? 'auto' : 240,
        background: '#000',
        borderRadius: 0,
        padding: collapsed ? 8 : 12,
        fontFamily: 'system-ui, sans-serif',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: collapsed ? 0 : 12,
          cursor: 'pointer',
        }}
        onClick={() => setCollapsed(!collapsed)}
      >
        <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>
          {collapsed ? '▶' : '▼'} Debug
        </span>
      </div>

      {!collapsed && (
        <>
          <div style={{ fontSize: 10, color: '#fff', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
            Grid Layout
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
        </>
      )}
    </div>
  );
}
