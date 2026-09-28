import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, AlertTriangle, ShieldCheck, Flame, Eye, Compass, ArrowUpRight } from 'lucide-react';
import x5HazardToxicImg from '../../assets/x5_hazard_toxic.jpg';
import x5HazardFloodedImg from '../../assets/x5_hazard_flooded.jpg';
import x5HazardSmokeImg from '../../assets/x5_hazard_smoke.jpg';

const HAZARD_SLIDES = [
  {
    id: 0,
    num: '01',
    category: 'ATMOSPHERIC EXPLOSION HAZARD',
    title: 'Toxic Gas Plumes & Methane Manifolds',
    shortDesc: 'Proposed future capability: Methane (CH4) & Carbon Monoxide (CO) detection in regulated explosive mine atmospheres.',
    fullDesc: 'Target concept for CyberRover X5: engineered to operate in explosive Zone 1 gas atmospheres using an internal nitrogen-purged analysis chamber with dual sintered bronze flame arrestors to sample volatile fumes safely without ignition risk.',
    image: x5HazardToxicImg,
    hazardTag: 'PROPOSED X5 ROADMAP // ATEX TARGET',
    sensorReadout: 'GAS CHAMBER: NITROGEN PURGED',
    gasAlert: 'MQ-4 & MQ-7: PROTOTYPE INDICATION',
    accentColor: 'var(--status-hazard)',
    accentBg: 'rgba(255, 77, 79, 0.14)',
    accentBorder: 'rgba(255, 77, 79, 0.5)'
  },
  {
    id: 1,
    num: '02',
    category: 'SUBMERSIBLE & FLOODED VOID',
    title: 'Flooded Mine Shafts & Subterranean Water',
    shortDesc: 'Proposed future capability: 1–4m standing floodwater navigation in submerged conduits impassable to wheeled units.',
    fullDesc: 'Target concept for CyberRover X5: planned as a submersible tracked crawler featuring an IP69K sealed 6061-T6 aluminum pressure hull rated to 5 atmospheres, with high-torque tracks and scanning sonar to traverse flooded silt beds.',
    image: x5HazardFloodedImg,
    hazardTag: 'PROPOSED X5 ROADMAP // IP69K TARGET',
    sensorReadout: 'SCANNING SONAR: PROPOSED (750 kHz)',
    gasAlert: 'DEPTH WATCHDOG: TARGET CONCEPT',
    accentColor: 'var(--status-warning)',
    accentBg: 'rgba(250, 173, 20, 0.14)',
    accentBorder: 'rgba(250, 173, 20, 0.5)'
  },
  {
    id: 2,
    num: '03',
    category: 'ZERO-VISIBILITY COLLAPSE & SMOKE',
    title: 'Dense Industrial Smoke & Blast Rubble',
    shortDesc: 'Proposed future capability: Structural rubble traversal and particulate penetration where optical cameras fail.',
    fullDesc: 'Target concept for CyberRover X5: proposed integration of 3x solid-state Livox LiDAR sensors behind sapphire crystal windows and radiometric FLIR thermal imaging to map collapse zones through zero-visibility smoke.',
    image: x5HazardSmokeImg,
    hazardTag: 'PROPOSED X5 ROADMAP // 3D LIDAR TARGET',
    sensorReadout: 'SOLID-STATE LIDAR: PROPOSED CONCEPT',
    gasAlert: 'THERMAL IR: PROPOSED SENSOR',
    accentColor: 'var(--accent-cyan)',
    accentBg: 'rgba(0, 217, 255, 0.14)',
    accentBorder: 'rgba(0, 217, 255, 0.5)'
  }
];

