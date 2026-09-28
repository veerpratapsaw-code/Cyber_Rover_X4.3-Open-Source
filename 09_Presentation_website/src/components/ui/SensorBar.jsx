import React from 'react';

export default function SensorBar({
  label,
  code,
  value,
  unit,
  min = 0,
  max = 1000,
  warnThreshold = 300,
  dangerThreshold = 600,
  description,
  targetGases
}) {
  const percent = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  let status = 'nominal';
  let barColor = 'var(--accent-cyan)';
  let glowColor = 'rgba(0, 217, 255, 0.3)';

  if (value >= dangerThreshold) {
    status = 'hazard';
    barColor = 'var(--status-hazard)';
    glowColor = 'rgba(255, 77, 77, 0.5)';
  } else if (value >= warnThreshold) {
    status = 'warning';
    barColor = 'var(--status-warning)';
    glowColor = 'rgba(255, 176, 32, 0.4)';
  }

  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-sm)',
      padding: 'var(--space-4)',
      marginBottom: 'var(--space-3)',
      transition: 'border-color 0.2s ease'
    }}>
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
        <div>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--accent-cyan)',
            padding: '2px 6px',
            background: 'rgba(0, 217, 255, 0.1)',
            borderRadius: 'var(--radius-xs)',
            marginRight: '8px'
          }}>
            {code}
          </span>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
            {label}
          </span>
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700, color: barColor }}>
          {value} <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{unit}</span>
        </div>
      </div>

      {/* Bar Track */}
      <div style={{
        height: '6px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '3px',
        overflow: 'hidden',
        position: 'relative',
        marginBottom: '8px'
      }}>
        <div style={{
          height: '100%',
          width: `${percent}%`,
          background: barColor,
          borderRadius: '3px',
          boxShadow: `0 0 10px ${glowColor}`,
          transition: 'width 0.6s var(--ease-out-expo), background-color 0.3s ease'
        }} />
      </div>

      {/* Footer Subtext */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <div>{description}</div>
        {targetGases && (
          <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
            DETECTS: {targetGases}
          </div>
        )}
      </div>
    </div>
  );
}
