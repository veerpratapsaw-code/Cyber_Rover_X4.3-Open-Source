import React from 'react';

export default function TelemetryBadge({ label, value, unit = '', status = 'nominal', icon: Icon }) {
  const getStatusColor = () => {
    switch (status) {
      case 'warning': return 'var(--status-warning)';
      case 'hazard': return 'var(--status-hazard)';
      case 'active': return 'var(--accent-cyan)';
      case 'nominal':
      default: return 'var(--status-nominal)';
    }
  };

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '6px 12px',
      background: 'rgba(18, 24, 32, 0.8)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-sm)',
      fontFamily: 'var(--font-mono)',
      fontSize: '0.8125rem'
    }}>
      <span style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: getStatusColor(),
        boxShadow: `0 0 8px ${getStatusColor()}`
      }} />
      {Icon && <Icon size={14} style={{ color: 'var(--text-secondary)' }} />}
      <span style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>{label}:</span>
      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
        {value} <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{unit}</span>
      </span>
    </div>
  );
}
