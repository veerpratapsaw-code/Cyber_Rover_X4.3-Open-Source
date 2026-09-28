import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, Play, RotateCcw, Volume2, ShieldAlert, Cpu, Sparkles, Check } from 'lucide-react';

const APPS = [
  { id: 'launcher', name: '01. LAUNCHER // HOME', icon: '☰' },
  { id: 'horn', name: '02. HORN SELECTOR', icon: '📢' },
  { id: 'tuner', name: '03. JOYSTICK TUNER', icon: '🎯' },
  { id: 'sysinfo', name: '04. SYSTEM TELEMETRY', icon: '⚡' },
  { id: 'radio', name: '05. ESP-NOW SCANNER', icon: '📡' },
  { id: 'dino', name: '06. DINO RUNNER ARCADE', icon: '🦖' },
  { id: 'settings', name: '07. FLASH NVS CONFIG', icon: '⚙️' }
];

const HORNS = [
  'CAR HORN (DUAL 440Hz)',
  'TRUCK AIR HORN (180Hz)',
  'HAZMAT POLICE SIREN',
  'REVERSE WARNING BEEP',
  'TOXIC GAS EVAC ALARM',
  'TIME BOMB PULSE 30s',
  'SOS MORSE CODE BEAT'
];

export default function CyberOSSimulator() {
  const [powerOn, setPowerOn] = useState(true);
  const [cyberOsActive, setCyberOsActive] = useState(true);
  const [parkingBrake, setParkingBrake] = useState(false);
  const [driveMode, setDriveMode] = useState('MANUAL'); // MANUAL or AUTO
  const [activeAppIndex, setActiveAppIndex] = useState(0);
  const [currentScreen, setCurrentScreen] = useState('launcher'); // 'launcher', 'horn', 'tuner', 'sysinfo', 'radio', 'dino', 'settings'
  const [selectedHorn, setSelectedHorn] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);
  
  // Joystick simulation coordinates (-100 to 100)
  const [joyL, setJoyL] = useState({ x: 0, y: 0 });
  const [joyR, setJoyR] = useState({ x: 0, y: 0 });
  const [dinoScore, setDinoScore] = useState(0);
  const [dinoJumping, setDinoJumping] = useState(false);
  const [dinoObstacleX, setDinoObstacleX] = useState(110);
  const [dinoGameOver, setDinoGameOver] = useState(false);
  const dinoRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 1800);
  };

  // Dino Game Loop
  useEffect(() => {
    if (currentScreen !== 'dino' || dinoGameOver) return;

    const interval = setInterval(() => {
      setDinoObstacleX((prev) => {
        if (prev <= -10) {
          setDinoScore((s) => s + 10);
          return 120;
        }
        // Collision check
        if (prev > 15 && prev < 35 && !dinoJumping) {
          setDinoGameOver(true);
        }
        return prev - 4;
      });
    }, 45);

    return () => clearInterval(interval);
  }, [currentScreen, dinoJumping, dinoGameOver]);

  const handleDinoJump = () => {
    if (dinoGameOver) {
      setDinoGameOver(false);
      setDinoScore(0);
      setDinoObstacleX(120);
      return;
    }
    if (!dinoJumping) {
      setDinoJumping(true);
      setTimeout(() => setDinoJumping(false), 420);
    }
  };

  // Joystick Tuner dragging simulation
  const handleJoyMove = (e, stick) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width - 0.5) * 200);
    const y = Math.round(((e.clientY - rect.top) / rect.height - 0.5) * 200);
    if (stick === 'L') setJoyL({ x: Math.max(-100, Math.min(100, x)), y: Math.max(-100, Math.min(100, -y)) });
    else setJoyR({ x: Math.max(-100, Math.min(100, x)), y: Math.max(-100, Math.min(100, -y)) });
  };

  const resetJoysticks = () => {
    setJoyL({ x: 0, y: 0 });
    setJoyR({ x: 0, y: 0 });
    showToast('POTS RE-CENTERED');
  };

  // Remote button interactions
  const handleButtonJL = () => {
    // Back button
    if (!cyberOsActive) {
      resetJoysticks();
    } else if (currentScreen !== 'launcher') {
      setCurrentScreen('launcher');
    } else {
      showToast('LAUNCHER ROOT');
    }
  };

  const handleButtonJR = () => {
    // Enter / Action
    if (currentScreen === 'launcher') {
      setCurrentScreen(APPS[activeAppIndex].id);
    } else if (currentScreen === 'dino') {
      handleDinoJump();
    } else if (currentScreen === 'horn') {
      setSelectedHorn((prev) => (prev + 1) % HORNS.length);
    } else {
      showToast('ACTION CONFIRMED');
    }
  };

  const handleButtonP1 = () => {
    // Save to NVS / Honk
    if (!cyberOsActive) {
      showToast(`HORN: ${HORNS[selectedHorn]}`);
    } else {
      showToast('NVS FLASH SAVED ✔');
    }
  };

  const handleButtonP2 = () => {
    // Auto / Manual mode
    setDriveMode((prev) => (prev === 'MANUAL' ? 'AUTO' : 'MANUAL'));
    showToast(`MODE: ${driveMode === 'MANUAL' ? 'AUTO ASSIST' : 'MANUAL 100%'}`);
  };

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
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: powerOn ? '#00e5ff' : '#ff4444', boxShadow: '0 0 10px #00e5ff' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#00e5ff', letterSpacing: '0.12em' }}>
              NODE 01 // HANDHELD REMOTE CONTROLLER
            </span>
          </div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 700, margin: '4px 0 0 0', color: '#fff' }}>
            Interactive Cyber OS OLED Simulator
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.8125rem', color: 'rgba(255, 255, 255, 0.6)' }}>
            1:1 Recreation of the Flipper-Zero styled firmware running on ESP32 Core 0 (35Hz UI) + Core 1 (100Hz ESP-NOW)
          </p>
        </div>

        {/* Physical Toggle Switches on the Remote */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {/* T1: Cyber OS Toggle */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '6px 12px',
            textAlign: 'center'
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'rgba(255, 255, 255, 0.5)' }}>TOGGLE T1</div>
            <button
              onClick={() => {
                setCyberOsActive(!cyberOsActive);
                setCurrentScreen('launcher');
                showToast(!cyberOsActive ? 'CYBER OS LOADED' : 'DRIVE HUD ACTIVE');
              }}
              style={{
                background: cyberOsActive ? '#00e5ff' : 'rgba(255, 255, 255, 0.1)',
                color: cyberOsActive ? '#07090c' : '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '0.6875rem',
                fontWeight: 700,
                cursor: 'pointer',
                marginTop: '4px',
                fontFamily: 'var(--font-mono)'
              }}
            >
              {cyberOsActive ? 'OS MODE [UP]' : 'HUD MODE [DN]'}
            </button>
          </div>

          {/* T2: Emergency Brake */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '6px 12px',
            textAlign: 'center'
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'rgba(255, 255, 255, 0.5)' }}>TOGGLE T2</div>
            <button
              onClick={() => {
                setParkingBrake(!parkingBrake);
                showToast(!parkingBrake ? '⚠ E-BRAKE ENGAGED' : 'BRAKE RELEASED');
              }}
              style={{
                background: parkingBrake ? '#ff3b30' : 'rgba(255, 255, 255, 0.1)',
                color: parkingBrake ? '#fff' : '#aaa',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '0.6875rem',
                fontWeight: 700,
                cursor: 'pointer',
                marginTop: '4px',
                fontFamily: 'var(--font-mono)'
              }}
            >
              {parkingBrake ? 'BRAKE [LOCKED]' : 'BRAKE [FREE]'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Handheld Interface: Left Joysticks, Center OLED, Right Controls */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
        gap: '24px',
        alignItems: 'center'
      }}>
        
        {/* Left Control Cluster: Steering Joystick & Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: '#00e5ff', letterSpacing: '0.08em' }}>
            LEFT JOYSTICK // THROTTLE & STEER
          </div>
          
          {/* Virtual Joystick Pad */}
          <div
            onMouseMove={(e) => handleJoyMove(e, 'L')}
            onMouseLeave={() => setJoyL({ x: 0, y: 0 })}
            style={{
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #1a222e 0%, #0d1219 70%, #07090c 100%)',
              border: '2px solid rgba(0, 217, 255, 0.3)',
              position: 'relative',
              cursor: 'crosshair',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 0 15px rgba(0,0,0,0.8), 0 0 20px rgba(0, 217, 255, 0.1)'
            }}
          >
            {/* Crosshair grid */}
            <div style={{ position: 'absolute', width: '100%', height: '1px', background: 'rgba(0, 217, 255, 0.15)' }} />
            <div style={{ position: 'absolute', height: '100%', width: '1px', background: 'rgba(0, 217, 255, 0.15)' }} />
            {/* Joystick Thumb */}
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2a374a, #151c27)',
              border: '2px solid #00e5ff',
              transform: `translate(${joyL.x * 0.4}px, ${-joyL.y * 0.4}px)`,
              boxShadow: '0 4px 12px rgba(0, 217, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.625rem',
              color: '#00e5ff',
              fontFamily: 'var(--font-mono)',
              userSelect: 'none'
            }}>
              LX/LY
            </div>
          </div>
          
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'rgba(255,255,255,0.6)' }}>
            X: {joyL.x} | Y: {joyL.y}
          </div>

          {/* Button JL (Back) & Button P1 (Save/Horn) */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleButtonJL}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#fff',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer'
              }}
            >
              JL [BACK / CALIB]
            </button>
            <button
              onClick={handleButtonP1}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                background: 'rgba(0, 217, 255, 0.15)',
                border: '1px solid rgba(0, 217, 255, 0.4)',
                color: '#00e5ff',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              P1 [SAVE / HONK]
            </button>
          </div>
        </div>

        {/* Center: OLED 128x64 Pixel Screen Recreation */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* OLED Bezel frame */}
          <div style={{
            width: '280px',
            height: '180px',
            background: '#04070a',
            border: '8px solid #141b24',
            borderRadius: '16px',
            padding: '12px',
            boxShadow: 'inset 0 0 25px rgba(0,0,0,0.9), 0 0 30px rgba(0, 229, 255, 0.15)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Top OLED Status Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px dashed #00e5ff',
              paddingBottom: '4px',
              fontFamily: 'Courier New, monospace',
              fontSize: '0.625rem',
              color: '#00e5ff'
            }}>
              <span>{driveMode}</span>
              <span>BAT: 12.4V</span>
              <span>CH:01 [100Hz]</span>
            </div>

            {/* Main OLED Canvas Display */}
            <div style={{
              flex: 1,
              marginTop: '6px',
              color: '#00e5ff',
              fontFamily: 'Courier New, monospace',
              position: 'relative',
              overflow: 'hidden',
              textShadow: '0 0 4px rgba(0, 229, 255, 0.7)'
            }}>
              {/* Toast Banner */}
              {toastMessage && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '10px',
                  right: '10px',
                  background: '#00e5ff',
                  color: '#000',
                  padding: '4px',
                  textAlign: 'center',
                  fontSize: '0.6875rem',
                  fontWeight: 'bold',
                  zIndex: 10,
                  borderRadius: '2px'
                }}>
                  {toastMessage}
                </div>
              )}

              {/* SCREEN: Driving HUD */}
              {!cyberOsActive ? (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-around' }}>
                  <div style={{ textAlign: 'center', fontSize: '0.8125rem', fontWeight: 'bold' }}>
                    --- DRIVING HUD ---
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '0.6875rem' }}>
                    <div>
                      <div>SPD: {Math.abs(joyL.y)}%</div>
                      <div>STR: {joyL.x > 0 ? `R+${joyL.x}` : `L${joyL.x}`}</div>
                    </div>
                    <div>
                      <div>E-BRAKE: {parkingBrake ? 'ENGAGED' : 'OFF'}</div>
                      <div>RADAR: CLEAR</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', fontSize: '0.5625rem', opacity: 0.7 }}>
                    FLIP T1 FOR CYBER OS LAUNCHER
                  </div>
                </div>
              ) : currentScreen === 'launcher' ? (
                /* SCREEN: 11-App Launcher */
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 'bold', marginBottom: '4px' }}>
                    CYBER OS // LAUNCHER
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.625rem' }}>
                    {APPS.slice(0, 4).map((app, idx) => (
                      <div
                        key={app.id}
                        onClick={() => {
                          setActiveAppIndex(idx);
                          setCurrentScreen(app.id);
                        }}
                        style={{
                          padding: '2px 4px',
                          background: activeAppIndex === idx ? '#00e5ff' : 'transparent',
                          color: activeAppIndex === idx ? '#000' : '#00e5ff',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}
                      >
                        <span>{app.name}</span>
                        <span>{app.icon}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 'auto', fontSize: '0.5rem', textAlign: 'center', opacity: 0.7 }}>
                    USE JR TO OPEN // JL TO BACK
                  </div>
                </div>
              ) : currentScreen === 'horn' ? (
                /* SCREEN: Horn Selector */
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 'bold' }}>HORN SELECTOR:</div>
                  <div style={{
                    border: '1px solid #00e5ff',
                    padding: '6px',
                    textAlign: 'center',
                    fontSize: '0.6875rem',
                    background: 'rgba(0, 229, 255, 0.1)'
                  }}>
                    {HORNS[selectedHorn]}
                  </div>
                  <div style={{ fontSize: '0.5625rem', textAlign: 'center' }}>
                    JR: CYCLE // P1: COMMIT FLASH
                  </div>
                </div>
              ) : currentScreen === 'tuner' ? (
                /* SCREEN: Dual Crosshairs Tuner */
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.625rem', fontWeight: 'bold' }}>DUAL CROSSHAIR TUNER</div>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
                    <div style={{ border: '1px solid #00e5ff', width: '45px', height: '45px', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '50%', width: '100%', height: '1px', background: 'rgba(0,229,255,0.4)' }} />
                      <div style={{ position: 'absolute', left: '50%', height: '100%', width: '1px', background: 'rgba(0,229,255,0.4)' }} />
                      <div style={{
                        position: 'absolute',
                        top: `${50 - joyL.y * 0.45}%`,
                        left: `${50 + joyL.x * 0.45}%`,
                        width: '4px',
                        height: '4px',
                        background: '#00e5ff',
                        borderRadius: '50%',
                        transform: 'translate(-50%, -50%)'
                      }} />
                    </div>
                    <div style={{ border: '1px solid #00e5ff', width: '45px', height: '45px', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '50%', width: '100%', height: '1px', background: 'rgba(0,229,255,0.4)' }} />
                      <div style={{ position: 'absolute', left: '50%', height: '100%', width: '1px', background: 'rgba(0,229,255,0.4)' }} />
                      <div style={{
                        position: 'absolute',
                        top: `${50 - joyR.y * 0.45}%`,
                        left: `${50 + joyR.x * 0.45}%`,
                        width: '4px',
                        height: '4px',
                        background: '#00e5ff',
                        borderRadius: '50%',
                        transform: 'translate(-50%, -50%)'
                      }} />
                    </div>
                  </div>
                  <div style={{ fontSize: '0.5625rem', marginTop: '4px' }}>DEADZONE: 120 | EXP: 1.4</div>
                </div>
              ) : currentScreen === 'dino' ? (
                /* SCREEN: Dino Runner Game */
                <div style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.625rem' }}>
                    <span>CHROME DINO</span>
                    <span>SCORE: {dinoScore}</span>
                  </div>
                  {/* Ground */}
                  <div style={{ position: 'absolute', bottom: '10px', left: 0, right: 0, height: '1px', background: '#00e5ff' }} />
                  {/* Dino */}
                  <div style={{
                    position: 'absolute',
                    bottom: dinoJumping ? '28px' : '11px',
                    left: '20px',
                    fontSize: '14px',
                    transition: 'bottom 0.15s ease'
                  }}>
                    🦖
                  </div>
                  {/* Obstacle Cactus */}
                  <div style={{
                    position: 'absolute',
                    bottom: '11px',
                    left: `${dinoObstacleX}px`,
                    fontSize: '12px'
                  }}>
                    🌵
                  </div>
                  {dinoGameOver && (
                    <div style={{
                      position: 'absolute',
                      top: '25px',
                      left: 0,
                      right: 0,
                      textAlign: 'center',
                      background: '#00e5ff',
                      color: '#000',
                      fontSize: '0.6875rem',
                      fontWeight: 'bold'
                    }}>
                      GAME OVER! JR TO RETRY
                    </div>
                  )}
                  <div style={{ position: 'absolute', bottom: '0px', width: '100%', textAlign: 'center', fontSize: '0.5rem' }}>
                    PRESS JR (STICK CLICK) TO JUMP
                  </div>
                </div>
              ) : (
                /* SCREEN: Sys Info / Settings */
                <div style={{ fontSize: '0.625rem', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ fontWeight: 'bold' }}>SYSTEM HARDWARE:</div>
                  <div>MCU: ESP32-D0WDQ6 (240MHz)</div>
                  <div>RTOS: CORE 0(35Hz) CORE 1(100Hz)</div>
                  <div>RADIO: ESP-NOW 2.4GHz RF</div>
                  <div>FLASH: 4MB SPI / NVS ACTIVE</div>
                  <div>BATTERY: 12.42V (3S LiPo)</div>
                </div>
              )}
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: '#00e5ff', marginTop: '8px' }}>
            0.96" SSD1306 OLED (128x64 FAST I2C 400kHz)
          </div>
        </div>

        {/* Right Control Cluster: Trim Joystick & Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: '#00e5ff', letterSpacing: '0.08em' }}>
            RIGHT JOYSTICK // TRIM & CURSOR
          </div>
          
          {/* Virtual Joystick Pad */}
          <div
            onMouseMove={(e) => handleJoyMove(e, 'R')}
            onMouseLeave={() => setJoyR({ x: 0, y: 0 })}
            style={{
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #1a222e 0%, #0d1219 70%, #07090c 100%)',
              border: '2px solid rgba(0, 217, 255, 0.3)',
              position: 'relative',
              cursor: 'crosshair',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 0 15px rgba(0,0,0,0.8), 0 0 20px rgba(0, 217, 255, 0.1)'
            }}
          >
            <div style={{ position: 'absolute', width: '100%', height: '1px', background: 'rgba(0, 217, 255, 0.15)' }} />
            <div style={{ position: 'absolute', height: '100%', width: '1px', background: 'rgba(0, 217, 255, 0.15)' }} />
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2a374a, #151c27)',
              border: '2px solid #00e5ff',
              transform: `translate(${joyR.x * 0.4}px, ${-joyR.y * 0.4}px)`,
              boxShadow: '0 4px 12px rgba(0, 217, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.625rem',
              color: '#00e5ff',
              fontFamily: 'var(--font-mono)',
              userSelect: 'none'
            }}>
              RX/RY
            </div>
          </div>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'rgba(255,255,255,0.6)' }}>
            X: {joyR.x} | Y: {joyR.y}
          </div>

          {/* Button JR (Enter) & Button P2 (Auto/Manual) */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleButtonJR}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                background: 'rgba(0, 217, 255, 0.2)',
                border: '1px solid #00e5ff',
                color: '#00e5ff',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              JR [ENTER / FORWARD]
            </button>
            <button
              onClick={handleButtonP2}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                background: driveMode === 'AUTO' ? '#ff9500' : 'rgba(255, 255, 255, 0.08)',
                border: `1px solid ${driveMode === 'AUTO' ? '#ff9500' : 'rgba(255, 255, 255, 0.2)'}`,
                color: driveMode === 'AUTO' ? '#000' : '#fff',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              P2 [{driveMode}]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
