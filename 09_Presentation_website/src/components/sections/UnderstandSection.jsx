import React from 'react';
import { Scan, Eye, Activity, Terminal } from 'lucide-react';

export default function UnderstandSection() {
  return (
    <section id="understand" className="story-stage" style={{ background: 'var(--bg-surface)' }}>
      <div className="container">
        <div className="chapter-number reveal-3d">06 // COMPUTER VISION & EDGE INFERENCE (UNDERSTAND)</div>

        <div className="reveal-3d" style={{ maxWidth: '820px', marginBottom: 'var(--space-12)' }}>
          <h2 className="section-headline" style={{ marginBottom: 'var(--space-4)' }}>
            Real-Time Edge Computer Vision & Closed-Loop Tracking
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem', lineHeight: 1.7 }}>
            Rather than burdening low-power microcontrollers with heavy matrix calculations, CyberRover X streams raw frames to the Laptop host running an optimized **Python OpenCV 4.8** pipeline.
          </p>
        </div>

        {/* 3-Pillar Engineered OpenCV Pipeline */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 'var(--space-6)' }}>
          {/* Pillar 1 */}
          <div className="reveal-3d" style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            borderTop: '2px solid var(--accent-cyan)',
            borderRadius: 'var(--radius-xs)',
            padding: 'var(--space-6)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transformStyle: 'preserve-3d'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--accent-cyan)', letterSpacing: '0.1em' }}>
                  STAGE 01 // DETECTION
                </span>
                <Scan size={18} style={{ color: 'var(--accent-cyan)' }} />
              </div>

              <h3 style={{ fontSize: '1.1875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Facial Target Acquisition
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '14px' }}>
                Multi-scale Haar Feature-based Cascade Classifier detects human face contours in dynamic industrial environments with sub-30ms inference times.
              </p>
            </div>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.4)', padding: '6px 10px', borderRadius: 'var(--radius-xs)', overflowX: 'auto' }}>
              cv2.CascadeClassifier('haarcascade_frontalface.xml')
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="reveal-3d" style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            borderTop: '2px solid var(--accent-cyan)',
            borderRadius: 'var(--radius-xs)',
            padding: 'var(--space-6)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transformStyle: 'preserve-3d'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--accent-cyan)', letterSpacing: '0.1em' }}>
                  STAGE 02 // FEEDBACK
                </span>
                <Eye size={18} style={{ color: 'var(--accent-cyan)' }} />
              </div>

              <h3 style={{ fontSize: '1.1875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Closed-Loop Tracking PID
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '14px' }}>
                Calculates optical error vector (ΔX = X_center - X_target) on the smartphone camera feed and computes proportional steering correction to maintain target alignment.
              </p>
            </div>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.4)', padding: '6px 10px', borderRadius: 'var(--radius-xs)', overflowX: 'auto' }}>
              steer_angle += Kp * (frame_center_x - target_x)
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="reveal-3d" style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            borderTop: '2px solid var(--accent-cyan)',
            borderRadius: 'var(--radius-xs)',
            padding: 'var(--space-6)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transformStyle: 'preserve-3d'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--accent-cyan)', letterSpacing: '0.1em' }}>
                  STAGE 03 // SURVEILLANCE
                </span>
                <Activity size={18} style={{ color: 'var(--accent-cyan)' }} />
              </div>

              <h3 style={{ fontSize: '1.1875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Motion Differencing
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '14px' }}>
                Computes absolute pixel delta between consecutive frames. Contours exceeding dynamic area thresholds trigger automated hazard alerts and target logging.
              </p>
            </div>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.4)', padding: '6px 10px', borderRadius: 'var(--radius-xs)', overflowX: 'auto' }}>
              diff = cv2.absdiff(frame_curr, frame_prev)
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
