import React from 'react';
import { Layers, Wifi, Network } from 'lucide-react';
import SystemTopologyDiagram from '../ui/SystemTopologyDiagram';
import CyberOSSimulator from '../ui/CyberOSSimulator';

export default function ConnectSection() {
  return (
    <section id="system" className="story-stage" style={{ background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-base) 100%)', position: 'relative', overflow: 'hidden' }}>
      {/* High-Visibility Monumental Background Typography */}
      <div style={{
        position: 'absolute',
        top: '6%',
        left: '2%',
        fontFamily: 'var(--font-heading)',
        fontSize: 'clamp(4.5rem, 15vw, 15rem)',
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
        TOPOLOGY
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="chapter-number reveal-3d">06 // DISTRIBUTED TOPOLOGY & SUB-GHz LoRa (CONNECT)</div>

        <div className="reveal-3d" style={{ maxWidth: '820px', marginBottom: 'var(--space-10)' }}>
          <h2 className="section-headline" style={{ marginBottom: 'var(--space-4)' }}>
            Segregated Dual-Tier Architecture: 100 Hz Drive Control &amp; Sub-GHz LoRa Telemetry
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem', lineHeight: 1.7 }}>
            CyberRover X4.3 strictly isolates real-time driving control from environmental telemetry so that sensor serialization never stalls mobility. Layer 1 operates via dedicated 100 Hz ESP-NOW radio with a 400ms watchdog failsafe to the Uno motor driver. Layer 2 operates on an Arduino Nano Master broadcasting 18-token telemetry packets over Sub-GHz Reyax RYLR998 LoRa (868/915 MHz) across 1+ km through collapsed rubble and mine shafts to the Laptop Ground Cockpit with persistent SQLite DBMS logging.
          </p>
        </div>

        {/* Embedded 6-Node Topology Diagram */}
        <div className="reveal-3d" style={{ marginBottom: 'var(--space-12)' }}>
          <SystemTopologyDiagram />
        </div>

        {/* Embedded Flipper-Zero Style Cyber OS Handheld Remote Simulator */}
        <div className="reveal-3d">
          <CyberOSSimulator />
        </div>
      </div>
    </section>
  );
}
