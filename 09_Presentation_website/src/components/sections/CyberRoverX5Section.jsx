import React, { useState } from 'react';
import { ShieldAlert, Cpu, ArrowUpRight, Compass, Layers, Radio, Waves, ShieldCheck, Flame, Droplets, Anchor } from 'lucide-react';
import x5DesignImg from '../../assets/cyberrover_x5_final.jpg';

const COMPARISON_DATA = [
  {
    feature: 'Operational Purpose',
    x4: 'Rapid Reconnaissance Proof-of-Concept Prototype',
    x5: 'Heavy-Duty Industrial Deep-Mine Disaster Recon Platform'
  },
  {
    feature: 'Chassis & Mobility',
    x4: '4WD High-Torque Geared DC Motors (Skid Steer)',
    x5: 'Reinforced Continuous Crawler Tracks (Heavy Mud, Rubble & Water)'
  },
  {
    feature: 'Motor Drivers',
    x4: 'Dual BTS7960 43A High-Current MOSFET H-Bridges',
    x5: 'Dual 60A Hermetically Encapsulated BLDC Motor Controllers'
  },
  {
    feature: 'Explosion Proofing',
    x4: 'Enclosed Prototype Pod (Indoor/Lab Hazard Testing)',
    x5: 'ATEX Zone 0 Explosion-Proof Nitrogen-Purged 5 ATM Hull'
  },
  {
    feature: 'Submersible / Water',
    x4: 'Splash-Resistant Sealed Electronics Bay',
    x5: 'IP69K Submersible (3–4m Underwater Walking on Flooded Minebeds)'
  },
  {
    feature: 'Communication Architecture',
    x4: 'Dual-Band: 100Hz ESP-NOW (2.4GHz Drive) + Sub-GHz Reyax RYLR998 LoRa (868/915MHz Telemetry, 1+ km)',
    x5: 'Tri-Mode: 1,000m Armored Fiber-Optic Tether + ELRS 868MHz + 5.8GHz VTX'
  },
  {
    feature: 'Hazard Gas Detection',
    x4: '7-Sensor Suite: MQ-4/7/135, BMP280, DHT11, GPS, V-Divider on Arduino Nano Master + 16x2 LCD',
    x5: 'Hermetically Sealed Internal Sampling Chamber with Micro-Pump'
  },
  {
    feature: 'Vision & Optical Feed',
    x4: 'Smartphone Camera Turret (High-Res Wi-Fi Stream) + Procedural OLED RoboEyes',
    x5: 'FLIR Thermal Radiometric LWIR + 360° Solid-State 3D LiDAR SLAM'
  },
  {
    feature: 'Structural Hull Integrity',
    x4: 'Dual-Deck High-Impact Polymers + Aluminum Alloy Lower Frame',
    x5: 'Marine-Grade 6061-T6 Anodized Aluminum Monocoque (Blast Resistant)'
  }
];

