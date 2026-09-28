import React, { useState, useRef } from 'react';
import { Compass, ShieldAlert, Eye, Activity, ChevronDown, ArrowUpRight, ShieldCheck, Zap, Radio, MapPin } from 'lucide-react';
import { smoothScrollTo } from '../../hooks/useSmoothScroll';
import rover3DHeroImg from '../../assets/cyberrover_x43_hero.png';

export default function HeroSection({ telemetry }) {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = ((clientX / innerWidth) - 0.5) * 22;
    const y = ((clientY / innerHeight) - 0.5) * 18;
    setMouseOffset({ x, y });
  };

  return (
    <section
      id="hero"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 'clamp(70px, 9vh, 100px)',
        paddingBottom: 'clamp(40px, 5vh, 60px)',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-base)',
        perspective: '1200px'
      }}
    >
      {/* 3D Background Monumental Typography ("CYBERROVER X4.3") with Glow */}
      <div style={{
        position: 'absolute',
        top: '40%',
        left: '50%',
        transform: `translate(-50%, -50%) translate3d(${-mouseOffset.x * 1.6}px, ${-mouseOffset.y * 1.6}px, -40px)`,
        width: '100%',
        textAlign: 'center',
        pointerEvents: 'none',
        zIndex: 0,
        userSelect: 'none',
        whiteSpace: 'nowrap',
        transition: 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'transform'
      }}>
        <div style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(5rem, 18vw, 20rem)',
          fontWeight: 900,
          letterSpacing: '-0.03em',
          textTransform: 'uppercase',
          lineHeight: 0.82,
          background: 'linear-gradient(180deg, rgba(0, 217, 255, 0.28) 0%, rgba(22, 119, 255, 0.05) 80%, transparent 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 50px rgba(0, 217, 255, 0.18)) blur(0.5px)'
        }}>
          CYBERROVER
        </div>
        <div style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(2rem, 8vw, 8.5rem)',
          fontWeight: 900,
          letterSpacing: '0.3em',
          color: 'rgba(0, 217, 255, 0.12)',
          marginTop: '6px'
        }}>
          MODEL X4.3
        </div>
      </div>

      {/* Volumetric Radial Ambient Lighting */}
      <div style={{
        position: 'absolute',
        top: '45%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80vw',
        height: '55vw',
        maxWidth: '1200px',
        maxHeight: '800px',
        background: 'radial-gradient(ellipse at center, rgba(0, 217, 255, 0.15) 0%, rgba(22, 119, 255, 0.05) 50%, transparent 75%)',
        filter: 'blur(80px)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Main 3D Composition Grid Container */}
      <div className="container" style={{ position: 'relative', zIndex: 2, width: '100%', textAlign: 'center' }}>
        {/* Top Minimalist Product Code Badge with GREEN CURRENT TAG */}
        <div className="reveal-3d" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '5px 16px',
          background: 'rgba(57, 229, 140, 0.08)',
          border: '1px solid rgba(57, 229, 140, 0.3)',
          borderRadius: 'var(--radius-full)',
          marginBottom: 'var(--space-3)'
        }}>
          <span className="animate-blink" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--status-nominal)', boxShadow: '0 0 8px var(--status-nominal)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(0.625rem, 1.6vw, 0.75rem)', fontWeight: 700, color: 'var(--status-nominal)', letterSpacing: '0.14em' }}>
            CYBERROVER X4.3 // DUAL-TIER AUTONOMOUS EXPLORATION UGV (2026)
          </span>
        </div>

        {/* Project Mission Sub-Badge */}
        <div className="reveal-3d" style={{ marginBottom: 'var(--space-3)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(0.6875rem, 1.8vw, 0.8125rem)', color: 'var(--text-secondary)', letterSpacing: '0.08em' }}>
            INVENTOR & LEAD DEVELOPER: <strong style={{ color: 'var(--accent-cyan)' }}>VEER PRATAP SAW</strong> &nbsp;|&nbsp; REGIONAL SCIENCE EXHIBITION, RAMGARH
          </span>
        </div>

        {/* Monumental Tagline */}
        <div className="reveal-3d" style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(1rem, 2.5vw, 1.6rem)',
          fontWeight: 700,
          color: 'var(--accent-cyan)',
          letterSpacing: 'clamp(0.15em, 1vw, 0.4em)',
          textTransform: 'uppercase',
          marginBottom: 'var(--space-4)'
        }}>
          SEGREGATED DUAL-TIER ARCHITECTURE &nbsp;·&nbsp; SUB-GHz LoRa &nbsp;·&nbsp; GPS NAVIGATION
        </div>

        {/* 3D High-Res CyberRover X4 Hero Object with Clean Parallax Tilt */}
        <div
          className="reveal-3d"
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            perspective: '1200px',
            maxWidth: '860px',
            width: '100%',
            margin: '0 auto var(--space-6)'
          }}
        >
          {/* 3D Parallax Wrapper */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              borderRadius: 'var(--radius-md)',
              transform: `rotateY(${mouseOffset.x * 1.15}deg) rotateX(${-mouseOffset.y * 1.15}deg) translateZ(20px)`,
              transition: 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
              transformStyle: 'preserve-3d',
              willChange: 'transform'
            }}
          >
            {/* Rover 3D Render Canvas Box */}
            <div style={{
              position: 'relative',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              aspectRatio: '16 / 9',
              border: '1px solid rgba(0, 217, 255, 0.35)',
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.95), 0 0 60px rgba(0, 217, 255, 0.2)',
              background: '#040608'
            }}>
              <img
                src={rover3DHeroImg}
                alt="CYBERROVER X4.3 Real Prototype - Field Sunset (Ramgarh 2026)"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  filter: 'contrast(1.05) brightness(1.02)'
                }}
              />

              {/* Optical Reticle Framing Lines */}
              <div style={{
                position: 'absolute',
                inset: 'clamp(8px, 2vw, 16px)',
                border: '1px solid rgba(0, 217, 255, 0.22)',
                pointerEvents: 'none',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: 'clamp(6px, 1.5vw, 12px)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 'clamp(0.5625rem, 1.5vw, 0.6875rem)', color: 'var(--accent-cyan)' }}>
                  <span>TARGET LOCK: ACQUIRED</span>
                  <span>LoRa RF LINK: 868/915 MHz ACTIVE</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 'clamp(0.5625rem, 1.5vw, 0.6875rem)', color: 'var(--text-muted)' }}>
                  <span>TRACTION: 4WD DUAL BTS7960</span>
                  <span>PAYLOAD: 7-INSTRUMENT SUITE + GPS</span>
                </div>
              </div>
            </div>

            {/* Interactive Floating Hotspot 1: OLED RoboEyes HUD */}
            <div
              style={{
                position: 'absolute',
                top: '18%',
                left: '48%',
                transform: 'translate(-50%, 0) translateZ(45px)',
                zIndex: 3
              }}
            >
              <div
                className="animate-pulse"
                style={{
                  padding: '5px 10px',
                  background: 'rgba(7, 9, 12, 0.92)',
                  border: '1px solid var(--accent-cyan)',
                  borderRadius: 'var(--radius-xs)',
                  color: 'var(--accent-cyan)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  boxShadow: '0 0 16px rgba(0, 217, 255, 0.45)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
                onClick={() => smoothScrollTo('connect')}
              >
                ● 1.3" OLED ROBOEYES HUD
              </div>
            </div>

            {/* Interactive Floating Hotspot 2: Smartphone Optical Turret */}
            <div
              style={{
                position: 'absolute',
                top: '32%',
                left: '12%',
                zIndex: 3,
                transform: 'translateZ(45px)'
              }}
            >
              <div
                className="animate-pulse"
                style={{
                  padding: '5px 10px',
                  background: 'rgba(7, 9, 12, 0.92)',
                  border: '1px solid var(--accent-blue)',
                  borderRadius: 'var(--radius-xs)',
                  color: 'var(--accent-cyan)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  boxShadow: '0 0 16px rgba(22, 119, 255, 0.45)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
                onClick={() => smoothScrollTo('vision')}
              >
                ● PHONE OPTICAL TURRET
              </div>
            </div>

            {/* Interactive Floating Hotspot 3: Sonar Radar */}
            <div
              style={{
                position: 'absolute',
                bottom: '18%',
                left: '14%',
                zIndex: 3,
                transform: 'translateZ(45px)'
              }}
            >
              <div
                className="animate-pulse"
                style={{
                  padding: '5px 10px',
                  background: 'rgba(7, 9, 12, 0.92)',
                  border: '1px solid var(--status-nominal)',
                  borderRadius: 'var(--radius-xs)',
                  color: 'var(--status-nominal)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  boxShadow: '0 0 16px rgba(57, 229, 140, 0.45)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
                onClick={() => smoothScrollTo('move')}
              >
                ● 3X ULTRASONIC RADAR
              </div>
            </div>

            {/* Interactive Floating Hotspot 4: Layer 2 Environmental Deck */}
            <div
              style={{
                position: 'absolute',
                top: '40%',
                right: '8%',
                zIndex: 3,
                transform: 'translateZ(45px)'
              }}
            >
              <div
                className="animate-pulse"
                style={{
                  padding: '5px 10px',
                  background: 'rgba(7, 9, 12, 0.92)',
                  border: '1px solid var(--status-warning)',
                  borderRadius: 'var(--radius-xs)',
                  color: 'var(--status-warning)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  boxShadow: '0 0 16px rgba(255, 176, 32, 0.45)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
                onClick={() => smoothScrollTo('sensors')}
              >
                ● LAYER 2 SENSOR DECK (NANO)
              </div>
            </div>
          </div>
        </div>

        {/* 6 Sleek Graphical Telemetry Pills */}
        <div className="reveal-3d" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
          gap: '10px',
          maxWidth: '860px',
          margin: '0 auto var(--space-6)'
        }}>
          <div style={{ padding: '10px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', textAlign: 'left', fontFamily: 'var(--font-mono)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.625rem', marginBottom: '2px' }}>ACOUSTIC SONAR</div>
            <div style={{ color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '0.95rem' }}>{telemetry.ultrasonicCenter} cm</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.5625rem' }}>PROXIMITY RADAR</div>
          </div>

          <div style={{ padding: '10px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', textAlign: 'left', fontFamily: 'var(--font-mono)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.625rem', marginBottom: '2px' }}>CH4 METHANE</div>
            <div style={{ color: 'var(--status-nominal)', fontWeight: 700, fontSize: '0.95rem' }}>{telemetry.mq4Methane || 185} <span style={{ fontSize: '0.625rem' }}>ADC</span></div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.5625rem' }}>MQ-4 SENSOR</div>
          </div>

          <div style={{ padding: '10px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', textAlign: 'left', fontFamily: 'var(--font-mono)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.625rem', marginBottom: '2px' }}>LoRa RF LINK</div>
            <div style={{ color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '0.95rem' }}>868/915 MHz</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.5625rem' }}>RYLR998 1+ KM</div>
          </div>

          <div style={{ padding: '10px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', textAlign: 'left', fontFamily: 'var(--font-mono)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.625rem', marginBottom: '2px' }}>u-blox GPS</div>
            <div style={{ color: 'var(--status-nominal)', fontWeight: 700, fontSize: '0.95rem' }}>3D FIX (8 SATS)</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.5625rem' }}>NEO-6M ENGINE</div>
          </div>

          <div style={{ padding: '10px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', textAlign: 'left', fontFamily: 'var(--font-mono)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.625rem', marginBottom: '2px' }}>POWER BUS</div>
            <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem' }}>12.1V (83%)</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.5625rem' }}>3S LI-ION RAIL</div>
          </div>

          <div style={{ padding: '10px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', textAlign: 'left', fontFamily: 'var(--font-mono)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.625rem', marginBottom: '2px' }}>ONBOARD HUD</div>
            <div style={{ color: 'var(--accent-blue)', fontWeight: 700, fontSize: '0.95rem' }}>1.3" OLED</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.5625rem' }}>VECTOR ROBOEYES</div>
          </div>
        </div>

        {/* Clean Primary Action Buttons */}
        <div className="reveal-3d" style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '14px',
          flexWrap: 'wrap',
          marginBottom: 'var(--space-6)'
        }}>
          <button
            onClick={() => smoothScrollTo('mission')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 28px',
              background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.28), rgba(22, 119, 255, 0.38))',
              border: '1px solid var(--accent-cyan)',
              borderRadius: 'var(--radius-xs)',
              color: 'var(--accent-cyan)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              cursor: 'pointer',
              boxShadow: '0 0 24px rgba(0, 217, 255, 0.35)',
              transition: 'all 0.25s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 0 35px rgba(0, 217, 255, 0.55)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 0 24px rgba(0, 217, 255, 0.35)';
            }}
          >
            <span className="animate-blink" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-cyan)' }} />
            <span>EXPLORE MISSION</span>
            <ArrowUpRight size={16} />
          </button>

          <button
            onClick={() => smoothScrollTo('specs')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-xs)',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.borderColor = 'var(--accent-cyan)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.borderColor = 'var(--border-medium)';
            }}
          >
            <span>TECHNICAL DATASHEET</span>
          </button>
        </div>

        {/* Prototype Engineering Limitation Statement */}
        <div className="reveal-3d" style={{
          maxWidth: '680px',
          margin: '0 auto var(--space-6)',
          padding: '8px 16px',
          background: 'rgba(255, 176, 32, 0.05)',
          border: '1px solid rgba(255, 176, 32, 0.2)',
          borderRadius: 'var(--radius-xs)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6875rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5
        }}>
          <strong style={{ color: 'var(--status-warning)' }}>EXHIBITION PLATFORM:</strong> CyberRover X4.3 is a functional research & disaster-reconnaissance UGV built and presented by Veer Pratap Saw for the Regional Science Exhibition, Ramgarh.
        </div>

        {/* Downward Navigation Anchor */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => smoothScrollTo('mission')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              letterSpacing: '0.14em',
              cursor: 'pointer',
              transition: 'color 0.25s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-cyan)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <span>EXPLORE PLATFORM CONTINUUM</span>
            <ChevronDown size={16} className="animate-blink" style={{ color: 'var(--accent-cyan)' }} />
          </button>
        </div>
      </div>
    </section>
  );
}
