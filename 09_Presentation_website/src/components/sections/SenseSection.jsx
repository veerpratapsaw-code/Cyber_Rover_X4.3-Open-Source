import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Thermometer, Wind, Zap, ChevronLeft, ChevronRight, CheckCircle2, ArrowRight, Navigation, BatteryCharging } from 'lucide-react';
import SensorBar from '../ui/SensorBar';
import sensorMq4Img from '../../assets/sensor_mq4.jpg';
import sensorMq7Img from '../../assets/sensor_mq7.jpg';
import sensorMq135Img from '../../assets/sensor_mq135.jpg';
import sensorDht22Img from '../../assets/sensor_dht22.jpg';
import sensorBmp280Img from '../../assets/sensor_bmp280.jpg';
import sensorGpsImg from '../../assets/cyberrover_x43_rear_gas.jpg';
import sensorBatteryImg from '../../assets/real_battery_3s1p.jpg';

const SENSOR_MODULES = [
  {
    id: 0,
    code: 'MQ-4',
    name: 'MQ-4 RAW ADC — Methane & Combustible-Gas Indication',
    image: sensorMq4Img,
    tech: 'SnO2 Semiconductor Gas Indication Sensor',
    targets: 'Methane (CH4), Natural Gas, Coal Mine Fire-Damp',
    work: 'Analog indication sensor for detection of combustible methane gas. Acquired via Arduino Nano 10-bit analog input (0-1023 ADC counts) to indicate relative gas presence before human entry.',
    spec: 'RAW ANALOG ADC / PROTOTYPE INDICATION (NOT CERTIFIED PPM)'
  },
  {
    id: 1,
    code: 'MQ-7',
    name: 'MQ-7 RAW ADC — Carbon Monoxide Indication',
    image: sensorMq7Img,
    tech: 'Dual-Cycle Micro Thermal Indication Sensor',
    targets: 'Carbon Monoxide (CO) — Colorless & Odorless',
    work: 'Operates on periodic thermal cycling (5V heating cycle, 1.4V measurement cycle) to provide analog indication of carbon monoxide presence in enclosed voids.',
    spec: 'RAW ANALOG ADC / PROTOTYPE INDICATION (NOT CERTIFIED PPM)'
  },
  {
    id: 2,
    code: 'MQ-135',
    name: 'MQ-135 RAW ADC — Air-Quality Indication',
    image: sensorMq135Img,
    tech: 'Broadband Volatile Gas Sensing Core',
    targets: 'Ammonia (NH3), NOx, Alcohol, Benzene, Volatile Smoke',
    work: 'Monitors relative changes in ambient air quality and volatile solvents, streaming analog indication readings to the ground dashboard.',
    spec: 'RAW ANALOG ADC / PROTOTYPE INDICATION (NOT CERTIFIED PPM)'
  },
  {
    id: 3,
    code: 'BMP-280',
    name: 'BMP280 — Barometric Pressure & Relative Elevation',
    image: sensorBmp280Img,
    tech: 'Piezoresistive Micro-Electro-Mechanical (MEMS)',
    targets: 'Atmospheric Barometric Pressure (hPa) & Relative Elevation',
    work: 'Measures barometric pressure (300 to 1100 hPa) with relative altitude estimation to help operators assess vertical elevation changes in collapsed structures or shafts.',
    spec: 'FAST I2C / SPI BUS / RELATIVE ELEVATION ESTIMATION'
  },
  {
    id: 4,
    code: 'DHT-11',
    name: 'DHT11 — Ambient Temperature & Relative Humidity',
    image: sensorDht22Img,
    tech: 'Resistive Humidity Polymer + NTC Thermistor',
    targets: 'Ambient Temperature & Ambient Relative Humidity',
    work: 'Provides digital 1-wire ambient temperature (0°C to 50°C) and relative humidity (20% to 80% RH) readings for local environmental monitoring. Not designed for extreme industrial or fire temperatures.',
    spec: 'DIGITAL 1-WIRE BUS / AMBIENT RANGE (0°C TO 50°C)'
  },
  {
    id: 5,
    code: 'NEO-6M',
    name: 'u-blox NEO-6M — Geospatial GPS & Speed Engine',
    image: sensorGpsImg,
    tech: '50-Channel High Sensitivity Satellite Navigation',
    targets: 'Latitude, Longitude, Altitude, Ground Speed, Satellites',
    work: 'Streams NMEA 0183 sentences at 9600 baud directly into the Arduino Nano Layer 2 Master, broadcasting real-time mission coordinates over Reyax LoRa to the ground cockpit.',
    spec: 'NMEA 0183 / 9600 BAUD / DGPS POSITIONING FIX'
  },
  {
    id: 6,
    code: '3S-DIV',
    name: '3S Battery Resistor Divider — Power Rail Monitor',
    image: sensorBatteryImg,
    tech: 'Precision Dual-Resistor Calibrated Divider (0–15V)',
    targets: 'Pack Voltage (9.0V–12.6V), State of Charge, Bus Health',
    work: 'Scales down the 12.6V 3S Li-ion battery rail to safe analog levels for the Arduino Nano ADC, providing continuous battery bus monitoring and low-voltage return-to-base warnings.',
    spec: 'CALIBRATED ANALOG ADC / VOLTAGE DIVIDER BUS'
  }
];