export default function CyberRoverX5Section() {
  const [activeView, setActiveView] = useState('overview'); // 'overview' or 'matrix'

  return (
    <section id="x5-future" className="story-stage" style={{
      background: 'linear-gradient(180deg, var(--bg-base) 0%, #06090e 100%)',
      position: 'relative',
      overflow: 'hidden',
      padding: 'clamp(60px, 10vh, 120px) 0'
    }}>
      {/* Background Monumental Typography */}
      <div style={{
        position: 'absolute',
        top: '4%',
        right: '1%',
        fontFamily: 'var(--font-heading)',
        fontSize: 'clamp(4.5rem, 16vw, 16rem)',
        fontWeight: 900,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        lineHeight: 0.8,
        background: 'linear-gradient(180deg, rgba(22, 119, 255, 0.18) 0%, rgba(0, 217, 255, 0.04) 75%, transparent 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: 0
      }}>
        ROADMAP
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Chapter Header with BLUE FUTURE BADGE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#1677ff', boxShadow: '0 0 10px #1677ff' }} />
          <div className="chapter-number reveal-3d" style={{ color: '#1677ff', margin: 0 }}>
            07 // FUTURE DEVELOPMENT & ROADMAP: CYBERROVER X5
          </div>
        </div>

        <div className="reveal-3d" style={{ maxWidth: '840px', marginBottom: 'var(--space-10)' }}>
          <div style={{
            display: 'inline-block',
            padding: '4px 12px',
            background: 'rgba(22, 119, 255, 0.12)',
            border: '1px solid rgba(22, 119, 255, 0.35)',
            borderRadius: 'var(--radius-xs)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            color: '#1677ff',
            fontWeight: 700,
            marginBottom: '12px'
          }}>
            PROPOSED INDUSTRIAL PLATFORM // FUTURE CONCEPT & ROADMAP
          </div>

          <h2 className="section-headline" style={{ marginBottom: 'var(--space-4)' }}>
            From Prototype Demonstration to Proposed Industrial Platform
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem', lineHeight: 1.7 }}>
            While <strong>CyberRover X4.3</strong> is our student-built, demonstrated working prototype by Veer Pratap Saw, the 
            <strong> CyberRover X5</strong> represents our proposed commercial-scale blueprint and future engineering roadmap: an ATEX-targeted, submersible tracked platform conceptualized for subterranean coal mines and hazardous void exploration.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          <button
            onClick={() => setActiveView('overview')}
            style={{
              padding: '8px 18px',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              background: activeView === 'overview' ? '#ff9500' : 'rgba(255, 255, 255, 0.05)',
              color: activeView === 'overview' ? '#000' : '#fff',
              fontWeight: 700
            }}
          >
            01 // INDUSTRIAL PLATFORM OVERVIEW
          </button>
          <button
            onClick={() => setActiveView('matrix')}
            style={{
              padding: '8px 18px',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              background: activeView === 'matrix' ? '#ff9500' : 'rgba(255, 255, 255, 0.05)',
              color: activeView === 'matrix' ? '#000' : '#fff',
              fontWeight: 700
            }}
          >
            02 // X4.3 VS X5 ENGINEERING MATRIX
          </button>
        </div>

        {activeView === 'overview' ? (
          /* ========================================================= */
          /* VIEW 1: HERO RENDER & 4 KEY PILLARS                      */
          /* ========================================================= */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))', gap: '32px', alignItems: 'center' }}>
            {/* Left: High-Res Blueprint Render */}
            <div style={{
              background: 'linear-gradient(145deg, #0d1219, #07090c)',
              borderRadius: '24px',
              border: '1px solid rgba(255, 149, 0, 0.3)',
              padding: '12px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255, 149, 0, 0.15)',
              position: 'relative'
            }}>
              <img
                src={x5DesignImg}
                alt="CyberRover X5 Industrial Platform Final Design"
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '16px',
                  display: 'block',
                  filter: 'contrast(1.05) brightness(0.95)'
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: '24px',
                left: '24px',
                right: '24px',
                background: 'rgba(7, 9, 12, 0.85)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 149, 0, 0.4)',
                borderRadius: '12px',
                padding: '10px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: '#ff9500' }}>CYBERROVER X5 DEEP RECON</div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.875rem', fontWeight: 700, color: '#fff' }}>ATEX Zone 0 Submersible Crawler</div>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', background: 'rgba(255, 149, 0, 0.2)', color: '#ff9500', padding: '4px 8px', borderRadius: '4px' }}>
                  TARGET: 2026–2028
                </span>
              </div>
            </div>

            {/* Right: The 4 Critical Pillars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Pillar 1 */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 149, 0, 0.2)',
                borderRadius: '16px',
                padding: '16px 20px',
                transition: 'all 0.25s ease'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <Flame size={20} style={{ color: '#ff9500' }} />
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, margin: 0, color: '#fff' }}>
                    ATEX Zone 0 Explosion-Proofing (Nitrogen-Purged Hull)
                  </h4>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'rgba(255, 255, 255, 0.7)', margin: 0, lineHeight: 1.5 }}>
                  In underground coal mines with flammable methane gas, electrical sparks cause fatal detonations. The X5 seals all electronics in an airtight, positive-pressure Nitrogen-purged aluminum monocoque where fire cannot ignite.
                </p>
              </div>

              {/* Pillar 2 */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(0, 217, 255, 0.2)',
                borderRadius: '16px',
                padding: '16px 20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <Droplets size={20} style={{ color: '#00e5ff' }} />
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, margin: 0, color: '#fff' }}>
                    Underwater Operations (IP69K + 5 ATM Submersible)
                  </h4>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'rgba(255, 255, 255, 0.7)', margin: 0, lineHeight: 1.5 }}>
                  Flooded mine shafts stop standard robots. The X5 is designed to submerge under 3 to 4 meters of standing water, walking directly along flooded mine beds with sealed magnetic-drive brushless tracks.
                </p>
              </div>

              {/* Pillar 3 */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(57, 229, 140, 0.2)',
                borderRadius: '16px',
                padding: '16px 20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <Anchor size={20} style={{ color: '#39e58c' }} />
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, margin: 0, color: '#fff' }}>
                    1,000m Armored Fiber-Optic Tether Communication
                  </h4>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'rgba(255, 255, 255, 0.7)', margin: 0, lineHeight: 1.5 }}>
                  Deep underground tunnels block RF signals. The X5 integrates a 1 km internal kevlar-reinforced fiber tether carrying 1 Gbps telemetry and HD video unaffected by solid rock walls.
                </p>
              </div>

              {/* Pillar 4 */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 59, 48, 0.2)',
                borderRadius: '16px',
                padding: '16px 20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <ShieldCheck size={20} style={{ color: '#ff3b30' }} />
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, margin: 0, color: '#fff' }}>
                    FLIR Thermal Radiometric & 3D LiDAR SLAM
                  </h4>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'rgba(255, 255, 255, 0.7)', margin: 0, lineHeight: 1.5 }}>
                  Penetrates dense smoke and total blackouts with Long-Wave Infrared (LWIR) heat signatures to find trapped miners, while solid-state LiDAR builds centimetre-accurate 3D tunnel maps.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* VIEW 2: COMPARISON MATRIX TABLE                          */
          /* ========================================================= */
          <div style={{
            background: 'rgba(16, 20, 26, 0.9)',
            border: '1px solid rgba(255, 149, 0, 0.25)',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 149, 0, 0.1)', borderBottom: '1px solid rgba(255, 149, 0, 0.2)' }}>
                  <th style={{ padding: '16px 20px', fontFamily: 'var(--font-heading)', color: '#ff9500', width: '22%' }}>SUBSYSTEM</th>
                  <th style={{ padding: '16px 20px', fontFamily: 'var(--font-heading)', color: '#00e5ff', width: '39%' }}>CYBERROVER X4.3 (PROTOTYPE)</th>
                  <th style={{ padding: '16px 20px', fontFamily: 'var(--font-heading)', color: '#ff9500', width: '39%' }}>CYBERROVER X5 (INDUSTRIAL)</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_DATA.map((row, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      background: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.01)' : 'transparent'
                    }}
                  >
                    <td style={{ padding: '14px 20px', fontWeight: 600, color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                      {row.feature}
                    </td>
                    <td style={{ padding: '14px 20px', color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.8125rem' }}>
                      {row.x4}
                    </td>
                    <td style={{ padding: '14px 20px', color: '#ff9500', fontWeight: 500, fontSize: '0.8125rem' }}>
                      {row.x5}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
