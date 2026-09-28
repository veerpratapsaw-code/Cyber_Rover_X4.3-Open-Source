import React from 'react';
import { Sparkles, Mic, Terminal, Volume2 } from 'lucide-react';
import VoiceSimulator from '../ui/VoiceSimulator';

export default function IntelligenceSection() {
  return (
    <section id="intelligence" className="story-stage" style={{ background: 'var(--bg-base)' }}>
      <div className="container">
        <div className="chapter-number reveal-3d">08 // MULTIMODAL INTELLIGENCE (GEMINI NLU)</div>

        <div className="reveal-3d" style={{ maxWidth: '820px', marginBottom: 'var(--space-12)' }}>
          <h2 className="section-headline" style={{ marginBottom: 'var(--space-4)' }}>
            Natural Language Command Translation via Gemini Flash
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem', lineHeight: 1.7 }}>
            Operators in hazmat gear cannot easily type on keyboards. CyberRover X accepts unstructured spoken directives, translating human speech into deterministic JSON hardware commands through Google's Gemini API and vocalizing state updates via Edge TTS.
          </p>
        </div>

        {/* Embedded Interactive Voice Simulator */}
        <div className="reveal-3d">
          <VoiceSimulator />
        </div>
      </div>
    </section>
  );
}
