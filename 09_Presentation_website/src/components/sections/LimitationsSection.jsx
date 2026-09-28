import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Thermometer, 
  Eye, 
  Radio, 
  Compass, 
  Cpu, 
  Flame, 
  Layers, 
  CheckCircle2, 
  HelpCircle,
  Zap
} from 'lucide-react';

const LIMITATION_ITEMS = [
  {
    id: 'gas_indication',
    icon: Flame,
    category: 'GAS SENSING ACCURACY',
    title: 'Analog Indication vs. Certified PPM',
    reality: 'MQ-4, MQ-7, and MQ-135 sensors deliver raw 10-bit analog ADC voltage counts (0–1023) sampled by an Arduino Nano.',
    boundary: 'Provides relative gas presence indication rather than certified parts-per-million (PPM) concentrations or legal occupational safety classifications. Cannot substitute for certified industrial gas detection instruments.',
    color: '#ff9500',
    tag: 'RAW ADC ONLY'
  },
  {
    id: 'thermal_range',
    icon: Thermometer,
    category: 'THERMAL & CLIMATE ENVELOPE',
    title: 'Ambient DHT11 Range vs. Fire Temperatures',
    reality: 'The physical rover carries a DHT11 sensor measuring ambient temperature (0°C to 50°C) and relative humidity (20% to 80% RH).',
    boundary: 'Strictly rated for room and ambient environments. Not engineered for fire-entry rescue, post-flashover thermal chambers, sub-zero cryogenic environments, or corrosive chemical gas streams.',
    color: '#00e5ff',
    tag: '0°C TO 50°C AMBIENT'
  },
  {
    id: 'acoustic_sonar',
    icon: Compass,
    category: 'ACOUSTIC PROXIMITY',
    title: 'Ultrasonic Sonar Reflection & Angle Limits',
    reality: '3× HC-SR04 ultrasonic transducers measure acoustic flight times across Left (-45°), Center (0°), and Right (+45°) forward sectors.',
    boundary: 'Subject to specular reflection where smooth surfaces angled > 45° bounce sound away without echo. Acoustic attenuation occurs in turbulent air, and obstacles below the 45mm chassis line remain in blind spots.',
    color: '#39e58c',
    tag: 'FORWARD 3-SECTOR'
  },
  {
    id: 'optical_camera',
    icon: Eye,
    category: 'OPTICAL RECONNAISSANCE',
    title: 'Smartphone Camera Environmental Dependencies',
    reality: 'Primary visual reconnaissance relies on a chassis-mounted smartphone streaming operator video over local Wi-Fi.',
    boundary: 'Visual clarity depends heavily on ambient light, onboard LED torch brightness, particulate smoke density, lens dust settlement, and physical shock isolation during rough-surface driving.',
    color: '#1677ff',
    tag: 'OPERATOR VISUAL FPV'
  },
  {
    id: 'wireless_rf',
    icon: Radio,
    category: 'WIRELESS & RF LINKS',
    title: 'Dual-Band RF & Subterranean Attenuation',
    reality: 'Decoupled architecture: Layer 1 uses 2.4GHz ESP-NOW for low-latency (<5ms) drive control; Layer 2 uses Sub-GHz Reyax RYLR998 LoRa (868/915 MHz) for resilient long-range telemetry penetration, complemented by local Wi-Fi video streaming.',
    boundary: 'While Sub-GHz LoRa penetrates deep subterranean strata and coal seams over 1+ km, high-bandwidth 2.4GHz video attenuates through thick reinforced concrete. RF packet loss triggers a 500ms safety watchdog auto-stop.',
    color: '#faad14',
    tag: 'LORA + ESP-NOW'
  },
  {
    id: 'mobility_traction',
    icon: Zap,
    category: 'CHASSIS MOBILITY',
    title: 'Terrain, Ground Clearance & Battery Capacity',
    reality: 'Driven by 4WD geared DC motors with differential skid steering powered by a compact 18650 3S1P Li-ion battery pack with integrated BMS (11.1V–12.6V) via an XT30 connector.',
    boundary: 'Mobility is physically constrained by a 45mm ground clearance, wheel tread friction on wet or loose gravel, DC motor thermal dissipation under high torque, and battery discharge curves.',
    color: '#00e5ff',
    tag: '45mm CLEARANCE'
  },
  {
    id: 'control_autonomy',
    icon: Cpu,
    category: 'CONTROL PARADIGM',
    title: 'Operator-Controlled vs. Full Autonomy',
    reality: 'CyberRover X4.3 is an operator-controlled reconnaissance rover using a handheld ESP32 remote with ultrasonic proximity warning assistance and animated OLED RoboEyes status.',
    boundary: 'Current rover does NOT possess autonomous SLAM navigation, automated target interception, or AI computer vision. These capabilities represent experimental lab research and future roadmap items.',
    color: '#ff4d4f',
    tag: 'OPERATOR CONTROLLED'
  },
  {
    id: 'regulatory_status',
    icon: ShieldAlert,
    category: 'REGULATORY CERTIFICATION',
    title: 'Prototype Status & Non-Certified Deployment',
    reality: 'Built as an academic and student engineering demonstration prototype by Veer Pratap Saw for hazardous reconnaissance and coalfield research.',
    boundary: 'CyberRover X4.3 is NOT explosion-proof (ATEX / IECEx), NOT intrinsically safe, NOT coal-mining certified, NOT fire-entry certified, and NOT military defense certified. Regulated certifications apply only to the proposed X5 roadmap.',
    color: '#ff4d4f',
    tag: 'NOT CERTIFIED'
  }
];

