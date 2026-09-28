import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Radio, Activity, AlertTriangle, Disc } from 'lucide-react';

const SOUND_EFFECTS = [
  { id: 1, name: 'CAR HORN', tag: 'DUAL TONE', desc: '440Hz / 350Hz twin harmonic acoustic horn', type: 'carHorn' },
  { id: 2, name: 'TRUCK AIR HORN', tag: 'LOW SUB', desc: '180Hz heavy resonant pneumatic horn pulse', type: 'truckHorn' },
  { id: 4, name: 'HAZMAT SIREN', tag: 'POLICE / RESCUE', desc: '600Hz to 1200Hz frequency-modulated sweep', type: 'policeSiren' },
  { id: 5, name: 'REVERSE BEEP', tag: 'SAFETY PULSE', desc: '1200Hz tactical vehicle backing beeps', type: 'reverseBeep' },
  { id: 6, name: 'GAS LEAK ALARM', tag: 'DEFLAGRATION', desc: '2400Hz high-frequency toxic gas alert', type: 'gasAlarm' },
  { id: 8, name: 'SOS MORSE CODE', tag: 'EMERGENCY BEACON', desc: 'International Distress Morse Code (... --- ...)', type: 'sosMorse' },
  { id: 7, name: 'SCI-FI CHIRP', tag: 'TELEMETRY PING', desc: 'Linear frequency ramp acoustic chirp', type: 'scifiChirp' },
  { id: 3, name: 'TIME BOMB TICK', tag: 'DETONATION BEAT', desc: 'Staccato percussive proximity countdown', type: 'timeBomb' }
];

