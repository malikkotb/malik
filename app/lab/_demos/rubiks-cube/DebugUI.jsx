'use client';

export default function DebugUI({ values, onChange }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '12px 16px',
        borderRadius: 8,
        fontFamily: 'monospace',
        fontSize: 12,
        color: '#fff',
        zIndex: 1000,
        minWidth: 200,
      }}
    >
      <div style={{ marginBottom: 8, fontWeight: 'bold', color: '#888' }}>
        Debug
      </div>
      {Object.entries(values).map(([key, { value, min, max, step, label }]) => (
        <div key={key} style={{ marginBottom: 8 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 4,
            }}
          >
            <span>{label || key}</span>
            <span style={{ color: '#4af' }}>{value.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(key, parseFloat(e.target.value))}
            style={{
              width: '100%',
              accentColor: '#4af',
            }}
          />
        </div>
      ))}
    </div>
  );
}