export default function LimitationsSection() {
  const [selectedItem, setSelectedItem] = useState(0);
  const active = LIMITATION_ITEMS[selectedItem];

  return (
    <section
      id="limitations"
      className="story-stage"
      style={{
        background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-base) 100%)',
        position: 'relative',
        overflow: 'hidden',
        padding: 'clamp(60px, 10vh, 110px) 0'
      }}
    >
      {/* Background Monumental Typography */}
      <div style={{
        position: 'absolute',
        top: '4%',
        right: '2%',
        fontFamily: 'var(--font-heading)',
        fontSize: 'clamp(4.5rem, 15vw, 15rem)',
        fontWeight: 900,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        lineHeight: 0.8,
        background: 'linear-gradient(180deg, rgba(255, 176, 32, 0.16) 0%, rgba(255, 77, 79, 0.03) 75%, transparent 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: 0
      }}>
        LIMITS
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Chapter Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--status-warning)', boxShadow: '0 0 10px var(--status-warning)' }} />
          <div className="chapter-number reveal-3d" style={{ color: 'var(--status-warning)', margin: 0 }}>
            06 // ENGINEERING TRANSPARENCY & FIELD BOUNDARIES
          </div>
        </div>

        {/* Section Headline */}
        <div className="reveal-3d" style={{ maxWidth: '840px', marginBottom: 'var(--space-8)' }}>
          <div style={{
            display: 'inline-block',
            padding: '4px 12px',
            background: 'rgba(57, 229, 140, 0.1)',
            border: '1px solid rgba(57, 229, 140, 0.3)',
            borderRadius: 'var(--radius-xs)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            color: 'var(--status-nominal)',
            fontWeight: 700,
            marginBottom: '12px'
          }}>
            CURRENT X4.3 // HONEST TECHNICAL AUDIT & BOUNDARIES
          </div>

          <h2 className="section-headline" style={{ marginBottom: 'var(--space-4)' }}>
            Current Prototype Limitations & Operational Scope
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem', lineHeight: 1.7 }}>
            Engineering integrity requires complete clarity about what a system can and cannot do. CyberRover X4.3 is a functional engineering prototype designed and built by Veer Pratap Saw to test and prove multi-sensor remote reconnaissance concepts in challenging environments. The following operational boundaries define the physical hardware currently built and demonstrated.
          </p>
        </div>

        {/* Interactive Master-Detail Limitations Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: 'clamp(1.25rem, 2.5vw, 2rem)',
          marginBottom: 'var(--space-8)'
        }}>
          {LIMITATION_ITEMS.map((item, idx) => {
            const IconComponent = item.icon;
            const isSelected = selectedItem === idx;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(idx)}
                className="reveal-3d"
                style={{
                  background: isSelected ? 'var(--bg-elevated)' : 'rgba(16, 20, 26, 0.75)',
                  border: `1px solid ${isSelected ? item.color : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-sm)',
                  padding: 'clamp(20px, 2.5vw, 26px)',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  boxShadow: isSelected ? `0 0 24px ${item.color}25` : 'none',
                  position: 'relative'
                }}
              >
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: 'var(--radius-xs)',
                      background: `${item.color}18`,
                      border: `1px solid ${item.color}40`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: item.color,
                      flexShrink: 0
                    }}>
                      <IconComponent size={18} />
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                        {item.category}
                      </div>
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                        {item.title}
                      </div>
                    </div>
                  </div>

                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.5625rem',
                    color: item.color,
                    background: `${item.color}15`,
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-xs)',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}>
                    {item.tag}
                  </span>
                </div>

                {/* Built Reality */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--status-nominal)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={12} />
                    <span>PHYSICAL ROVER IMPLEMENTATION:</span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                    {item.reality}
                  </p>
                </div>

                {/* Operational Boundary */}
                <div style={{
                  padding: '10px 14px',
                  background: 'rgba(0, 0, 0, 0.35)',
                  borderLeft: `2px solid ${item.color}`,
                  borderRadius: '0 var(--radius-xs) var(--radius-xs) 0'
                }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: item.color, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={12} />
                    <span>OPERATIONAL BOUNDARY / LIMITATION:</span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.55, margin: 0 }}>
                    {item.boundary}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Prominent Legal & Engineering Disclaimer Banner */}
        <div className="reveal-3d" style={{
          padding: 'clamp(14px, 2.5vw, 20px)',
          background: 'linear-gradient(135deg, rgba(255, 77, 79, 0.08), rgba(255, 176, 32, 0.05))',
          border: '1px solid rgba(255, 77, 79, 0.35)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px'
        }}>
          <div style={{
            padding: '8px',
            borderRadius: 'var(--radius-xs)',
            background: 'rgba(255, 77, 79, 0.15)',
            color: 'var(--status-hazard)',
            marginTop: '2px'
          }}>
            <ShieldAlert size={22} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Summary Statement on Regulatory Certification & Deployment Scope
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              CyberRover X4.3 is a student-built engineering prototype for remote reconnaissance and environmental inspection research designed and created by Veer Pratap Saw. It is not currently certified for explosion-proof, intrinsically safe, mining, fire-entry, or military deployment. Any specifications or operational claims describing ATEX Zone 0/1 enclosures, IP69K submersion, or autonomous SLAM navigation represent proposed future engineering development under the CyberRover X5 roadmap.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
