import React, { useState } from 'react';
import { Compass, AlertTriangle, ShieldCheck, ArrowRight, ArrowLeft, ArrowUp } from 'lucide-react';

export default function SonarRadar({ liveDistances }) {
  const [interactiveMode, setInteractiveMode] = useState(false);
  const [customDistances, setCustomDistances] = useState({
    left: 140,
    center: 85,
    right: 170
  });

  const distances = interactiveMode ? customDistances : {
    left: liveDistances?.ultrasonicLeft || 140,
    center: liveDistances?.ultrasonicCenter || 85,
    right: liveDistances?.ultrasonicRight || 170
  };

  // Sensor-assisted navigation guidance calculation
  let decision = {
    action: 'FORWARD // CLEAR TRACTION',
    icon: ArrowUp,
    status: 'nominal',
    reason: 'Forward path unobstructed (> 40cm clearance)',
    leftPwm: 220,
    rightPwm: 220
  };

  if (distances.center < 30) {
    if (distances.left > distances.right) {
      decision = {
        action: 'EVASIVE TURN // HARD LEFT',
        icon: ArrowLeft,
        status: 'hazard',
        reason: `Front blocked (${distances.center}cm) — Left clearance optimal (${distances.left}cm)`,
        leftPwm: -180,
        rightPwm: 200
      };
    } else {
      decision = {
        action: 'EVASIVE TURN // HARD RIGHT',
        icon: ArrowRight,
        status: 'hazard',
        reason: `Front blocked (${distances.center}cm) — Right clearance optimal (${distances.right}cm)`,
        leftPwm: 200,
        rightPwm: -180
      };
    }
  } else if (distances.left < 30) {
    decision = {
      action: 'CORRECTION // VEER RIGHT',
      icon: ArrowRight,
      status: 'warning',
      reason: `Left perimeter intrusion (${distances.left}cm) — applying differential bias`,
      leftPwm: 210,
      rightPwm: 140
    };
  } else if (distances.right < 30) {
    decision = {
      action: 'CORRECTION // VEER LEFT',
      icon: ArrowLeft,
      status: 'warning',
      reason: `Right perimeter intrusion (${distances.right}cm) — applying differential bias`,
      leftPwm: 140,
      rightPwm: 210
    };
  }

  const getBeamColor = (dist) => {
    if (dist < 30) return 'var(--status-hazard)';
    if (dist < 60) return 'var(--status-warning)';
    return 'var(--accent-cyan)';
  };

  return (
    <div className="tech-card reticle-box" style={{ background: 'var(--bg-surface)', padding: 'var(--space-6)' }}>
      {/* Header telemetry */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-cyan)', letterSpacing: '0.1em' }}>
            RADAR TELEMETRY // 3x HC-SR04
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Acoustic Obstacle Avoidance Loop
          </div>
        </div>

        <button
          onClick={() => setInteractiveMode(!interactiveMode)}
          style={{
            padding: '6px 14px',
            background: interactiveMode ? 'var(--accent-cyan)' : 'var(--bg-elevated)',
            color: interactiveMode ? 'var(--text-inverse)' : 'var(--text-secondary)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {interactiveMode ? '● INTERACTIVE SIM' : '▶ SYNC LIVE FEED'}
        </button>
      </div>

      {/* Radar SVG Visualizer */}
      <div style={{ position: 'relative', width: '100%', height: 'clamp(210px, 32vh, 280px)', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'radial-gradient(circle at 50% 90%, rgba(0, 217, 255, 0.08), transparent 70%)', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
        <svg viewBox="-200 -200 400 240" style={{ width: '100%', height: '100%', maxWidth: '480px' }}>
          {/* Radar background grid arcs */}
          <circle cx="0" cy="0" r="60" fill="none" stroke="var(--border-subtle)" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="0" cy="0" r="120" fill="none" stroke="var(--border-subtle)" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="0" cy="0" r="180" fill="none" stroke="var(--border-subtle)" strokeWidth="1" />
          
          {/* Angle reference axes */}
          <line x1="0" y1="0" x2="-130" y2="-130" stroke="var(--border-subtle)" strokeWidth="1" />
          <line x1="0" y1="0" x2="0" y2="-185" stroke="var(--border-subtle)" strokeWidth="1" />
          <line x1="0" y1="0" x2="130" y2="-130" stroke="var(--border-subtle)" strokeWidth="1" />

          {/* Left Sensor Beam (-45 deg) */}
          <path
            d={`M 0 0 L ${-Math.sin(Math.PI / 4) * Math.min(180, distances.left * 0.8)} ${-Math.cos(Math.PI / 4) * Math.min(180, distances.left * 0.8)}`}
            stroke={getBeamColor(distances.left)}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle
            cx={-Math.sin(Math.PI / 4) * Math.min(180, distances.left * 0.8)}
            cy={-Math.cos(Math.PI / 4) * Math.min(180, distances.left * 0.8)}
            r="6"
            fill={getBeamColor(distances.left)}
            style={{ filter: `drop-shadow(0 0 8px ${getBeamColor(distances.left)})` }}
          />

          {/* Center Sensor Beam (0 deg) */}
          <path
            d={`M 0 0 L 0 ${-Math.min(180, distances.center * 0.8)}`}
            stroke={getBeamColor(distances.center)}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle
            cx="0"
            cy={-Math.min(180, distances.center * 0.8)}
            r="6"
            fill={getBeamColor(distances.center)}
            style={{ filter: `drop-shadow(0 0 8px ${getBeamColor(distances.center)})` }}
          />

          {/* Right Sensor Beam (+45 deg) */}
          <path
            d={`M 0 0 L ${Math.sin(Math.PI / 4) * Math.min(180, distances.right * 0.8)} ${-Math.cos(Math.PI / 4) * Math.min(180, distances.right * 0.8)}`}
            stroke={getBeamColor(distances.right)}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle
            cx={Math.sin(Math.PI / 4) * Math.min(180, distances.right * 0.8)}
            cy={-Math.cos(Math.PI / 4) * Math.min(180, distances.right * 0.8)}
            r="6"
            fill={getBeamColor(distances.right)}
            style={{ filter: `drop-shadow(0 0 8px ${getBeamColor(distances.right)})` }}
          />

          {/* Rover Chassis Anchor Point */}
          <rect x="-24" y="-12" width="48" height="24" rx="4" fill="var(--bg-elevated)" stroke="var(--accent-cyan)" strokeWidth="1.5" />
          <circle cx="0" cy="0" r="3" fill="var(--accent-cyan)" />
          <text x="0" y="4" textAnchor="middle" fill="var(--text-primary)" fontSize="8" fontFamily="var(--font-mono)" fontWeight="700">CR-X</text>
        </svg>

        {/* HUD Sector Overlays */}
        <div style={{ position: 'absolute', top: 10, left: 12, fontFamily: 'var(--font-mono)', fontSize: 'clamp(0.5625rem, 1.8vw, 0.75rem)' }}>
          <div style={{ color: 'var(--text-muted)' }}>L (-45°)</div>
          <div style={{ color: getBeamColor(distances.left), fontWeight: 700, fontSize: 'clamp(0.8125rem, 2.2vw, 1rem)' }}>{distances.left} cm</div>
        </div>

        <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 'clamp(0.5625rem, 1.8vw, 0.75rem)' }}>
          <div style={{ color: 'var(--text-muted)' }}>CTR (0°)</div>
          <div style={{ color: getBeamColor(distances.center), fontWeight: 700, fontSize: 'clamp(0.875rem, 2.5vw, 1.1rem)' }}>{distances.center} cm</div>
        </div>

        <div style={{ position: 'absolute', top: 10, right: 12, textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 'clamp(0.5625rem, 1.8vw, 0.75rem)' }}>
          <div style={{ color: 'var(--text-muted)' }}>R (+45°)</div>
          <div style={{ color: getBeamColor(distances.right), fontWeight: 700, fontSize: 'clamp(0.8125rem, 2.2vw, 1rem)' }}>{distances.right} cm</div>
        </div>
      </div>

      {/* Interactive Sliders (if interactive mode is on) */}
      {interactiveMode && (
        <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-cyan)', marginBottom: '8px' }}>
            SIMULATE OBSTACLE DISTANCE (SLIDE TO TEST ARBITRATION):
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>Left: {customDistances.left}cm</label>
              <input
                type="range" min="10" max="250" value={customDistances.left}
                onChange={e => setCustomDistances({ ...customDistances, left: Number(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>Center: {customDistances.center}cm</label>
              <input
                type="range" min="10" max="250" value={customDistances.center}
                onChange={e => setCustomDistances({ ...customDistances, center: Number(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>Right: {customDistances.right}cm</label>
              <input
                type="range" min="10" max="250" value={customDistances.right}
                onChange={e => setCustomDistances({ ...customDistances, right: Number(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Sensor-Assisted Navigation Guidance Display */}
      <div style={{
        marginTop: 'var(--space-4)',
        padding: 'var(--space-4)',
        background: decision.status === 'hazard' ? 'var(--status-hazard-dim)' : 'var(--bg-elevated)',
        border: `1px solid ${decision.status === 'hazard' ? 'var(--status-hazard)' : 'var(--border-subtle)'}`,
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            padding: '8px',
            borderRadius: '50%',
            background: decision.status === 'hazard' ? 'var(--status-hazard)' : 'var(--accent-cyan)',
            color: 'var(--text-inverse)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <decision.icon size={20} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              MOTOR CONTROLLER DIRECTIVE // DUAL BTS7960 HIGH-CURRENT DRIVERS
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {decision.action}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {decision.reason}
            </div>
          </div>
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textAlign: 'right', color: 'var(--text-muted)' }}>
          <div>PWM L: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{decision.leftPwm}</span></div>
          <div>PWM R: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{decision.rightPwm}</span></div>
        </div>
      </div>

      {/* Operator Control Precedence Note */}
      <div style={{
        marginTop: '8px',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.625rem',
        color: 'var(--text-muted)',
        textAlign: 'center'
      }}>
        * Note: Operator commands via ESP-NOW maintain primary priority; ultrasonic logic assists with distance telemetry and collision warning.
      </div>
    </div>
  );
}
