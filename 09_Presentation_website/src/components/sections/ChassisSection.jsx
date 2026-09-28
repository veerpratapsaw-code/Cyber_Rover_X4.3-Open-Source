import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Cpu, Zap, Eye, Compass, Layers, CheckCircle2, ArrowRight } from 'lucide-react';
import chassisTractionImg from '../../assets/real_chassis_4wd.jpg';
import chassisPhoneImg from '../../assets/cyberrover_x43_side.jpg';
import chassisMcuImg from '../../assets/cyberrover_x43_rear_gas.jpg';
import chassisBatteryImg from '../../assets/real_battery_3s1p.jpg';

const CHASSIS_MODULES = [
  {
    id: 0,
    num: '01',
    title: 'Layer 1: 4WD Drivetrain & Dual BTS7960 (43A)',
    subtitle: '4 Geared DC Motors // Dual BTS7960 High-Current H-Bridges',
    desc: 'Heavy-duty 4WD lower deck with high-traction ribbed wheels driven by dual BTS7960 43A MOSFET H-bridges. 50Hz S-curve acceleration ramping prevents gear stripping and eliminates motor back-EMF spikes from affecting sensitive upper deck instrumentation.',
    image: chassisTractionImg,
    tag: 'LAYER 1: DUAL BTS7960 43A DRIVERS + 4WD',
    spec1: 'DRIVERS: DUAL BTS7960 43A H-BRIDGES',
    spec2: 'MOBILITY: 4x GEARED DC + SKID STEERING',
    badge: 'LAYER 1 MOBILITY'
  },
  {
    id: 1,
    num: '02',
    title: 'Smartphone Optical Reconnaissance Dock',
    subtitle: 'Mounted Optical Turret // Auto-Torch in Tunnels',
    desc: 'Rigid smartphone dock mounted securely to the forward upper deck. Delivers high-definition real-time optical video to the laptop ground station with zero servo jitter, plus automated LED illumination triggered upon entering unlit mine shafts.',
    image: chassisPhoneImg,
    tag: 'SMARTPHONE TURRET + AUTO-TORCH',
    spec1: 'VIDEO FEED: REAL-TIME OPERATOR HUD',
    spec2: 'ILLUMINATION: SMART AUTO-TORCH IN DARKNESS',
    badge: 'PHONE OPTICS'
  },
  {
    id: 2,
    num: '03',
    title: 'Layer 2: Dedicated Environmental Node (Nano Master)',
    subtitle: 'Arduino Nano Master Controller // 7-Instrument Unified Array',
    desc: 'Complete segregation of instrumentation: the upper deck is governed by a dedicated Arduino Nano sampling MQ-4, MQ-7, MQ-135, DHT11, BMP280, 3S battery divider, and u-blox NEO-6M GPS. Completely isolated from motor EMI to ensure zero packet drop and pure analog ADC precision.',
    image: chassisMcuImg,
    tag: 'LAYER 2: UNIFIED ARDUINO NANO SENSOR MASTER',
    spec1: 'COMPUTE: ARDUINO NANO + BMP280 + OLED',
    spec2: 'TELEMETRY: REYAX RYLR998 SUB-GHz LoRa',
    badge: 'LAYER 2 SENSORS'
  },
  {
    id: 3,
    num: '04',
    title: 'Dual-Rail Power Distribution & Precision Monitor',
    subtitle: '3S Li-ion (11.1V Nom / 12.6V Peak) // Calibrated Divider (0.852 Trim)',
    desc: 'Segregated power grid: high-current 5V buck converter powers Nano, MQ heaters (450mA), and ESP32-S3 logic. Dedicated 3.3V LDO powers LoRa, GPS, and OLED. Nano Pin A3 measures real-time 3S voltage through a 0-25V divider with 16x burst averaging and calibrated 0.852 software trim.',
    image: chassisBatteryImg,
    tag: '3S LI-ION GRID · 5V BUCK · 3.3V ISOLATED',
    spec1: 'BATTERY: 3S LI-ION (11.1V NOM / 12.6V PEAK)',
    spec2: 'MONITORING: 16x OVERSAMPLED DIVIDER (0.852 TRIM)',
    badge: 'DUAL POWER RAILS'
  }
];

