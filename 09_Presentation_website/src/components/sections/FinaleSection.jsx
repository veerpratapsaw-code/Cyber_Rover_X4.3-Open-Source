import React from 'react';
import { ArrowUpRight, Code, ExternalLink, ShieldCheck, ChevronUp } from 'lucide-react';
import { smoothScrollTo } from '../../hooks/useSmoothScroll';
import roverHeroImg from '../../assets/rover_hero.jpg';

export default function FinaleSection() {
  const scrollToTop = () => {
    smoothScrollTo('hero');
  };

  return (
    <section id="finale" className="story-stage" style={{ background: 'var(--bg-base)', textAlign: 'center', overflow: 'hidden' }}>
      {/* Background Radial Glow */}
      <div style={{
        position: 'absolute',
        bottom: '0%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '80vw',
        height: '40vw',
        background: 'radial-gradient(ellipse at bottom, rgba(0, 217, 255, 0.08) 0%, transparent 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none'
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="reveal-3d" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 14px',
          background: 'rgba(0, 217, 255, 0.06)',
          border: '1px solid rgba(0, 217, 255, 0.2)',
          borderRadius: 'var(--radius-full)',
          marginBottom: 'var(--space-6)'
        }}>
          <span className="animate-blink" style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--status-nominal)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--status-nominal)', letterSpacing: '0.18em' }}>
            REGIONAL SCIENCE EXHIBITION // RAMGARH 2026
          </span>
        </div>

        <h2 className="display-title reveal-3d" style={{
          marginBottom: 'var(--space-4)',
          background: 'linear-gradient(180deg, #FFFFFF 40%, #5F6B76 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          CYBERROVER <span style={{ color: 'var(--accent-cyan)', WebkitTextFillColor: 'var(--accent-cyan)' }}>X4.3</span>
        </h2>

        {/* 3 Bold Staggered Words */}
        <div className="reveal-3d" style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 'clamp(0.75rem, 3vw, 3rem)',
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(1.25rem, 4.5vw, 3.25rem)',
          fontWeight: 700,
          letterSpacing: 'clamp(0.06em, 1vw, 0.12em)',
          color: 'var(--accent-cyan)',
          marginBottom: 'var(--space-6)'
        }}>
          <span>MOVE.</span>
          <span>SENSE.</span>
          <span>INSPECT.</span>
        </div>

        <p className="reveal-3d" style={{
          maxWidth: '600px',
          margin: '0 auto var(--space-8)',
          fontSize: '1.125rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.7
        }}>
          Engineering remote reconnaissance and environmental inspection for human safety across hazardous frontiers.
        </p>

        {/* Back to top button */}
        <div className="reveal-3d" style={{ marginTop: 'var(--space-10)' }}>
          <button
            onClick={scrollToTop}
            style={{
              padding: '12px 24px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.25s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-cyan)'; e.currentTarget.style.color = 'var(--accent-cyan)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-medium)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          >
            <ChevronUp size={14} />
            <span>RETURN TO TOP TELEMETRY</span>
          </button>
        </div>
      </div>
    </section>
  );
}