export default function MissionSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  // Auto-cycle carousel every 4 seconds when not hovered
  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % HAZARD_SLIDES.length);
      }, 4000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HAZARD_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + HAZARD_SLIDES.length) % HAZARD_SLIDES.length);
  };

  const activeHazard = HAZARD_SLIDES[currentSlide];

  return (
    <section
      id="mission"
      className="story-stage"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        background: 'linear-gradient(180deg, var(--bg-base) 0%, var(--bg-surface) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* High-Visibility Monumental Background Typography */}
      <div style={{
        position: 'absolute',
        top: '6%',
        right: '2%',
        fontFamily: 'var(--font-heading)',
        fontSize: 'clamp(4.5rem, 16vw, 16rem)',
        fontWeight: 900,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        lineHeight: 0.8,
        background: 'linear-gradient(180deg, rgba(0, 217, 255, 0.22) 0%, rgba(22, 119, 255, 0.04) 75%, transparent 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        filter: 'drop-shadow(0 0 50px rgba(0, 217, 255, 0.16)) blur(0.3px)',
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: 0
      }}>
        MISSION
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Chapter Header */}
        <div className="chapter-number reveal-3d">01 // THE MISSION IMPERATIVE</div>

        {/* Heroic Statement & Interactive Parallax Carousel */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: 'clamp(1.5rem, 4vw, 3.5rem)',
          alignItems: 'center',
          marginBottom: 'var(--space-10)'
        }}>
          {/* Left Column: Mission Manifesto */}
          <div className="reveal-3d">
            <h2 className="section-headline" style={{ marginBottom: 'var(--space-4)', lineHeight: 1.15 }}>
              "When the environment is uncertain, <span style={{ color: 'var(--accent-cyan)' }}>don't send the human first.</span>"
            </h2>
            <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)', lineHeight: 1.7 }}>
              Chemical leaks, combustible gas pockets, and structural voids present lethal hazards to safety personnel.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: 'var(--space-4)' }}>
              CyberRover X4.3 provides long-range Sub-GHz LoRa telemetry, live optical reconnaissance, and real-time 7-instrument multi-gas indication, allowing human operators to assess environmental hazards before rescue teams commit to entering high-risk shafts.
            </p>
            <div style={{
              padding: '8px 12px',
              background: 'rgba(57, 229, 140, 0.06)',
              border: '1px solid rgba(57, 229, 140, 0.25)',
              borderRadius: 'var(--radius-xs)',
              marginBottom: 'var(--space-6)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              color: 'var(--text-secondary)'
            }}>
              <strong style={{ color: 'var(--status-nominal)' }}>CURRENT STATUS:</strong> Operator-controlled engineering prototype. Proposed X5 capabilities shown represent future industrial development.
            </div>

            {/* Active Hazard Quick Pill */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 16px',
              background: activeHazard.accentBg,
              border: `1px solid ${activeHazard.accentBorder}`,
              borderRadius: 'var(--radius-xs)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: activeHazard.accentColor
            }}>
              <span className="animate-blink" style={{ width: '6px', height: '6px', borderRadius: '50%', background: activeHazard.accentColor }} />
              <span style={{ fontWeight: 700 }}>THEATER {activeHazard.num}: {activeHazard.category}</span>
            </div>
          </div>

          {/* Right Column: Premium Parallax Image Carousel */}
          <div className="hud-panel corner-reticle reveal-3d" style={{ padding: '0', overflow: 'hidden', position: 'relative' }}>
            {/* Carousel Viewport Container */}
            <div style={{ position: 'relative', width: '100%', height: 'auto', minHeight: '280px', overflow: 'hidden' }}>
              <img
                key={activeHazard.id}
                src={activeHazard.image}
                alt={activeHazard.title}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  filter: 'brightness(0.95) contrast(1.06)',
                  transition: 'transform 0.4s ease, opacity 0.3s ease',
                  animation: 'fadeIn 0.4s ease'
                }}
              />

              {/* Top Hazard Tag Badge */}
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                padding: '5px 12px',
                background: 'rgba(7, 9, 12, 0.88)',
                border: `1px solid ${activeHazard.accentColor}`,
                borderRadius: 'var(--radius-xs)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                color: activeHazard.accentColor,
                letterSpacing: '0.08em',
                boxShadow: `0 0 16px ${activeHazard.accentBg}`
              }}>
                {activeHazard.hazardTag}
              </div>

              {/* Manual Carousel Navigation Buttons */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '12px',
                right: '12px',
                transform: 'translateY(-50%)',
                display: 'flex',
                justifyContent: 'space-between',
                pointerEvents: 'none'
              }}>
                <button
                  onClick={prevSlide}
                  aria-label="Previous Hazard Environment"
                  style={{
                    pointerEvents: 'auto',
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-xs)',
                    background: 'rgba(7, 9, 12, 0.85)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backdropFilter: 'blur(8px)'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-cyan)'; e.currentTarget.style.color = 'var(--accent-cyan)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-medium)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                >
                  <ChevronLeft size={20} />
                </button>

                <button
                  onClick={nextSlide}
                  aria-label="Next Hazard Environment"
                  style={{
                    pointerEvents: 'auto',
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-xs)',
                    background: 'rgba(7, 9, 12, 0.85)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backdropFilter: 'blur(8px)'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-cyan)'; e.currentTarget.style.color = 'var(--accent-cyan)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-medium)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Bottom Carousel Indicator Dots */}
              <div style={{
                position: 'absolute',
                bottom: '12px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '8px',
                background: 'rgba(7, 9, 12, 0.75)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                backdropFilter: 'blur(6px)'
              }}>
                {HAZARD_SLIDES.map((slide, idx) => (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentSlide(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    style={{
                      width: currentSlide === idx ? '24px' : '8px',
                      height: '6px',
                      borderRadius: 'var(--radius-full)',
                      background: currentSlide === idx ? activeHazard.accentColor : 'rgba(255, 255, 255, 0.25)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Bottom Status Bar */}
            <div style={{
              padding: '12px 18px',
              background: 'var(--bg-elevated)',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              color: 'var(--text-muted)'
            }}>
              <span>{activeHazard.sensorReadout}</span>
              <span style={{ color: activeHazard.accentColor, fontWeight: 600 }}>{activeHazard.gasAlert}</span>
            </div>
          </div>
        </div>

        {/* 3 Synchronized Interactive Hazard Vectors (Click to Switch Carousel) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: 'var(--space-6)'
        }}>
          {HAZARD_SLIDES.map((hazard, index) => {
            const isActive = currentSlide === index;
            return (
              <div
                key={hazard.id}
                onClick={() => setCurrentSlide(index)}
                className="reveal-3d"
                style={{
                  background: isActive ? 'var(--bg-elevated)' : 'rgba(255, 255, 255, 0.02)',
                  borderLeft: `1px solid ${isActive ? hazard.accentColor : 'var(--border-subtle)'}`,
                  borderRight: `1px solid ${isActive ? hazard.accentColor : 'var(--border-subtle)'}`,
                  borderBottom: `1px solid ${isActive ? hazard.accentColor : 'var(--border-subtle)'}`,
                  borderTop: `4px solid ${hazard.accentColor}`,
                  borderRadius: 'var(--radius-xs)',
                  padding: 'var(--space-6)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transform: isActive ? 'translateY(-6px)' : 'translateY(0)',
                  boxShadow: isActive ? `0 15px 35px rgba(0, 0, 0, 0.6), 0 0 25px ${hazard.accentBg}` : 'none',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                    <span style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '2.5rem',
                      fontWeight: 900,
                      color: hazard.accentColor,
                      lineHeight: 1
                    }}>
                      {hazard.num}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.625rem',
                      fontWeight: 600,
                      color: hazard.accentColor,
                      background: hazard.accentBg,
                      border: `1px solid ${hazard.accentBorder}`,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-xs)'
                    }}>
                      {isActive ? 'ACTIVE VIEW' : hazard.category.split(' ')[0]}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    {hazard.title}
                  </h3>

                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {hazard.shortDesc}
                  </p>
                </div>

                <div style={{
                  marginTop: '18px',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  color: hazard.accentColor
                }}>
                  <span>{hazard.gasAlert}</span>
                  <ArrowUpRight size={14} style={{ opacity: isActive ? 1 : 0.4 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