export default function SenseSection({ telemetry }) {
  const [activeSensor, setActiveSensor] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  // Auto-cycle sensor carousel every 4 seconds when not hovered
  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setActiveSensor((prev) => (prev + 1) % SENSOR_MODULES.length);
      }, 4000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  const nextSensor = () => {
    setActiveSensor((prev) => (prev + 1) % SENSOR_MODULES.length);
  };

  const prevSensor = () => {
    setActiveSensor((prev) => (prev - 1 + SENSOR_MODULES.length) % SENSOR_MODULES.length);
  };

  const currentMod = SENSOR_MODULES[activeSensor];

  return (
    <section
      id="sensing"
      className="story-stage"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        background: 'var(--bg-base)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
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
        TELEMETRY
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="chapter-number reveal-3d">04 // ENVIRONMENTAL SENSING SUITE (SENSE)</div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: 'clamp(1.5rem, 4vw, 3.5rem)',
          alignItems: 'center'
        }}>
          {/* Left Column: Interactive Sensor Hardware Carousel */}
          <div>
            <div className="hud-panel corner-reticle reveal-3d" style={{ padding: '0', overflow: 'hidden', position: 'relative', marginBottom: 'var(--space-4)' }}>
              <div style={{ position: 'relative', width: '100%', minHeight: '280px', overflow: 'hidden' }}>
                <img
                  key={currentMod.id}
                  src={currentMod.image}
                  alt={currentMod.name}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    filter: 'contrast(1.08) brightness(1.02)',
                    transition: 'transform 0.4s ease, opacity 0.3s ease',
                    animation: 'fadeIn 0.4s ease'
                  }}
                />

                {/* Sensor Tag Badge */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  padding: '5px 12px',
                  background: 'rgba(7, 9, 12, 0.9)',
                  border: '1px solid var(--accent-cyan)',
                  borderRadius: 'var(--radius-xs)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  color: 'var(--accent-cyan)',
                  fontWeight: 700,
                  boxShadow: '0 0 16px rgba(0, 217, 255, 0.35)'
                }}>
                  {currentMod.code} // CALIBRATED
                </div>

                {/* Left/Right Carousel Controls */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '12px',
                  right: '12px',
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  pointerEvents: 'none'
                }}>
                  <button
                    onClick={prevSensor}
                    aria-label="Previous Sensor"
                    style={{
                      pointerEvents: 'auto',
                      width: '38px',
                      height: '38px',
                      borderRadius: 'var(--radius-xs)',
                      background: 'rgba(7, 9, 12, 0.85)',
                      border: '1px solid var(--border-medium)',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      backdropFilter: 'blur(8px)'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-cyan)'; e.currentTarget.style.color = 'var(--accent-cyan)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-medium)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button
                    onClick={nextSensor}
                    aria-label="Next Sensor"
                    style={{
                      pointerEvents: 'auto',
                      width: '38px',
                      height: '38px',
                      borderRadius: 'var(--radius-xs)',
                      background: 'rgba(7, 9, 12, 0.85)',
                      border: '1px solid var(--border-medium)',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      backdropFilter: 'blur(8px)'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-cyan)'; e.currentTarget.style.color = 'var(--accent-cyan)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-medium)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                {/* Bottom Carousel Indicator Dots */}
                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: '6px',
                  background: 'rgba(7, 9, 12, 0.8)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  backdropFilter: 'blur(6px)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  {SENSOR_MODULES.map((mod, idx) => (
                    <button
                      key={mod.id}
                      onClick={() => setActiveSensor(idx)}
                      aria-label={`Go to sensor ${idx + 1}`}
                      style={{
                        width: activeSensor === idx ? '20px' : '6px',
                        height: '6px',
                        borderRadius: 'var(--radius-full)',
                        background: activeSensor === idx ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.25)',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.25s ease'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Bottom Sensor Spec Strip */}
              <div style={{
                padding: '12px 18px',
                background: 'var(--bg-elevated)',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                color: 'var(--accent-cyan)'
              }}>
                <span>{currentMod.spec}</span>
                <span style={{ color: 'var(--status-nominal)' }}>RAW ANALOG ADC</span>
              </div>
            </div>

            {/* Sensor Operation Description */}
            <div className="reveal-3d" style={{
              padding: '14px 16px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xs)'
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--accent-cyan)', marginBottom: '4px' }}>
                // SENSING PRINCIPLE & MECHANISM
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
                {currentMod.work}
              </p>
            </div>
          </div>

          {/* Right Column: Live Raw ADC Telemetry Gauges (Click to Switch Carousel) */}
          <div className="reveal-3d">
            <h2 className="section-headline" style={{ marginBottom: 'var(--space-2)' }}>
              Environmental Telemetry & Gas Indication
            </h2>
            <p style={{ color: 'var(--accent-cyan)', marginBottom: 'var(--space-2)', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)' }}>
              RAW ANALOG INDICATION GAUGES & RELATIVE THRESHOLDS (CLICK TO INSPECT)
            </p>

            {/* Required Technical Accuracy Disclaimer */}
            <div style={{
              padding: '8px 12px',
              background: 'rgba(255, 176, 32, 0.05)',
              border: '1px solid rgba(255, 176, 32, 0.25)',
              borderRadius: 'var(--radius-xs)',
              marginBottom: 'var(--space-4)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5
            }}>
              <strong style={{ color: 'var(--status-warning)' }}>TECHNICAL DISCLAIMER:</strong> MQ sensor outputs are prototype-level analog indications. They are not certified ppm measurements or definitive hazard classifications. Displayed readings represent simulated demo values.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* MQ-4 Methane Card */}
              <div
                onClick={() => setActiveSensor(0)}
                style={{
                  cursor: 'pointer',
                  border: `1px solid ${activeSensor === 0 ? 'var(--accent-cyan)' : 'transparent'}`,
                  borderRadius: 'var(--radius-xs)',
                  transition: 'all 0.25s ease',
                  padding: '2px',
                  boxShadow: activeSensor === 0 ? '0 0 20px rgba(0, 217, 255, 0.2)' : 'none'
                }}
              >
                <SensorBar
                  label="Methane (CH4) Indication"
                  code="MQ-4"
                  value={telemetry.mq4Methane}
                  unit="ADC (Demo)"
                  min={0}
                  max={500}
                  warnThreshold={180}
                  dangerThreshold={350}
                  description="Analog indication of combustible gas presence. Raw ADC value."
                  targetGases="Methane (CH4), Natural Gas, CNG"
                />
              </div>

              {/* MQ-7 Carbon Monoxide Card */}
              <div
                onClick={() => setActiveSensor(1)}
                style={{
                  cursor: 'pointer',
                  border: `1px solid ${activeSensor === 1 ? 'var(--status-hazard)' : 'transparent'}`,
                  borderRadius: 'var(--radius-xs)',
                  transition: 'all 0.25s ease',
                  padding: '2px',
                  boxShadow: activeSensor === 1 ? '0 0 20px rgba(255, 77, 79, 0.25)' : 'none'
                }}
              >
                <SensorBar
                  label="Carbon Monoxide (CO) Indication"
                  code="MQ-7"
                  value={telemetry.mq7CO}
                  unit="ADC (Demo)"
                  min={0}
                  max={100}
                  warnThreshold={30}
                  dangerThreshold={60}
                  description="Analog thermal-cycled indication of carbon monoxide presence."
                  targetGases="Carbon Monoxide (CO)"
                />
              </div>

              {/* MQ-135 Air Quality Card */}
              <div
                onClick={() => setActiveSensor(2)}
                style={{
                  cursor: 'pointer',
                  border: `1px solid ${activeSensor === 2 ? 'var(--status-warning)' : 'transparent'}`,
                  borderRadius: 'var(--radius-xs)',
                  transition: 'all 0.25s ease',
                  padding: '2px',
                  boxShadow: activeSensor === 2 ? '0 0 20px rgba(250, 173, 20, 0.25)' : 'none'
                }}
              >
                <SensorBar
                  label="Broad Air Quality Indication"
                  code="MQ-135"
                  value={telemetry.mq135AirQuality}
                  unit="ADC (Demo)"
                  min={0}
                  max={600}
                  warnThreshold={250}
                  dangerThreshold={450}
                  description="Analog broadband indication of air quality and volatile solvents."
                  targetGases="Volatiles, NH3, Smoke"
                />
              </div>

              {/* DHT-11 Temp & Humidity Cards */}
              <div
                onClick={() => setActiveSensor(4)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  cursor: 'pointer',
                  border: `1px solid ${activeSensor === 4 ? 'var(--accent-blue)' : 'transparent'}`,
                  borderRadius: 'var(--radius-sm)',
                  padding: '2px',
                  boxShadow: activeSensor === 4 ? '0 0 20px rgba(22, 119, 255, 0.25)' : 'none',
                  transition: 'all 0.25s ease'
                }}
              >
                <div style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '100px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--accent-cyan)', marginBottom: '8px' }}>
                    <Thermometer size={14} />
                    <span>DHT11 AMBIENT TEMP</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2, margin: '2px 0 6px 0' }}>
                    {telemetry.temperature}°C
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>Ambient Range: 0°C to 50°C</div>
                </div>

                <div style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '100px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--accent-cyan)', marginBottom: '8px' }}>
                    <Wind size={14} />
                    <span>DHT11 HUMIDITY</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2, margin: '2px 0 6px 0' }}>
                    {telemetry.humidity}%
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>Ambient Range: 20% to 80% RH</div>
                </div>
              </div>

              {/* GPS & Battery Voltage Telemetry Cards */}
              <div
                onClick={() => setActiveSensor(5)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  cursor: 'pointer',
                  border: `1px solid ${activeSensor === 5 ? 'var(--accent-cyan)' : 'transparent'}`,
                  borderRadius: 'var(--radius-sm)',
                  padding: '2px',
                  boxShadow: activeSensor === 5 ? '0 0 20px rgba(0, 217, 255, 0.25)' : 'none',
                  transition: 'all 0.25s ease'
                }}
              >
                <div style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '100px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--accent-cyan)', marginBottom: '8px' }}>
                    <Navigation size={14} />
                    <span>NEO-6M GPS COORDINATES</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2, margin: '2px 0 6px 0' }}>
                    {telemetry.gpsLatitude || '23.6345'}°N, {telemetry.gpsLongitude || '85.5123'}°E
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--status-nominal)', lineHeight: 1.4 }}>
                    {telemetry.gpsSatellites || 9} SATS // {telemetry.gpsFix || '3D DGPS LOCK'}
                  </div>
                </div>

                <div
                  onClick={(e) => { e.stopPropagation(); setActiveSensor(6); }}
                  style={{
                    background: 'var(--bg-elevated)',
                    border: `1px solid ${activeSensor === 6 ? 'var(--status-nominal)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '100px',
                    boxShadow: activeSensor === 6 ? '0 0 20px rgba(57, 229, 140, 0.25)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--accent-cyan)', marginBottom: '8px' }}>
                    <BatteryCharging size={14} />
                    <span>3S PACK BUS VOLTAGE</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.35rem', fontWeight: 700, color: 'var(--status-nominal)', lineHeight: 1.2, margin: '2px 0 6px 0' }}>
                    {telemetry.batteryVoltage} V
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>Nominal 11.1V / 12.6V Peak</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* INTERACTIVE BMP280 STRUCTURAL ELEVATION SIMULATOR         */}
        {/* ========================================================= */}
        <div className="reveal-3d" style={{
          marginTop: 'clamp(3rem, 6vw, 4.5rem)',
          background: 'linear-gradient(145deg, rgba(16, 20, 26, 0.95), rgba(7, 9, 12, 0.98))',
          border: '1px solid rgba(0, 217, 255, 0.25)',
          borderRadius: '24px',
          padding: 'clamp(20px, 3.5vw, 32px)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: '#00e5ff', letterSpacing: '0.1em' }}>
                BMP280 MEMS BAROMETRIC CORE // I2C BUS
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, margin: '2px 0 0 0', color: '#fff' }}>
                Structural Altitude & Mine Shaft Gas Dispersion Simulator
              </h3>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#39e58c', background: 'rgba(57, 229, 140, 0.1)', padding: '4px 10px', borderRadius: '6px', border: '1px solid #39e58c' }}>
              REAL-TIME SUB-METER CALCULATION
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
            gap: '20px',
            alignItems: 'center'
          }}>
            {/* Slider Control */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)' }}>
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>PROBE DEPTH / ELEVATION:</span>
                <span style={{ color: '#00e5ff', fontWeight: 'bold' }}>{telemetry.altitude || 12} METERS</span>
              </div>
              <input
                type="range"
                min="-20"
                max="40"
                defaultValue="12"
                id="elevationSlider"
                style={{
                  width: '100%',
                  accentColor: '#00e5ff',
                  cursor: 'pointer'
                }}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  const pEl = document.getElementById('dispPressure');
                  const mEl = document.getElementById('dispMethane');
                  const cEl = document.getElementById('dispStatus');
                  if (pEl) pEl.innerText = (1013.25 - (val * 0.12)).toFixed(2) + ' hPa';
                  if (mEl) mEl.innerText = Math.max(80, Math.round(180 + (val * 12))) + ' RAW ADC';
                  if (cEl) {
                    if (val > 25) {
                      cEl.innerText = '⚠ WARNING: ELEVATED COMBUSTIBLE GAS INDICATION';
                      cEl.style.color = '#ff9500';
                    } else if (val < -10) {
                      cEl.innerText = '⚠ ELEVATED CO ACCUMULATION INDICATION';
                      cEl.style.color = '#ff4444';
                    } else {
                      cEl.innerText = '● NOMINAL BASELINE INDICATION';
                      cEl.style.color = '#39e58c';
                    }
                  }
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.625rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                <span>-20m (Underground Shaft)</span>
                <span>0m (Ground Zero)</span>
                <span>+40m (Upper Conduit)</span>
              </div>
            </div>

            {/* Real-time Computed Values */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'rgba(255,255,255,0.5)' }}>BMP280 PRESSURE (hPa)</div>
                <div id="dispPressure" style={{ fontFamily: 'var(--font-mono)', fontSize: '1.125rem', fontWeight: 'bold', color: '#00e5ff', marginTop: '2px' }}>
                  1011.81 hPa
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'rgba(255,255,255,0.5)' }}>MQ-4 CH4 INDICATION [DEMO]</div>
                <div id="dispMethane" style={{ fontFamily: 'var(--font-mono)', fontSize: '1.125rem', fontWeight: 'bold', color: '#ff9500', marginTop: '2px' }}>
                  324 RAW ADC
                </div>
              </div>
            </div>
          </div>

          <div id="dispStatus" style={{ marginTop: '14px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#39e58c', textAlign: 'center' }}>
            ● NOMINAL BASELINE INDICATION
          </div>
        </div>
      </div>
    </section>
  );
}
