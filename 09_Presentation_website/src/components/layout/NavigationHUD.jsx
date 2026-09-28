import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Menu, X, ChevronRight, Activity, ShieldCheck, Github, Radio } from 'lucide-react';
import { smoothScrollTo } from '../../hooks/useSmoothScroll';

const NAV_LINKS = [
  { id: 'hero', label: 'PLATFORM', num: '01' },
  { id: 'chassis', label: 'CHASSIS', num: '02' },
  { id: 'mobility', label: 'MOBILITY', num: '03' },
  { id: 'sensors', label: 'HAZMAT', num: '04' },
  { id: 'system', label: 'TOPOLOGY & OS', num: '05' },
  { id: 'limitations', label: 'LIMITATIONS', num: '06' },
  { id: 'x5-future', label: 'X5 FUTURE', num: '07' },
  { id: 'specs', label: 'SPECS', num: '08' }
];

export default function NavigationHUD({ activeSection, scrollPercent, batteryVoltage = 11.85 }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleNavClick = (id) => {
    setMobileMenuOpen(false);
    smoothScrollTo(id);
  };

  return (
    <>
      {/* Top Transparent / Glassmorphic Aerospace Telemetry Bar */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: isScrolled ? '54px' : '64px',
        background: mobileMenuOpen ? 'rgba(7, 9, 12, 0.96)' : isScrolled ? 'rgba(7, 9, 12, 0.45)' : 'transparent',
        backdropFilter: mobileMenuOpen || isScrolled ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: mobileMenuOpen || isScrolled ? 'blur(16px)' : 'none',
        borderBottom: isScrolled ? '1px solid rgba(0, 217, 255, 0.12)' : '1px solid transparent',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--container-gutter)',
        transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Brand Mark: CYBERROVER X4.3 */}
        <div
          onClick={() => handleNavClick('hero')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
        >
          <span className="animate-blink" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--status-nominal)', boxShadow: '0 0 8px var(--status-nominal)' }} />
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(0.9375rem, 3vw, 1.0625rem)', letterSpacing: '-0.02em', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
            CYBERROVER <span style={{ color: 'var(--accent-cyan)' }}>X4.3</span>
          </span>
        </div>

        {/* Desktop Navigation Anchors (>= 960px) */}
        <nav className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.6rem, 1.4vw, 1.5rem)' }}>
          {NAV_LINKS.map(link => {
            const isActive = activeSection.includes(link.id);
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                  transition: 'color 0.25s ease',
                  position: 'relative',
                  padding: '4px 0'
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                {link.label}
                {isActive && (
                  <span style={{
                    position: 'absolute',
                    bottom: '0',
                    left: 0,
                    right: 0,
                    height: '1.5px',
                    background: 'var(--accent-cyan)',
                    boxShadow: '0 0 8px var(--accent-cyan)'
                  }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Area: Telemetry & Mobile Hamburger Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* GitHub Link */}
          <a
            href="https://github.com/veerpratapsaw-code/Cyber_Rover_X4.3-Open-Source"
            target="_blank"
            rel="noreferrer"
            className="desktop-only"
            title="Open-Source GitHub Repository (Veer Pratap Saw)"
            style={{ color: 'var(--text-secondary)', transition: 'color 0.2s ease' }}
          >
            <Github size={18} />
          </a>

          {/* Quick Telemetry Indicators */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Radio size={12} style={{ color: 'var(--accent-cyan)' }} />
              <span className="desktop-only">LoRa</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <BatteryMedium size={12} style={{ color: 'var(--status-nominal)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>{batteryVoltage}V</span>
            </div>
          </div>

          {/* Mobile Hamburger Toggle Button (< 960px) */}
          <button
            className="mobile-only"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation HUD"
            style={{
              background: mobileMenuOpen ? 'rgba(0, 217, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${mobileMenuOpen ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-xs)',
              color: mobileMenuOpen ? 'var(--accent-cyan)' : 'var(--text-primary)',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              minWidth: '36px',
              minHeight: '36px'
            }}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* 2px Global Real-Time Progress Line */}
      <div style={{
        position: 'fixed',
        top: isScrolled ? '54px' : '64px',
        left: 0,
        width: `${scrollPercent}%`,
        height: '2px',
        background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-cyan), var(--status-nominal))',
        boxShadow: '0 0 12px var(--accent-cyan)',
        zIndex: 1001,
        transition: 'top 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'width'
      }} />

      {/* Full-Screen Mobile HUD Navigation Drawer */}
      <div
        className="mobile-only"
        style={{
          position: 'fixed',
          top: isScrolled ? '54px' : '64px',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(7, 9, 12, 0.98)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 'clamp(1rem, 4vw, 2rem)',
          overflowY: 'auto',
          transform: mobileMenuOpen ? 'translateY(0)' : 'translateY(-105%)',
          opacity: mobileMenuOpen ? 1 : 0,
          transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease',
          pointerEvents: mobileMenuOpen ? 'auto' : 'none'
        }}
      >
        {/* Navigation Link List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '10px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--accent-cyan)', letterSpacing: '0.14em', marginBottom: '8px' }}>
            // TACTICAL MISSION DIRECTORY
          </div>

          {NAV_LINKS.map(link => {
            const isActive = activeSection.includes(link.id);
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: isActive ? 'rgba(0, 217, 255, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${isActive ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-xs)',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  minHeight: '46px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
                    {link.num}
                  </span>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, letterSpacing: '0.02em' }}>
                    {link.label}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isActive && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--accent-cyan)', background: 'rgba(0, 217, 255, 0.15)', padding: '2px 6px', borderRadius: 'var(--radius-xs)' }}>
                      ACTIVE
                    </span>
                  )}
                  <ChevronRight size={14} style={{ color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)' }} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Drawer Bottom Telemetry Status Pod */}
        <div style={{
          marginTop: '20px',
          padding: '12px 16px',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xs)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6875rem'
        }}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.625rem' }}>RF BUS STATUS</div>
            <div style={{ color: 'var(--status-nominal)', fontWeight: 600 }}>LoRa 868/915M + ESP-NOW</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.625rem' }}>POWER RAIL</div>
            <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{batteryVoltage}V (NOMINAL)</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.625rem' }}>CONTROL MODE</div>
            <div style={{ color: 'var(--status-nominal)', fontWeight: 600 }}>OPERATOR + SENSORS</div>
          </div>
        </div>
      </div>
    </>
  );
}
