import React, { useState } from 'react';
import { Camera, Eye, Zap, ZoomIn, ZoomOut, Sun, ShieldCheck, Sparkles, RefreshCw, Smartphone } from 'lucide-react';

export default function VisionHUD({ turretImage }) {
  const [streamMode, setStreamMode] = useState('fpv_1080p'); // 'fpv_1080p' | 'torch' | 'telephoto'
  const [zoomLevel, setZoomLevel] = useState(1.0); // 1.0x to 5.0x
  const [torchActive, setTorchActive] = useState(false);
  const [exposure, setExposure] = useState(0); // -2 to +2 EV
  const [snapFlash, setSnapFlash] = useState(false);

  const handleCapture = () => {
    setSnapFlash(true);
    setTimeout(() => setSnapFlash(false), 300);
  };

  return (
    <div className="tech-card reticle-box" style={{ background: 'var(--bg-surface)', padding: 'var(--space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-cyan)', letterSpacing: '0.1em' }}>
            <Smartphone size={14} />
            <span>PRIMARY OPTICAL FEED // SMARTPHONE OPERATOR VISUALS</span>
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Chassis-Mounted Smartphone Camera & Live FPV
          </div>
        </div>

        {/* Stream Profile Selector */}
        <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-elevated)', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => { setStreamMode('fpv_1080p'); setZoomLevel(1.0); }}
            style={{
              padding: '4px 10px',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              cursor: 'pointer',
              background: streamMode === 'fpv_1080p' ? 'var(--accent-cyan)' : 'transparent',
              color: streamMode === 'fpv_1080p' ? 'var(--text-inverse)' : 'var(--text-secondary)',
              fontWeight: 600
            }}
          >
            1080P FPV
          </button>
          <button
            onClick={() => {
              setStreamMode('torch');
              setTorchActive(!torchActive);
            }}
            style={{
              padding: '4px 10px',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              cursor: 'pointer',
              background: streamMode === 'torch' || torchActive ? 'var(--accent-cyan)' : 'transparent',
              color: streamMode === 'torch' || torchActive ? 'var(--text-inverse)' : 'var(--text-secondary)',
              fontWeight: 600
            }}
          >
            TORCH {torchActive ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => { setStreamMode('telephoto'); setZoomLevel(2.5); }}
            style={{
              padding: '4px 10px',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              cursor: 'pointer',
              background: streamMode === 'telephoto' ? 'var(--accent-cyan)' : 'transparent',
              color: streamMode === 'telephoto' ? 'var(--text-inverse)' : 'var(--text-secondary)',
              fontWeight: 600
            }}
          >
            2.5X ZOOM
          </button>
        </div>
      </div>

      {/* Viewfinder Container */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: 'clamp(240px, 40vh, 360px)',
        background: '#040608',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        border: '1px solid var(--border-medium)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Background Stream Image with Zoom & Exposure & Torch */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${turretImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: `${torchActive ? 'brightness(1.25) contrast(1.15)' : 'brightness(0.95) contrast(1.08)'} brightness(${1 + exposure * 0.15})`,
          transform: `scale(${zoomLevel})`,
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), filter 0.3s ease'
        }} />

        {/* Torch Flashlight Radial Beam (when active) */}
        {torchActive && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 230, 0.28) 0%, rgba(255, 255, 255, 0.08) 50%, transparent 80%)',
            pointerEvents: 'none',
            mixBlendMode: 'screen'
          }} />
        )}

        {/* Shutter Flash Animation */}
        {snapFlash && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: '#ffffff',
            zIndex: 10,
            animation: 'fadeOut 0.3s ease forwards'
          }} />
        )}

        {/* Optical Rule-of-Thirds Grid */}
        <div style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gridTemplateRows: '1fr 1fr 1fr',
          opacity: 0.18
        }}>
          <div style={{ borderRight: '1px solid var(--accent-cyan)', borderBottom: '1px solid var(--accent-cyan)' }} />
          <div style={{ borderRight: '1px solid var(--accent-cyan)', borderBottom: '1px solid var(--accent-cyan)' }} />
          <div style={{ borderBottom: '1px solid var(--accent-cyan)' }} />
          <div style={{ borderRight: '1px solid var(--accent-cyan)', borderBottom: '1px solid var(--accent-cyan)' }} />
          <div style={{ borderRight: '1px solid var(--accent-cyan)', borderBottom: '1px solid var(--accent-cyan)' }} />
          <div style={{ borderBottom: '1px solid var(--accent-cyan)' }} />
          <div style={{ borderRight: '1px solid var(--accent-cyan)' }} />
          <div style={{ borderRight: '1px solid var(--accent-cyan)' }} />
          <div />
        </div>

        {/* Tactical Viewfinder Overlay HUD */}
        <div style={{ position: 'absolute', inset: 'clamp(8px, 2vw, 16px)', pointerEvents: 'none', border: '1px solid rgba(0, 217, 255, 0.15)' }}>
          {/* Corner Brackets */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '14px', height: '14px', borderTop: '2px solid var(--accent-cyan)', borderLeft: '2px solid var(--accent-cyan)' }} />
          <div style={{ position: 'absolute', top: 0, right: 0, width: '14px', height: '14px', borderTop: '2px solid var(--accent-cyan)', borderRight: '2px solid var(--accent-cyan)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '14px', height: '14px', borderBottom: '2px solid var(--accent-cyan)', borderLeft: '2px solid var(--accent-cyan)' }} />
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: '14px', height: '14px', borderBottom: '2px solid var(--accent-cyan)', borderRight: '2px solid var(--accent-cyan)' }} />

          {/* Central Precision Crosshair */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '32px',
            height: '32px',
            opacity: 0.8
          }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'var(--accent-cyan)' }} />
            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'var(--accent-cyan)' }} />
            <div style={{ position: 'absolute', inset: '8px', border: '1px solid var(--accent-cyan)', borderRadius: '50%' }} />
          </div>

          {/* Top Status Bar */}
          <div style={{ position: 'absolute', top: '8px', left: '10px', right: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 'clamp(0.5625rem, 1.6vw, 0.6875rem)' }}>
            <span style={{ color: 'var(--status-hazard)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="animate-blink" style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--status-hazard)' }} />
              LIVE [SMARTPHONE FPV // OPERATOR FEED]
            </span>
            <span style={{ color: 'var(--accent-cyan)', display: 'flex', gap: '8px' }}>
              <span>ZOOM {zoomLevel.toFixed(1)}x</span>
              <span>•</span>
              <span>WIDE ANGLE</span>
              <span>•</span>
              <span style={{ color: 'var(--status-nominal)' }}>EIS ACTIVE</span>
            </span>
          </div>

          {/* Bottom Telemetry Bar */}
          <div style={{ position: 'absolute', bottom: '8px', left: '10px', right: '10px', display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 'clamp(0.5rem, 1.4vw, 0.625rem)', color: 'var(--text-muted)' }}>
            <span>SOURCE: MOBILE OPTICS ENGINE</span>
            <span>TRANSMISSION: LOCAL WI-FI FPV STREAM</span>
          </div>
        </div>
      </div>

      {/* Interactive Smartphone Camera Optical Controls */}
      <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(0.6875rem, 1.8vw, 0.75rem)', color: 'var(--accent-cyan)', fontWeight: 600 }}>
            SMARTPHONE CAMERA OPTICAL CONTROLS:
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setTorchActive(!torchActive)}
              style={{
                padding: '3px 10px',
                background: torchActive ? 'rgba(0, 217, 255, 0.2)' : 'transparent',
                border: `1px solid ${torchActive ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                color: torchActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                borderRadius: 'var(--radius-xs)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Sun size={12} />
              <span>{torchActive ? 'TORCH ON' : 'TORCH OFF'}</span>
            </button>
            <button
              onClick={handleCapture}
              style={{
                padding: '3px 10px',
                background: 'rgba(57, 229, 140, 0.15)',
                border: '1px solid var(--status-nominal)',
                color: 'var(--status-nominal)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                borderRadius: 'var(--radius-xs)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Camera size={12} />
              <span>CAPTURE STILL</span>
            </button>
          </div>
        </div>

        {/* Zoom & Exposure Range Sliders */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              <span>Digital Telephoto Magnification</span>
              <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{zoomLevel.toFixed(1)}x</span>
            </div>
            <input
              type="range" min="1.0" max="5.0" step="0.1" value={zoomLevel}
              onChange={e => setZoomLevel(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '2px' }}>
              <span onClick={() => setZoomLevel(1.0)} style={{ cursor: 'pointer' }}>1.0x (Wide)</span>
              <span onClick={() => setZoomLevel(2.0)} style={{ cursor: 'pointer' }}>2.0x</span>
              <span onClick={() => setZoomLevel(3.5)} style={{ cursor: 'pointer' }}>3.5x</span>
              <span onClick={() => setZoomLevel(5.0)} style={{ cursor: 'pointer' }}>5.0x (Max)</span>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              <span>Optical Exposure Bias (EV)</span>
              <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{exposure > 0 ? `+${exposure}` : exposure} EV</span>
            </div>
            <input
              type="range" min="-2" max="2" step="1" value={exposure}
              onChange={e => setExposure(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '2px' }}>
              <span onClick={() => setExposure(-2)} style={{ cursor: 'pointer' }}>-2 EV (Dark)</span>
              <span onClick={() => setExposure(0)} style={{ cursor: 'pointer' }}>0 (Balanced)</span>
              <span onClick={() => setExposure(2)} style={{ cursor: 'pointer' }}>+2 EV (High Gain)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
