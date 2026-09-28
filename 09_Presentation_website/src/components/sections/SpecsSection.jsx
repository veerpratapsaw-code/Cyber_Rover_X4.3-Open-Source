import React, { useState } from 'react';
import { Cpu, ShieldCheck, Download, FileText } from 'lucide-react';

const SPEC_TABS = [
  {
    id: 'chassis',
    label: 'CHASSIS & TRACTION',
    specs: [
      { param: 'Propulsion Configuration', val: '4WD Independent High-Torque Geared DC Motors' },
      { param: 'Motor Drivers', val: 'Dual BTS7960 43A High-Current MOSFET H-Bridge Drivers' },
      { param: 'Motor Acceleration Profiling', val: 'ATmega328P Hardware PWM S-Curve Slew-Rate Ramping (50 Hz)' },
      { param: 'Steering Method', val: 'Differential Skid Steering (Zero-Turn Radius In-Place Rotation)' },
      { param: 'Operating Ground Clearance', val: '45 mm (High-Impact Polymer & Aluminum Alloy Sub-Chassis)' },
      { param: 'Obstacle Navigation Assist', val: '3-Sector HC-SR04 Sonar Proximity Radar with Dynamic Braking' },
      { param: 'Total Platform Mass', val: '3.10 kg (Including 3S Li-Ion Pack, Dual Decks & Full Sensor Suite)' },
      { param: 'Operating Control Mode', val: 'Operator-Controlled via Handheld ESP-NOW Remote with Sonar Assist' }
    ]
  },
  {
    id: 'sensors',
    label: 'HAZMAT & SENSING SUITE',
    specs: [
      { param: 'Combustible Gas Indication', val: 'MQ-4 Analog Gas Sensor (Raw ADC Indication: Methane CH4 / CNG)' },
      { param: 'Carbon Monoxide Indication', val: 'MQ-7 Thermal Gas Sensor (Raw ADC Indication: Toxic CO Presence)' },
      { param: 'Air Quality & Volatiles', val: 'MQ-135 Sensor (Raw ADC Indication: NH3, NOx, Alcohol, Smoke, CO2)' },
      { param: 'Barometer & Relative Altitude', val: 'BMP280 MEMS Sensor (300-1100 hPa Barometric Pressure, ±1 m Altitude)' },
      { param: 'Ambient Climate Sensors', val: 'DHT11 Digital Sensor (Ambient 0°C to 50°C, 20-80% RH)' },
      { param: 'Geospatial Positioning', val: 'u-blox NEO-6M GPS Engine (NMEA 9600 Baud: Lat, Lon, Alt, Speed, Satellites)' },
      { param: 'Power Rail Telemetry', val: '3S Resistor Voltage Divider (Calibrated 0-15V ADC Battery Bus Monitoring)' },
      { param: 'Local Engineering Displays', val: '16x2 I2C LCD (Deck Telemetry) + 1.3" I2C OLED (Animated RoboEyes)' },
      { param: 'Obstacle Sonar Radar', val: '3 × HC-SR04 Ultrasonic Transducers (Left, Center, Right Sectors)' }
    ]
  },
  {
    id: 'vision_compute',
    label: 'COMPUTE & DISTRIBUTED MCUs',
    specs: [
      { param: 'Primary Optical Feed', val: 'Smartphone Camera Turret (High-Res Low-Latency FPV Stream + Torch)' },
      { param: 'Node 01: Remote Controller', val: 'ESP32 DevKit V1 (0.96" SSD1306 OLED UI + Analog Joystick + Switches)' },
      { param: 'Node 02: Rover Drive Master', val: 'ESP32-S3 (Dual-Core 240MHz, ESP-NOW RX, WS2812 RGB, 500ms Watchdog)' },
      { param: 'Node 03: Motor & Sonar Brain', val: 'Arduino Uno R3 (Dual BTS7960 Drivers + 3-Sector Sonar Fusion)' },
      { param: 'Node 04: Layer 2 Sensor Master', val: 'Arduino Nano V3 (7-Sensor Acquisition: MQ-4/7/135, BMP280, DHT11, GPS, V-Div)' },
      { param: 'Node 05: Long-Range RF Hub', val: 'Reyax RYLR998 Sub-GHz LoRa Transceiver (868/915 MHz, UART AT-Commands)' },
      { param: 'Node 06: Ground Cockpit & DB', val: 'Ground Station Dashboard + Python Serial/LoRa Engine + SQLite DBMS' }
    ]
  },
  {
    id: 'power_network',
    label: 'ELECTRICAL & RF PROTOCOL',
    specs: [
      { param: 'Layer 1: Drive RF Bus', val: 'ESP-NOW 2.4GHz Dedicated Peer-to-Peer Radio (<5ms Latency, CRC-8)' },
      { param: 'Layer 2: Telemetry LoRa Link', val: 'Reyax RYLR998 Sub-GHz LoRa (868/915 MHz, +22dBm, 1+ km Debris Penetration)' },
      { param: 'Local Video Stream', val: 'Direct High-Resolution Wi-Fi Optical Stream to Ground Cockpit' },
      { param: 'Control Failsafe Response', val: '500ms Hardware Watchdog Auto-Stop on RF Link Disconnection' },
      { param: 'Primary Battery Architecture', val: '18650 3S1P Li-Ion Pack with BMS (11.1V Nom / 12.6V Peak, XT30 High-Current)' },
      { param: 'Power Rail Isolation', val: 'Dual Step-Down Buck Converters (Isolated 12V Drive & 5V Logic Rails)' },
      { param: 'Platform Certification Status', val: 'Student Research Prototype by Veer Pratap Saw (Not Regulated ATEX/IECEx)' }
    ]
  }
];

