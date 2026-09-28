import React from 'react';
import { useVideoScrollSync } from '../../hooks/useVideoScrollSync';

export default function VideoScrollySection() {
  const {
    containerRef,
    videoRef,
    isLoaded
  } = useVideoScrollSync({
    lerpFactor: 0.14,
    triggerOffset: 'top top',
    endOffset: '+=2400'
  });

  return (
    <section
      id="recon-video"
      ref={containerRef}
      className="desktop-only"
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: 'var(--bg-base)',
        zIndex: 2
      }}
    >
      {/* Clean Fullscreen Viewport (Desktop Only) */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#05070A'
      }}>
        {/* Full-bleed Scrubbed Video Player */}
        <video
          ref={videoRef}
          src="/video/hero.mp4"
          playsInline
          muted
          preload="auto"
          disablePictureInPicture
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            filter: 'brightness(0.95) contrast(1.05)',
            opacity: isLoaded ? 1 : 0.4,
            transition: 'opacity 0.4s ease'
          }}
        />

        {/* Subtle Ambient Vignette Overlay */}
        <div className="vignette-overlay" style={{ opacity: 0.5 }} />
      </div>
    </section>
  );
}