export default function ChassisSection() {
  const [activeTab, setActiveTab] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  // Auto-cycle carousel every 4 seconds when not hovered
  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setActiveTab((prev) => (prev + 1) % CHASSIS_MODULES.length);
      }, 4000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  const nextModule = () => {
    setActiveTab((prev) => (prev + 1) % CHASSIS_MODULES.length);
  };

  const prevModule = () => {
    setActiveTab((prev) => (prev - 1 + CHASSIS_MODULES.length) % CHASSIS_MODULES.length);
  };

  const currentMod = CHASSIS_MODULES[activeTab];

  return (
    <section
      id="chassis"
      className="story-stage"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        background: 'var(--bg-surface)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* High-Visibility Monumental Background Typography */}
      <div style={{
        position: 'absolute',
        top: '6%',
        left: '2%',
        fontFamily: 'var(--font-heading)',
        fontSize: 'clamp(4rem, 15vw, 15rem)',
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
        ARCHITECTURE
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Chapter Indicator */}
        <div className="chapter-number reveal-3d">02 // PHYSICAL PLATFORM ARCHITECTURE</div>

        {/* Section Headline */}
        <div className="reveal-3d" style={{ maxWidth: '840px', marginBottom: 'var(--space-10)' }}>
          <h2 className="section-headline" style={{ marginBottom: 'var(--space-4)' }}>
            Engineered for Stability & Modular Precision
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem', lineHeight: 1.7 }}>
            CyberRover X4.3 is engineered on a two-tier modular chassis with high-traction ribbed wheels, dual BTS7960 43A motor drivers, segregated compute decks (Layer 1 Mobility &amp; Layer 2 Environmental Deck), and an integrated 3S Li-ion battery pack with precision voltage monitoring.
          </p>
        </div>

        {/* Main 2-Column Responsive Layout: Parallax Carousel + Synchronized Subsystems */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: 'clamp(1.5rem, 4vw, 3.5rem)',
          alignItems: 'center'
        }}>
          {/* Left Column: Subsystem Parallax Carousel */}
          <div className="hud-panel corner-reticle reveal-3d" style={{ padding: '0', overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'relative', width: '100%', minHeight: '300px', overflow: 'hidden' }}>
              <img
                key={currentMod.id}
                src={currentMod.image}
                alt={currentMod.title}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  filter: 'contrast(1.08) brightness(1.02)',
                  transition: 'transform 0.4s ease, opacity 0.3s ease',
                  animation: 'fadeIn 0.4s ease'
                }}
              />

              {/* Subsystem Floating Holographic Reticle */}
              <div style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                padding: '6px 12px',
                background: 'rgba(7, 9, 12, 0.92)',
                border: '1px solid var(--accent-cyan)',
                borderRadius: 'var(--radius-xs)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)',
                color: 'var(--accent-cyan)',
                fontWeight: 700,
                boxShadow: '0 0 16px rgba(0, 217, 255, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span className="animate-blink" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-cyan)' }} />
                <span>[● {currentMod.tag}]</span>
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
                  onClick={prevModule}
                  aria-label="Previous Subsystem"
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
                  onClick={nextModule}
                  aria-label="Next Subsystem"
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
                top: '12px',
                right: '12px',
                display: 'flex',
                gap: '6px',
                background: 'rgba(7, 9, 12, 0.8)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                backdropFilter: 'blur(6px)',
                border: '1px solid var(--border-subtle)'
              }}>
                {CHASSIS_MODULES.map((mod, idx) => (
                  <button
                    key={mod.id}
                    onClick={() => setActiveTab(idx)}
                    aria-label={`Go to module ${idx + 1}`}
                    style={{
                      width: activeTab === idx ? '20px' : '6px',
                      height: '6px',
                      borderRadius: 'var(--radius-full)',
                      background: activeTab === idx ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.25)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Bottom Subsystem Spec Bar */}
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
              <span style={{ color: 'var(--text-primary)' }}>{currentMod.spec1}</span>
              <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{currentMod.spec2}</span>
            </div>
          </div>

          {/* Right Column: 4 Synchronized Interactive Subsystem Cards */}
          <div className="reveal-3d" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {CHASSIS_MODULES.map((item, index) => {
              const isActive = activeTab === index;
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveTab(index)}
                  style={{
                    padding: '16px 18px',
                    background: isActive ? 'var(--bg-elevated)' : 'rgba(255, 255, 255, 0.02)',
                    borderTop: `1px solid ${isActive ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                    borderRight: `1px solid ${isActive ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                    borderBottom: `1px solid ${isActive ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                    borderLeft: `4px solid ${isActive ? 'var(--accent-cyan)' : 'transparent'}`,
                    borderRadius: 'var(--radius-xs)',
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: isActive ? '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 217, 255, 0.15)' : 'none',
                    transform: isActive ? 'translateX(4px)' : 'translateX(0)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)'
                      }}>
                        {item.num}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '1.0625rem',
                        fontWeight: 700,
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)'
                      }}>
                        {item.title}
                      </span>
                    </div>

                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.625rem',
                      color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)',
                      background: isActive ? 'rgba(0, 217, 255, 0.12)' : 'transparent',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-xs)',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.badge}
                    </span>
                  </div>

                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)',
                    marginBottom: '6px'
                  }}>
                    {item.subtitle}
                  </div>

                  {isActive && (
                    <p style={{
                      fontSize: '0.8125rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.6,
                      marginTop: '6px',
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '8px',
                      animation: 'fadeIn 0.25s ease'
                    }}>
                      {item.desc}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
