import React from 'react';
import { Compass, Navigation, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import SonarRadar from '../ui/SonarRadar';
import TacticalAudioSynth from '../ui/TacticalAudioSynth';

export default function MoveSection({ telemetry }) {
  return (
    <section id="mobility" className="story-stage" style={{ background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-base) 100%)', position: 'relative', overflow: 'hidden' }}>
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
        ACOUSTICS
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="chapter-number reveal-3d">03 // OPERATOR MOBILITY & ACOUSTIC NAVIGATION ASSIST (MOVE)</div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: 'clamp(1.5rem, 4vw, 4rem)',
          alignItems: 'center',
          marginBottom: 'var(--space-12)'
        }}>
          {/* Left: Logic Architecture */}
          <div className="reveal-3d">
            <h2 className="section-headline" style={{ marginBottom: 'var(--space-4)' }}>
              Tri-Directional Acoustic Sonar & Dual BTS7960 Drivers
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)', fontSize: '1.0625rem', lineHeight: 1.7 }}>
              Unlike optical cameras that can suffer in dense smoke or total blackouts, CyberRover X4.3 utilizes ultrasonic acoustic transducers coupled with a high-torque 4WD drivetrain.
            </p>
            <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-8)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              40kHz acoustic pulses reflect off barriers in real time. The Arduino Uno motor controller processes proximity returns across three forward sectors, calculating vector clearances and feeding hardware PWM acceleration curves to dual BTS7960 high-current motor drivers.
            </p>

            {/* Step-by-Step Logic Pipeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', borderLeft: '2px solid var(--accent-cyan)', paddingLeft: '12px' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem', fontFamily: 'var(--font-heading)' }}>
                    01 // Acoustic Pulse Transmission
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    10μs TTL trigger pulse fires across Left (-45°), Center (0°), and Right (+45°) HC-SR04 sectors.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', borderLeft: '2px solid var(--accent-cyan)', paddingLeft: '12px' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem', fontFamily: 'var(--font-heading)' }}>
                    02 // Echo Timing & Navigation Guidance
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Distance = (Echo Time × 0.0343 cm/μs) / 2. Center threshold &lt; 30cm prompts collision warning and evasion recommendations.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', borderLeft: '2px solid var(--status-nominal)', paddingLeft: '12px' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem', fontFamily: 'var(--font-heading)' }}>
                    03 // Dual BTS7960 Motor Drivers & PWM Acceleration
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    High-current MOSFET bridges driven by hardware PWM provide smooth motor torque curves without aggressive current spikes on battery rails.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Live Interactive Sonar Radar */}
          <div className="reveal-3d">
            <SonarRadar liveDistances={telemetry} />
          </div>
        </div>

        {/* Tactical Soundboard Embedded Widget */}
        <div className="reveal-3d">
          <TacticalAudioSynth />
        </div>
      </div>
    </section>
  );
}
