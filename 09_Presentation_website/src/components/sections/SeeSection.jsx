import React from 'react';
import { Smartphone, Camera, ShieldCheck, Zap } from 'lucide-react';
import VisionHUD from '../ui/VisionHUD';
import realRoverImg from '../../assets/real_rover_field_1.png';

export default function SeeSection() {
  return (
    <section id="vision" className="story-stage" style={{ background: 'linear-gradient(180deg, var(--bg-base) 0%, var(--bg-surface) 100%)', position: 'relative', overflow: 'hidden' }}>
      {/* High-Visibility Monumental Background Typography */}
      <div style={{
        position: 'absolute',
        top: '6%',
        right: '2%',
        fontFamily: 'var(--font-heading)',
        fontSize: 'clamp(4.5rem, 15vw, 15rem)',
        fontWeight: 900,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        lineHeight: 0.8,
        background: 'linear-gradient(180deg, rgba(0, 217, 255, 0.24) 0%, rgba(22, 119, 255, 0.05) 75%, transparent 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        filter: 'drop-shadow(0 0 50px rgba(0, 217, 255, 0.16)) blur(0.3px)',
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: 0
      }}>
        OPTICS
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="chapter-number reveal-3d">05 // PRIMARY OPTICAL RECONNAISSANCE (PHONE CAMERA)</div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: 'clamp(1.5rem, 4vw, 4rem)',
          alignItems: 'center'
        }}>
          {/* Left: Viewfinder HUD */}
          <div className="reveal-3d">
            <VisionHUD turretImage={realRoverImg} />
          </div>

          {/* Right: Optical Reconnaissance Architecture */}
          <div className="reveal-3d">
            <h2 className="section-headline" style={{ marginBottom: 'var(--space-4)' }}>
              Chassis-Mounted Smartphone Optical Reconnaissance
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)', fontSize: '1.0625rem', lineHeight: 1.7 }}>
              Standard microcontroller cameras suffer from narrow dynamic range, severe compression artifacts, and low frame rates during high-vibration off-road maneuvers.
            </p>
            <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-6)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              CyberRover X4.3 eliminates mechanical servo failure points by utilizing a dedicated high-resolution smartphone camera turret securely docked to the rover chassis. Delivering real-time high-definition video observation, electronic image stabilization (EIS), and high-lumen illumination, it streams operator reconnaissance over a local Wi-Fi link, complemented by the front 1.3" OLED procedural RoboEyes HUD and independent Sub-GHz LoRa telemetry deck.
            </p>

            {/* Spec Columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ padding: '14px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--accent-cyan)', marginBottom: '4px' }}>
                  OPTICAL RECONNAISSANCE
                </div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700 }}>
                  Smartphone Optics
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Live Operator FPV Visual Stream
                </div>
              </div>

              <div style={{ padding: '14px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--accent-cyan)', marginBottom: '4px' }}>
                  SENSOR & STABILIZATION
                </div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700 }}>
                  Wide-Angle EIS
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Electronic Stabilization & LED Torch
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