export default function TacticalAudioSynth() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeFx, setActiveFx] = useState(null);
  const [masterVolume, setMasterVolume] = useState(0.3);
  const audioCtxRef = useRef(null);
  const activeNodesRef = useRef([]);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const analyserRef = useRef(null);

  // Initialize Web Audio API Context
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
      analyserRef.current = audioCtxRef.current.createAnalyser();
      analyserRef.current.fftSize = 128;
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const stopAllAudio = () => {
    activeNodesRef.current.forEach(node => {
      try {
        if (node.stop) node.stop();
        node.disconnect();
      } catch (e) {}
    });
    activeNodesRef.current = [];
    setIsPlaying(false);
    setActiveFx(null);
  };

  const playSound = (fx) => {
    stopAllAudio();
    const ctx = getAudioContext();
    const analyser = analyserRef.current;
    const now = ctx.currentTime;
    setActiveFx(fx.id);
    setIsPlaying(true);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(masterVolume, now);
    masterGain.connect(analyser);
    analyser.connect(ctx.destination);
    activeNodesRef.current.push(masterGain);

    switch (fx.type) {
      case 'carHorn': {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';
        osc1.frequency.setValueAtTime(440, now);
        osc2.frequency.setValueAtTime(350, now);
        osc1.connect(masterGain);
        osc2.connect(masterGain);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.9);
        osc2.stop(now + 0.9);
        activeNodesRef.current.push(osc1, osc2);
        setTimeout(stopAllAudio, 900);
        break;
      }
      case 'truckHorn': {
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(180, now);
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, now);
        osc.connect(filter);
        filter.connect(masterGain);
        osc.start(now);
        osc.stop(now + 1.2);
        activeNodesRef.current.push(osc, filter);
        setTimeout(stopAllAudio, 1200);
        break;
      }
      case 'policeSiren': {
        const osc = ctx.createOscillator();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        lfo.type = 'triangle';
        lfo.frequency.setValueAtTime(1.5, now);
        lfoGain.gain.setValueAtTime(350, now);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        osc.connect(masterGain);
        lfo.start(now);
        osc.start(now);
        lfo.stop(now + 2.5);
        osc.stop(now + 2.5);
        activeNodesRef.current.push(osc, lfo, lfoGain);
        setTimeout(stopAllAudio, 2500);
        break;
      }
      case 'reverseBeep': {
        for (let i = 0; i < 4; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(1200, now + i * 0.4);
          gain.gain.setValueAtTime(0.4, now + i * 0.4);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.4 + 0.2);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now + i * 0.4);
          osc.stop(now + i * 0.4 + 0.22);
          activeNodesRef.current.push(osc, gain);
        }
        setTimeout(stopAllAudio, 1800);
        break;
      }
      case 'gasAlarm': {
        for (let i = 0; i < 6; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(2400, now + i * 0.25);
          gain.gain.setValueAtTime(0.6, now + i * 0.25);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.25 + 0.15);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now + i * 0.25);
          osc.stop(now + i * 0.25 + 0.16);
          activeNodesRef.current.push(osc, gain);
        }
        setTimeout(stopAllAudio, 1600);
        break;
      }
      case 'sosMorse': {
        // ... --- ...
        const pattern = [
          0.1, 0.1, 0.1, // dots
          0.3, 0.3, 0.3, // dashes
          0.1, 0.1, 0.1  // dots
        ];
        let t = now;
        pattern.forEach((dur) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1000, t);
          gain.gain.setValueAtTime(0.5, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(t);
          osc.stop(t + dur + 0.02);
          activeNodesRef.current.push(osc, gain);
          t += dur + 0.12;
        });
        setTimeout(stopAllAudio, (t - now) * 1000);
        break;
      }
      case 'scifiChirp': {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(3200, now + 0.6);
        osc.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.65);
        activeNodesRef.current.push(osc);
        setTimeout(stopAllAudio, 650);
        break;
      }
      case 'timeBomb': {
        for (let i = 0; i < 5; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(1800, now + i * 0.3);
          gain.gain.setValueAtTime(0.5, now + i * 0.3);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.3 + 0.08);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now + i * 0.3);
          osc.stop(now + i * 0.3 + 0.09);
          activeNodesRef.current.push(osc, gain);
        }
        setTimeout(stopAllAudio, 1600);
        break;
      }
      default:
        stopAllAudio();
    }
  };

  // Canvas visualizer animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (!analyserRef.current || !isPlaying) {
        // Flat idle line with gentle cyber pulse
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.strokeStyle = 'rgba(0, 217, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.stroke();
        return;
      }

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteTimeDomainData(dataArray);

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#00e5ff';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00e5ff';
      ctx.beginPath();

      const sliceWidth = width / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    render();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  return (
    <div style={{
      background: 'linear-gradient(145deg, rgba(16, 20, 26, 0.95), rgba(7, 9, 12, 0.98))',
      border: '1px solid rgba(0, 217, 255, 0.25)',
      borderRadius: '24px',
      padding: 'clamp(16px, 3vw, 28px)',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
      maxWidth: '960px',
      margin: '0 auto',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Volume2 size={16} style={{ color: '#00e5ff' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#00e5ff', letterSpacing: '0.12em' }}>
              NODE 03 // NON-BLOCKING SOUND ENGINE
            </span>
          </div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 700, margin: '4px 0 0 0', color: '#fff' }}>
            Interactive Tactical Audio Soundboard
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.8125rem', color: 'rgba(255, 255, 255, 0.6)' }}>
            Real-time Web Audio API synthesis of the 10 acoustic horn & emergency siren patterns programmed in <code>SoundEngine.h</code>
          </p>
        </div>

        {/* Mute / Stop Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={stopAllAudio}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              background: isPlaying ? 'rgba(255, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${isPlaying ? '#ff4444' : 'rgba(255, 255, 255, 0.15)'}`,
              color: isPlaying ? '#ff4444' : '#fff',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer'
            }}
          >
            <VolumeX size={14} />
            <span>MUTE / STOP ALL</span>
          </button>
        </div>
      </div>

      {/* Live Audio Oscilloscope Canvas */}
      <div style={{
        background: '#04070a',
        border: '1px solid rgba(0, 217, 255, 0.3)',
        borderRadius: '12px',
        padding: '8px 14px',
        marginBottom: '22px',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: '#00e5ff' }}>
            REAL-TIME ACOUSTIC WAVEFORM OSCILLOSCOPE
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: isPlaying ? '#00e5ff' : 'rgba(255,255,255,0.4)' }}>
            {isPlaying ? '● TRANSMITTING ACTIVE WAVE' : '○ ACOUSTIC TRANSDUCER STANDBY'}
          </span>
        </div>
        <canvas
          ref={canvasRef}
          width={880}
          height={64}
          style={{ width: '100%', height: '64px', display: 'block' }}
        />
      </div>

      {/* Soundboard Buttons Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
        gap: '12px'
      }}>
        {SOUND_EFFECTS.map((fx) => {
          const isActive = activeFx === fx.id;
          return (
            <button
              key={fx.id}
              onClick={() => playSound(fx)}
              style={{
                background: isActive ? 'rgba(0, 217, 255, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${isActive ? '#00e5ff' : 'rgba(255, 255, 255, 0.1)'}`,
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.625rem',
                  color: isActive ? '#00e5ff' : 'rgba(255,255,255,0.5)',
                  background: 'rgba(255,255,255,0.06)',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}>
                  {fx.tag}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: '#00e5ff' }}>
                  FX #{fx.id}
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.875rem', fontWeight: 700, color: '#fff', marginBottom: '2px' }}>
                {fx.name}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'rgba(255, 255, 255, 0.55)', lineHeight: 1.3 }}>
                {fx.desc}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