export default function SpecsSection() {
  const [activeTab, setActiveTab] = useState('chassis');
  const currentTab = SPEC_TABS.find(t => t.id === activeTab) || SPEC_TABS[0];

  return (
    <section id="specs" className="story-stage" style={{ background: 'var(--bg-surface)', position: 'relative', overflow: 'hidden' }}>
      {/* High-Visibility Monumental Background Typography */}
      <div style={{
        position: 'absolute',
        top: '6%',
        right: '2%',
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
        DATASHEET
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="chapter-number reveal-3d">08 // TECHNICAL SPECIFICATIONS & DATASHEET</div>

        <div className="reveal-3d" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-8)', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 className="section-headline" style={{ marginBottom: 'var(--space-2)' }}>
              Engineering Systems Datasheet
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem' }}>
              Full hardware parameters, microcontroller pinouts, sensor calibrations, and software interfaces for CyberRover X4.3.
            </p>
          </div>

          <button
            onClick={() => window.print()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-xs)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-cyan)'; e.currentTarget.style.color = 'var(--accent-cyan)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-medium)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          >
            <Download size={14} />
            <span>EXPORT DATASHEET</span>
          </button>
        </div>

        {/* Tab Selection Row */}
        <div className="reveal-3d hide-scrollbar" style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '6px', marginBottom: 'var(--space-6)', WebkitOverflowScrolling: 'touch' }}>
          {SPEC_TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '8px 14px',
                  background: isActive ? 'var(--accent-cyan)' : 'var(--bg-elevated)',
                  color: isActive ? 'var(--text-inverse)' : 'var(--text-secondary)',
                  border: `1px solid ${isActive ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-xs)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'clamp(0.6875rem, 1.8vw, 0.75rem)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                  flexShrink: 0
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Spec Table */}
        <div className="hud-panel corner-reticle reveal-3d" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', minWidth: '480px', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--font-body)' }}>
              <thead>
                <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 16px', width: '40%' }}>PARAMETER / SUBSYSTEM</th>
                  <th style={{ padding: '12px 16px' }}>ENGINEERING SPECIFICATION & STANDARD</th>
                </tr>
              </thead>
              <tbody>
                {currentTab.specs.map((row, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: idx === currentTab.specs.length - 1 ? 'none' : '1px solid var(--border-subtle)',
                      background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.015)'
                    }}
                  >
                    <td style={{ padding: '10px 16px', fontFamily: 'var(--font-mono)', fontSize: 'clamp(0.75rem, 1.8vw, 0.8125rem)', color: 'var(--text-secondary)', fontWeight: 500 }}>
                      {row.param}
                    </td>
                    <td style={{ padding: '10px 16px', fontFamily: 'var(--font-mono)', fontSize: 'clamp(0.75rem, 1.8vw, 0.8125rem)', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {row.val}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ padding: '10px 16px', background: 'var(--bg-elevated)', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--text-muted)' }}>
            <span>DOC REV: 4.3.0-RELEASE // X4.3 PRODUCTION AUDIT</span>
            <span style={{ color: 'var(--status-nominal)' }}>DEMO PROTOTYPE BENCHMARK</span>
          </div>

          <div style={{
            padding: '8px 16px',
            background: 'rgba(255, 176, 32, 0.04)',
            borderTop: '1px solid rgba(255, 176, 32, 0.15)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.625rem',
            color: 'var(--text-muted)',
            lineHeight: 1.5
          }}>
            * Technical note: Gas sensor readings reflect raw analog ADC indications. Specifications document the built CyberRover X4.3 academic engineering prototype by Veer Pratap Saw. Regulated ATEX and submersible IP69K parameters apply to proposed X5 future development.
          </div>
        </div>
      </div>
    </section>
  );
}
