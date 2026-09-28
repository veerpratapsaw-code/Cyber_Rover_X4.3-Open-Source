import React, { useState } from 'react';
import { Mic, Cpu, Terminal, Volume2, Play, Sparkles, CheckCircle2 } from 'lucide-react';

const PRESET_COMMANDS = [
  {
    text: "Check chemical pipeline ahead and report carbon monoxide levels.",
    intent: "INSPECT_HAZARD",
    json: {
      action: "NAVIGATE_INSPECT",
      target: "PIPELINE_FORWARD",
      sensors: ["MQ7_CO", "MQ4_METHANE"],
      speed_pwm: 180,
      report_voice: true
    },
    tts: "Acknowledged. Advancing 4WD chassis. Polling MQ-7 CO sensor. Current reading: raw ADC indication nominal."
  },
  {
    text: "Simulate proposed target identification test on operator feed.",
    intent: "EXPERIMENTAL_TARGET_IDENT",
    json: {
      action: "SIMULATE_TARGET_LOCK",
      target_class: "VISUAL_MARKER",
      status: "EXPERIMENTAL_ROADMAP",
      tracking_feedback: "OPTICAL_BOUNDING_BOX"
    },
    tts: "Simulation mode: Proposed optical target locked on operator ground cockpit display."
  },
  {
    text: "Emergency stop! Obstacle detected in forward path.",
    intent: "EMERGENCY_STOP",
    json: {
      action: "E_STOP",
      motor_kill: true,
      brake_mode: "DYNAMIC_SHORT",
      override_assist: true
    },
    tts: "Emergency stop engaged! All motor H-bridges de-energized. System stationary."
  }
];

export default function VoiceSimulator() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStage, setActiveStage] = useState(4); // 1, 2, 3, 4

  const activeCmd = PRESET_COMMANDS[selectedIdx];

  const handleRunPipeline = (idx) => {
    setSelectedIdx(idx);
    setIsProcessing(true);
    setActiveStage(1);

    setTimeout(() => setActiveStage(2), 500);
    setTimeout(() => setActiveStage(3), 1100);
    setTimeout(() => {
      setActiveStage(4);
      setIsProcessing(false);
    }, 1700);
  };

  return (
    <div className="tech-card reticle-box" style={{ background: 'var(--bg-surface)', padding: 'var(--space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-cyan)', letterSpacing: '0.1em' }}>
            EXPERIMENTAL ROADMAP // SIMULATED OPERATOR VOICE COMMANDS
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Natural Voice Command & Intent Pipeline
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
          <Sparkles size={16} />
          <span>GEMINI 1.5 FLASH NLU</span>
        </div>
      </div>

      {/* Preset Command Buttons */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
          SELECT OPERATOR VOICE TRANSMISSION:
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {PRESET_COMMANDS.map((cmd, i) => (
            <button
              key={i}
              onClick={() => handleRunPipeline(i)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
                padding: '10px 14px',
                background: selectedIdx === i ? 'rgba(0, 217, 255, 0.08)' : 'var(--bg-elevated)',
                border: `1px solid ${selectedIdx === i ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                width: '100%'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 200px' }}>
                <Mic size={16} style={{ color: selectedIdx === i ? 'var(--accent-cyan)' : 'var(--text-muted)', flexShrink: 0 }} />
                <span style={{ fontSize: 'clamp(0.8125rem, 2vw, 0.875rem)', lineHeight: 1.4 }}>"{cmd.text}"</span>
              </div>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.625rem',
                padding: '2px 6px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 'var(--radius-xs)',
                color: 'var(--accent-cyan)',
                whiteSpace: 'nowrap',
                alignSelf: 'flex-start'
              }}>
                {cmd.intent}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Pipeline Visual Flow */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '10px',
        marginBottom: 'var(--space-6)'
      }}>
        {/* Stage 1 */}
        <div style={{
          padding: '12px',
          background: 'var(--bg-elevated)',
          border: `1px solid ${activeStage >= 1 ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
          borderRadius: 'var(--radius-sm)',
          opacity: activeStage >= 1 ? 1 : 0.4,
          transition: 'all 0.3s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
            <Mic size={14} />
            <span>01. SPEECH-TO-TEXT</span>
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Microphone audio streamed to Python SpeechRecognition engine.
          </div>
        </div>

        {/* Stage 2 */}
        <div style={{
          padding: '12px',
          background: 'var(--bg-elevated)',
          border: `1px solid ${activeStage >= 2 ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
          borderRadius: 'var(--radius-sm)',
          opacity: activeStage >= 2 ? 1 : 0.4,
          transition: 'all 0.3s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
            <Sparkles size={14} />
            <span>02. GEMINI NLU</span>
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            LLM extracts semantic intent, parameters, and safety flags.
          </div>
        </div>

        {/* Stage 3 */}
        <div style={{
          padding: '12px',
          background: 'var(--bg-elevated)',
          border: `1px solid ${activeStage >= 3 ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
          borderRadius: 'var(--radius-sm)',
          opacity: activeStage >= 3 ? 1 : 0.4,
          transition: 'all 0.3s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
            <Terminal size={14} />
            <span>03. JSON DISPATCH</span>
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Hard JSON payload transmitted to ESP32 core via WiFi/UDP.
          </div>
        </div>

        {/* Stage 4 */}
        <div style={{
          padding: '12px',
          background: 'var(--bg-elevated)',
          border: `1px solid ${activeStage >= 4 ? 'var(--status-nominal)' : 'var(--border-subtle)'}`,
          borderRadius: 'var(--radius-sm)',
          opacity: activeStage >= 4 ? 1 : 0.4,
          transition: 'all 0.3s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--status-nominal)' }}>
            <Volume2 size={14} />
            <span>04. EDGE TTS VOCAL</span>
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Audible feedback generated via Edge TTS neural voice.
          </div>
        </div>
      </div>

      {/* JSON Output & TTS Voice Readout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {/* JSON Code Inspector */}
        <div style={{ background: '#040608', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
            <span>PARSED PAYLOAD (JSON)</span>
            <span style={{ color: 'var(--status-nominal)' }}>STATUS: 200 OK</span>
          </div>
          <pre style={{ color: 'var(--accent-cyan)', margin: 0, overflowX: 'auto' }}>
            {JSON.stringify(activeCmd.json, null, 2)}
          </pre>
        </div>

        {/* TTS Verbal Feedback Pod */}
        <div style={{ background: 'var(--bg-elevated)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--status-nominal)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Volume2 size={14} />
              <span>ROVER AUDIO TELEMETRY (EDGE TTS):</span>
            </div>
            <p style={{ fontStyle: 'italic', color: 'var(--text-primary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              "{activeCmd.tts}"
            </p>
          </div>

          <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            <span>VOICE: en-US-ChristopherNeural</span>
            <span>LATENCY: 140ms</span>
          </div>
        </div>
      </div>
    </div>
  );
}
