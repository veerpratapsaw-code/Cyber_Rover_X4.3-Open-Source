import React from 'react';
import { Factory, HardHat, AlertOctagon, Mountain, ShieldCheck, Flame } from 'lucide-react';

const THEATERS = [
  {
    icon: Flame,
    title: 'Petrochemical & Gas Refineries',
    tag: 'EXPLOSIVE VAPOR HAZARD',
    desc: 'Targeted inspection patrols around volatile cracking units and high-pressure gas manifolds. Rapid detection of combustible methane (MQ-4) and carbon monoxide (MQ-7) alerts operators to hazardous leaks.'
  },
  {
    icon: HardHat,
    title: 'Confined Conduits & Subterranean Shafts',
    tag: 'CONFINED SPACES',
    desc: 'Low-clearance traverse through HVAC ducts, utility tunnels, and wastewater drainage systems. 3-sector ultrasonic sonar enables continuous traversal in pitch-black channels where human inspection is hazardous or prohibited.'
  },
  {
    icon: AlertOctagon,
    title: 'Disaster Reconnaissance & Search',
    tag: 'POST-COLLAPSE OPERATIONS',
    desc: 'Rapid physical deployment into earthquake-damaged or structurally compromised buildings. Real-time OpenCV facial recognition and edge motion detection assist rescue crews in locating trapped survivors without risking secondary collapse.'
  },
  {
    icon: Mountain,
    title: 'Sub-Surface Mining Safety',
    tag: 'OXYGEN & GAS PROFILING',
    desc: 'Pre-shift atmospheric mapping of deep mining shafts. Evaluates ambient temperature (DHT-11) and monitors relative gas presence (MQ-4, MQ-135) to provide early environmental warnings.'
  }
];

import fieldImg1 from '../../assets/cyberrover_x43_hero.png';
import fieldImg2 from '../../assets/cyberrover_x43_side.jpg';
import fieldImg3 from '../../assets/cyberrover_x43_rear_gas.jpg';

export default function OperationsSection() {
  return (
    <section id="operations" className="story-stage" style={{ background: 'linear-gradient(180deg, var(--bg-base) 0%, var(--bg-surface) 100%)', position: 'relative', overflow: 'hidden' }}>
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
        THEATERS
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="chapter-number reveal-3d">08 // TARGET OPERATIONAL THEATERS</div>

        <div className="reveal-3d" style={{ maxWidth: '820px', marginBottom: 'var(--space-8)' }}>
          <h2 className="section-headline" style={{ marginBottom: 'var(--space-4)' }}>
            Target Application Theaters & Reconnaissance Scenarios
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem', lineHeight: 1.7, marginBottom: 'var(--space-3)' }}>
            CyberRover X4.3 is developed by Veer Pratap Saw as an inspection platform for assessing environmental dust, volatile atmospheres, and confined geometry across coalfields, industrial research, and disaster-reconnaissance scenarios.
          </p>

          <div style={{
            padding: '8px 14px',
            background: 'rgba(255, 176, 32, 0.06)',
            border: '1px solid rgba(255, 176, 32, 0.25)',
            borderRadius: 'var(--radius-xs)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            color: 'var(--text-secondary)'
          }}>
            <strong style={{ color: 'var(--status-warning)' }}>PROTOTYPE NOTICE:</strong> CyberRover X4.3 is a student-built engineering prototype and is not currently certified for deployment in regulated hazardous environments. Industrial theaters listed below represent demonstrated research and proposed deployment concepts.
          </div>
        </div>

        {/* 4 Theater Modules */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-12)' }}>
          {THEATERS.map((th, index) => (
            <div
              key={index}
              className="reveal-3d"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-xs)',
                padding: 'var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 900, color: 'var(--accent-cyan)', lineHeight: 1 }}>
                    0{index + 1}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--accent-cyan)', background: 'rgba(0, 217, 255, 0.08)', padding: '2px 8px', borderRadius: 'var(--radius-xs)' }}>
                    {th.tag}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  {th.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {th.desc}
                </p>
              </div>

              <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--accent-cyan)' }}>
                <ShieldCheck size={14} />
                <span>TARGET APPLICATION // PROPOSED DEPLOYMENT</span>
              </div>
            </div>
          ))}
        </div>

        {/* ========================================================= */}
        {/* REAL-WORLD FIELD PROTOTYPE & TERRAIN TRIALS               */}
        {/* ========================================================= */}
        <div className="reveal-3d" style={{
          background: 'linear-gradient(145deg, rgba(16, 20, 26, 0.95), rgba(7, 9, 12, 0.98))',
          border: '1px solid rgba(0, 217, 255, 0.25)',
          borderRadius: '24px',
          padding: 'clamp(20px, 3vw, 32px)'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: '#00e5ff', letterSpacing: '0.12em' }}>
              PHYSICAL TESTBENCH VALIDATION // FIELD RUNS
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 700, margin: '4px 0 0 0', color: '#fff' }}>
              Actual Hardware Prototype in Confined & Mine Tunnel Trials
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.65)' }}>
              Photographic documentation of the working physical vehicle under real wet concrete, loose rubble, and industrial tunnel conditions.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
            gap: '16px'
          }}>
            {[
              { img: fieldImg1, caption: 'ROVER SUNSET FIELD DEPLOYMENT', sub: 'Actual CyberRover X4.3 physical platform deployed with glowing RoboEyes HUD & 4WD traction' },
              { img: fieldImg2, caption: 'SIDE CHASSIS & PHONE TURRET RUN', sub: 'High-torque geared drivetrain with Layer 1 motor driver isolation and docked smartphone mount' },
              { img: fieldImg3, caption: 'REAR HAZMAT SENSOR MASTER DECK', sub: 'Arduino Nano Layer 2 Master acquiring MQ-4, MQ-7, MQ-135, and BMP280 multi-gas telemetry' }
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(0, 217, 255, 0.2)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={item.img}
                    alt={item.caption}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      transition: 'transform 0.4s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    background: 'rgba(7, 9, 12, 0.75)',
                    backdropFilter: 'blur(6px)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.625rem',
                    color: '#00e5ff',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid rgba(0, 217, 255, 0.3)'
                  }}>
                    LIVE FIELD TEST #{idx + 1}
                  </div>
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.875rem', fontWeight: 700, color: '#fff', marginBottom: '2px' }}>
                    {item.caption}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.3 }}>
                    {item.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
