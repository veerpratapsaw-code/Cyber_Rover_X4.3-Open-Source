/**
 * ============================================================================
 * CYBERROVER // MINIMAL GROUND COMMAND COCKPIT JAVASCRIPT ENGINE
 * Full Keyboard Shortcuts, Auto-Torch in Darkness & Real-Time Telemetry
 * ============================================================================
 */

// Global App State & Config
const state = {
  phoneIp: localStorage.getItem('cyberrover_phone_ip') || '10.75.5.238:8080',
  espIp: localStorage.getItem('cyberrover_esp_ip') || '192.168.43.101',
  torchState: false,
  autoTorch: false,
  autoTorchTriggered: false,
  camFacingFront: false,
  zoomLevel: 0,
  calPitchOffset: parseFloat(localStorage.getItem('cyberrover_pitch_offset') || '0'),
  calRollOffset: parseFloat(localStorage.getItem('cyberrover_roll_offset') || '0'),
  lastRawPitch: 0,
  lastRawRoll: 0,
  gasPollTimer: null,
  phonePollTimer: null,
  clockTimer: null
};

// Live Telemetry Cache for Real-Time Responsive Oscilloscope
const liveTelemetry = {
  ch4: 0,
  co: 0,
  co2: 0,
  gforce: 1.0,
  pitch: 0,
  roll: 0,
  espConnected: false,
  phoneConnected: false
};

// Continuous Time-Series Multi-Channel Buffers (65 Data Points)
const BUFFER_SIZE = 65;
const graphBuffers = {
  ch4: new Array(BUFFER_SIZE).fill(0.08),
  co: new Array(BUFFER_SIZE).fill(0.15),
  co2: new Array(BUFFER_SIZE).fill(0.22),
  gforce: new Array(BUFFER_SIZE).fill(0.34),
  roll: new Array(BUFFER_SIZE).fill(0.50),
  pitch: new Array(BUFFER_SIZE).fill(0.68)
};

// ============================================================================
// 1. INITIALIZATION ON DOM READY
// ============================================================================

window.addEventListener('DOMContentLoaded', () => {
  // Populate saved IP inputs
  document.getElementById('phoneIp').value = state.phoneIp;
  document.getElementById('espIp').value = state.espIp;

  // Initialize Single Black-Grey Circle Cursor (Zero Lag)
  initCustomCursor();

  // Initialize Keyboard Shortcuts & Enter-to-Lock
  initKeyboardShortcuts();

  // Clear any legacy UI scale transform
  localStorage.removeItem('cyberrover_ui_scale');

  // Initialize Draggable Inter-Column Splitter
  initColumnResizer();

  // Initialize Real-time Dynamic 6-Channel Oscilloscope
  initTelemetryGraph();

  // Initialize Tactical Picture-in-Picture (PiP) GPS Map (Red Box)
  initPipMap();

  // Start HUD Clock
  startHudClock();

  // Connect Video Feed
  refreshVideoFeed();

  // Start Telemetry Polling Loops
  startTelemetryLoops();
});

// ============================================================================
// 2. SINGLE SLEEK BLACK-GREY CIRCLE CURSOR (Direct 1:1, Zero Lag)
// ============================================================================

function initCustomCursor() {
  const dot = document.getElementById('cursorDot');
  if (!dot) return;

  // Instant direct 1:1 tracking without trailing lag
  window.addEventListener('mousemove', (e) => {
    dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  });

  // Hover expansion triggers
  const hoverSelectors = 'button, input, .hover-target, .tool-pill, .pill-btn, .gas-item, .climate-box, .health-box, .incline-metric, .legend-pill';
  
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverSelectors)) {
      document.body.classList.add('cursor-hover');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverSelectors)) {
      document.body.classList.remove('cursor-hover');
    }
  });
}

// ============================================================================
// 3. KEYBOARD SHORTCUTS & INPUT HANDLING
// ============================================================================

function initKeyboardShortcuts() {
  // 1. Enter Key Listener on IP Inputs
  const phoneInput = document.getElementById('phoneIp');
  const espInput = document.getElementById('espIp');

  [phoneInput, espInput].forEach(input => {
    if (!input) return;
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        applyNetworkSettings();
        input.blur(); // Release focus so hotkeys work immediately
      }
    });
  });

  // 2. Global Hotkeys Dispatcher
  window.addEventListener('keydown', (e) => {
    // If typing inside an input field, do not intercept hotkeys
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    // CRITICAL FIX: If user is pressing Ctrl or Meta (e.g. Ctrl + +, Ctrl + -, Ctrl + 0),
    // NEVER intercept! Allow browser native zoom to work freely and smoothly!
    if (e.ctrlKey || e.metaKey) {
      return;
    }

    const key = e.key.toLowerCase();

    switch (key) {
      case 't': // T: Toggle Torch
        e.preventDefault();
        togglePhoneTorch();
        break;

      case 'a': // A: Toggle Auto Torch
        e.preventDefault();
        toggleAutoTorch();
        break;

      case 'f': // F: Flip Camera (Front / Rear)
        e.preventDefault();
        switchCamera();
        break;

      case 's': // S: Snapshot
        e.preventDefault();
        captureSnapshot();
        break;

      case 'p': // P: Digital Camera Zoom In
        e.preventDefault();
        adjustZoom(1);
        break;

      case 'm': // M: Digital Camera Zoom Out
        e.preventDefault();
        adjustZoom(-1);
        break;

      case 'z': // Z: Zero Calibrate Horizon
        e.preventDefault();
        zeroCalibrateOrientation();
        break;

      case 'enter': // Enter: Lock IPs
        e.preventDefault();
        applyNetworkSettings();
        break;
    }
  });
}

// ============================================================================
// 4. REAL-TIME SMOOTH SPLINE OSCILLOSCOPE GRAPH ENGINE (60 FPS)
// ============================================================================

function initTelemetryGraph() {
  const canvas = document.getElementById('telemetryCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
  }
  resize();
  window.addEventListener('resize', resize);

  // 6 Distinct Channels with Individual Color Specs and Non-Overlapping Baselines
  const channels = [
    { key: 'ch4', color: '#FF5500', fill: 'rgba(255, 85, 0, 0.08)' },
    { key: 'co', color: '#FF334B', fill: 'rgba(255, 51, 75, 0.08)' },
    { key: 'co2', color: '#FFB300', fill: 'rgba(255, 179, 0, 0.06)' },
    { key: 'gforce', color: '#FFFFFF', fill: 'rgba(255, 255, 255, 0.06)' },
    { key: 'roll', color: '#00E676', fill: 'rgba(0, 230, 118, 0.07)' },
    { key: 'pitch', color: '#00E5FF', fill: 'rgba(0, 229, 255, 0.07)' }
  ];

  // Synchronized High-Frequency Sampling Loop (40ms / 25 Hz)
  setInterval(() => {
    // 1. CH4 Methane Channel (Baseline: 8%, Surges up to 92%)
    let normCh4 = 0.08;
    if (liveTelemetry.espConnected) {
      normCh4 = 0.08 + (Math.max(0, Math.min(1023, liveTelemetry.ch4)) / 1023.0) * 0.84;
    }
    graphBuffers.ch4.push(Math.max(0.04, Math.min(0.96, normCh4)));
    graphBuffers.ch4.shift();

    // 2. CO Carbon Monoxide Channel (Baseline: 15%, Surges up to 92%)
    let normCo = 0.15;
    if (liveTelemetry.espConnected) {
      normCo = 0.15 + (Math.max(0, Math.min(1023, liveTelemetry.co)) / 1023.0) * 0.77;
    }
    graphBuffers.co.push(Math.max(0.04, Math.min(0.96, normCo)));
    graphBuffers.co.shift();

    // 3. CO2 Air Quality Channel (Baseline: 22%, Surges up to 92%)
    let normCo2 = 0.22;
    if (liveTelemetry.espConnected) {
      normCo2 = 0.22 + (Math.max(0, Math.min(1023, liveTelemetry.co2)) / 1023.0) * 0.70;
    }
    graphBuffers.co2.push(Math.max(0.04, Math.min(0.96, normCo2)));
    graphBuffers.co2.shift();

    // 4. G-Force Shock (Baseline: 34% at 1.0G, Impact spikes surge up to 96%)
    const clampedG = Math.max(0.5, Math.min(3.0, liveTelemetry.gforce));
    const normG = 0.34 + ((clampedG - 1.0) / 2.0) * 0.58;
    graphBuffers.gforce.push(Math.max(0.04, Math.min(0.96, normG)));
    graphBuffers.gforce.shift();

    // 5. Roll Angle (Centered at 50% baseline, swings ±35% on ±90° tilt)
    const normRoll = 0.50 + (Math.max(-90, Math.min(90, liveTelemetry.roll)) / 180.0) * 0.70;
    graphBuffers.roll.push(Math.max(0.04, Math.min(0.96, normRoll)));
    graphBuffers.roll.shift();

    // 6. Pitch Angle (Centered at 68% baseline, swings ±26% on ±90° tilt)
    const normPitch = 0.68 + (Math.max(-90, Math.min(90, liveTelemetry.pitch)) / 180.0) * 0.52;
    graphBuffers.pitch.push(Math.max(0.04, Math.min(0.96, normPitch)));
    graphBuffers.pitch.shift();
  }, 40);

  // Smooth Bézier Spline Curve Drawing
  function drawSpline(pts, strokeColor, fillColor) {
    if (pts.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);

    for (let i = 0; i < pts.length - 1; i++) {
      const xc = (pts[i].x + pts[i + 1].x) / 2;
      const yc = (pts[i].y + pts[i + 1].y) / 2;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
    }
    const lastPt = pts[pts.length - 1];
    ctx.lineTo(lastPt.x, lastPt.y);

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.0;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = strokeColor;
    ctx.shadowBlur = 6;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Pulsing cursor head dot
    ctx.beginPath();
    ctx.arc(lastPt.x, lastPt.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = strokeColor;
    ctx.shadowColor = strokeColor;
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // 60 FPS Canvas Render Loop
  function renderLoop() {
    const w = canvas.width / window.devicePixelRatio;
    const h = canvas.height / window.devicePixelRatio;

    if (w <= 0 || h <= 0) {
      requestAnimationFrame(renderLoop);
      return;
    }

    ctx.clearRect(0, 0, w, h);

    // 1. Subtle horizontal grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);

    for (let yPct of [0.25, 0.50, 0.75]) {
      ctx.beginPath();
      ctx.moveTo(0, h * yPct);
      ctx.lineTo(w, h * yPct);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Center Reference Guideline
    ctx.strokeStyle = 'rgba(255, 85, 0, 0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.50);
    ctx.lineTo(w, h * 0.50);
    ctx.stroke();

    // 2. Draw all 6 channels simultaneously with zero overlap
    channels.forEach(ch => {
      const buf = graphBuffers[ch.key];
      const stepX = w / (BUFFER_SIZE - 1);

      const pts = buf.map((val, idx) => ({
        x: idx * stepX,
        y: h - (val * (h - 12)) - 6
      }));

      drawSpline(pts, ch.color, ch.fill);
    });

    requestAnimationFrame(renderLoop);
  }

  requestAnimationFrame(renderLoop);
}

// ============================================================================
// 5. NETWORK SETTINGS & RECONNECT
// ============================================================================

function applyNetworkSettings() {
  const newPhone = document.getElementById('phoneIp').value.trim();
  const newEsp = document.getElementById('espIp').value.trim();

  if (newPhone) {
    state.phoneIp = newPhone;
    localStorage.setItem('cyberrover_phone_ip', newPhone);
  }
  if (newEsp) {
    state.espIp = newEsp;
    localStorage.setItem('cyberrover_esp_ip', newEsp);
  }

  // Refresh Stream & Polling
  refreshVideoFeed();
  startTelemetryLoops();

  const btn = document.getElementById('btnApplyIp');
  if (btn) {
    btn.innerText = 'LOCKED';
    btn.style.backgroundColor = '#FFFFFF';
    btn.style.color = '#000000';
    setTimeout(() => { 
      btn.innerText = 'LOCK';
      btn.style.backgroundColor = '';
      btn.style.color = '';
    }, 1500);
  }
}

// ============================================================================
// 6. LIVE HD VIDEO & PHONE CONTROLS
// ============================================================================

function refreshVideoFeed() {
  const videoImg = document.getElementById('liveVideoFeed');
  const streamStats = document.getElementById('streamStats');

  if (streamStats) {
    streamStats.innerHTML = '<span class="stat-pill status-connecting"><span class="pulse-dot"></span> CONNECTING...</span>';
  }

  // Format URL: http://<phone-ip>/video
  let base = state.phoneIp;
  if (!base.startsWith('http://') && !base.startsWith('https://')) {
    base = 'http://' + base;
  }
  
  videoImg.src = `${base}/video`;
}

function handleVideoSuccess() {
  liveTelemetry.phoneConnected = true;

  const streamStats = document.getElementById('streamStats');
  if (streamStats) {
    streamStats.innerHTML = '<span id="videoFps" class="stat-pill">30 FPS</span><span id="videoLatency" class="stat-pill">~45ms</span><span class="stat-pill live-pill"><span class="pulse-dot live"></span> LIVE</span>';
  }
}

function handleVideoError(img) {
  liveTelemetry.phoneConnected = false;

  const streamStats = document.getElementById('streamStats');
  if (streamStats) {
    streamStats.innerHTML = '<span class="stat-pill status-offline">FEED OFFLINE</span>';
  }
}

// Multi-method phone command dispatcher (Bypasses browser CORS completely)
function sendPhoneCommand(path) {
  let base = state.phoneIp;
  if (!base.startsWith('http://') && !base.startsWith('https://')) base = 'http://' + base;
  const targetUrl = `${base}/${path}`;

  // 1. Hidden iframe navigation
  try {
    let iframe = document.getElementById('cmdIframe');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'cmdIframe';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
    }
    iframe.src = targetUrl;
  } catch (e) {}

  // 2. Image beacon
  try {
    const img = new Image();
    img.src = `${targetUrl}?_t=${Date.now()}`;
  } catch (e) {}

  // 3. Fetch with no-cors
  try {
    fetch(targetUrl, { mode: 'no-cors' }).catch(() => {});
  } catch (e) {}
}

// Centralized Torch Controller
function setTorchState(enable) {
  state.torchState = enable;
  const btn = document.getElementById('btnToggleTorch');
  
  if (enable) {
    sendPhoneCommand('enabletorch');
    sendPhoneCommand('settings/torch?set=on');
    sendPhoneCommand('settings/flashmode?set=torch');
    sendPhoneCommand('settings/flashmode?set=on');
    if (btn) {
      btn.style.backgroundColor = '#FF5500';
      btn.style.color = '#000000';
      const sp = btn.querySelector('span');
      if (sp) sp.innerText = 'TORCH: ON';
    }
  } else {
    sendPhoneCommand('disabletorch');
    sendPhoneCommand('settings/torch?set=off');
    sendPhoneCommand('settings/flashmode?set=off');
    if (btn) {
      btn.style.backgroundColor = '';
      btn.style.color = '';
      const sp = btn.querySelector('span');
      if (sp) sp.innerText = 'TORCH';
    }
  }
}

function togglePhoneTorch() {
  setTorchState(!state.torchState);
}

// Automatic Torch Trigger in Darkness
function toggleAutoTorch() {
  state.autoTorch = !state.autoTorch;
  const btn = document.getElementById('btnAutoTorch');
  if (!btn) return;

  const sp = btn.querySelector('span');
  if (state.autoTorch) {
    btn.style.backgroundColor = '#FF5500';
    btn.style.color = '#000000';
    if (sp) sp.innerText = 'AUTO: ON';
  } else {
    btn.style.backgroundColor = '';
    btn.style.color = '';
    if (sp) sp.innerText = 'AUTO';
    state.autoTorchTriggered = false;
  }
}

function switchCamera() {
  state.camFacingFront = !state.camFacingFront;
  const val = state.camFacingFront ? 'on' : 'off';
  sendPhoneCommand(`settings/ffc?set=${val}`);
  setTimeout(refreshVideoFeed, 800);
}

function captureSnapshot() {
  let base = state.phoneIp;
  if (!base.startsWith('http://') && !base.startsWith('https://')) base = 'http://' + base;
  window.open(`${base}/photo.jpg`, '_blank');
}

function adjustZoom(delta) {
  state.zoomLevel = Math.max(0, Math.min(10, state.zoomLevel + delta));
  sendPhoneCommand(`ptz?zoom=${state.zoomLevel}`);
}

function zeroCalibrateOrientation() {
  state.calPitchOffset = state.lastRawPitch;
  state.calRollOffset = state.lastRawRoll;
  localStorage.setItem('cyberrover_pitch_offset', state.calPitchOffset.toString());
  localStorage.setItem('cyberrover_roll_offset', state.calRollOffset.toString());
  
  const btn = document.querySelector('.zero-btn');
  if (btn) {
    btn.innerText = 'CALIBRATED';
    btn.style.backgroundColor = '#00E676';
    btn.style.color = '#000000';
    setTimeout(() => { 
      btn.innerText = 'ZERO CAL'; 
      btn.style.backgroundColor = '';
      btn.style.color = '';
    }, 1500);
  }
}

// ============================================================================
// 7. ASYNCHRONOUS TELEMETRY ENGINE
// ============================================================================

function startTelemetryLoops() {
  if (state.gasPollTimer) clearInterval(state.gasPollTimer);
  if (state.phonePollTimer) clearInterval(state.phonePollTimer);

  // Poll ESP32 Gas & Climate Hub every 250 ms
  state.gasPollTimer = setInterval(pollEsp32Sensors, 250);

  // Poll Phone Sensors every 150 ms (Smooth 3D Inclinometer)
  state.phonePollTimer = setInterval(pollPhoneSensors, 150);
}

// ----------------------------------------------------------------------------
// A. Fetch Gas & Climate from ESP32 Sensor Hub
// ----------------------------------------------------------------------------
async function pollEsp32Sensors() {
  if (window.webSerialActive) return; // Web Serial is streaming directly

  let endpoints = [];
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    endpoints.push('/api/sensors');
  } else {
    endpoints.push('http://localhost:5000/api/sensors');
    let base = state.espIp;
    if (!base.startsWith('http://') && !base.startsWith('https://')) base = 'http://' + base;
    endpoints.push(`${base}/api/sensors`);
  }

  let received = false;
  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 450);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        liveTelemetry.espConnected = true;
        updateGasUI(data);
        received = true;
        break;
      }
    } catch (err) {
      // Continue to next endpoint
    }
  }

  if (!received && !liveTelemetry.espConnected) {
    setEspOffline();
  }
}

function setEspOffline() {
  liveTelemetry.espConnected = false;

  const badge = document.getElementById('gasWarningBadge');
  if (badge) {
    badge.className = 'pill-badge status-offline';
    badge.innerText = 'HUB OFFLINE';
  }

  document.getElementById('valMq4').innerText = '-- ADC';
  document.getElementById('barMq4').style.width = '0%';
  document.getElementById('statusMq4').className = 'tag-status';
  document.getElementById('statusMq4').innerText = 'OFFLINE';

  document.getElementById('valMq7').innerText = '-- ADC';
  document.getElementById('barMq7').style.width = '0%';
  document.getElementById('statusMq7').className = 'tag-status';
  document.getElementById('statusMq7').innerText = 'OFFLINE';

  document.getElementById('valMq135').innerText = '-- ADC';
  document.getElementById('barMq135').style.width = '0%';
  document.getElementById('statusMq135').className = 'tag-status';
  document.getElementById('statusMq135').innerText = 'OFFLINE';

  document.getElementById('valTemp').innerText = '-- °C';
  document.getElementById('valHum').innerText = '-- %';
  document.getElementById('valDew').innerText = '-- °C';

  // BMP280 Offline State
  const valPress = document.getElementById('valPressure');
  if (valPress) valPress.innerText = '-- hPa';
  const valBaroPress = document.getElementById('valBaroPressure');
  if (valBaroPress) valBaroPress.innerText = '-- hPa';
  const valAlt = document.getElementById('valAltitude');
  if (valAlt) valAlt.innerText = '-- m';
  const valAltFt = document.getElementById('valAltitudeFt');
  if (valAltFt) valAltFt.innerText = '(-- ft)';
  const bmpBadge = document.getElementById('bmpStatusBadge');
  if (bmpBadge) {
    bmpBadge.className = 'pill-badge status-offline';
    bmpBadge.innerText = 'BMP280 OFFLINE';
  }
}

function updateGasUI(data) {
  // Update Car Battery (3S Pack: 9.6V - 12.6V)
  if (data.battery_voltage !== undefined) {
    const battV = data.battery_voltage;
    const battPct = data.battery_percent !== undefined ? data.battery_percent : Math.round(Math.max(0, Math.min(100, ((battV - 9.6) / 3.0) * 100)));
    const cellV = (battV / 3.0).toFixed(2);

    const valBatt = document.getElementById('valCarBatt');
    if (valBatt) valBatt.innerText = `${battV.toFixed(1)} V`;

    const valPct = document.getElementById('valCarBattPct');
    if (valPct) valPct.innerText = `${battPct}%`;

    const barBatt = document.getElementById('barCarBatt');
    if (barBatt) barBatt.style.width = `${battPct}%`;

    const valCell = document.getElementById('valCarBattCell');
    if (valCell) valCell.innerText = `${cellV} V/cell`;
  }

  // Update GPS Tactical Navigation
  const badgeGps = document.getElementById('badgeGpsFix');
  const valCoords = document.getElementById('valGpsCoords');
  const valSats = document.getElementById('valGpsSats');
  const valSpd = document.getElementById('valGpsSpeed');
  const valGpsAlt = document.getElementById('valGpsAlt');

  if (data.gps_fix && data.latitude && data.longitude) {
    if (badgeGps) { badgeGps.className = 'pill-badge status-live'; badgeGps.innerText = '3D FIX'; }
    if (valCoords) valCoords.innerText = `${data.latitude.toFixed(5)}° N, ${data.longitude.toFixed(5)}° E`;
    if (valSats) valSats.innerText = `${data.satellites || 0} SATS`;
    if (valSpd) valSpd.innerText = `${(data.speed_kmh || 0.0).toFixed(1)} km/h`;
    if (valGpsAlt) valGpsAlt.innerText = `${(data.gps_altitude || data.altitude_m || 0.0).toFixed(1)} m ALT`;
    updatePipMap(data.latitude, data.longitude, data.satellites || 0, true);
  } else {
    if (badgeGps) { badgeGps.className = 'pill-badge status-connecting'; badgeGps.innerText = 'SEARCHING'; }
    if (valCoords) valCoords.innerText = 'ACQUIRING SATELLITES';
    if (valSats) valSats.innerText = `${data.satellites || 0} SATS`;
    if (valSpd) valSpd.innerText = '-- km/h';
    if (valGpsAlt) valGpsAlt.innerText = '-- m ALT';
  }

  // Update LoRa RF Link & DBMS Record Badge
  const badgeLora = document.getElementById('badgeLoraStatus');
  if (badgeLora) { badgeLora.className = 'pill-badge status-live'; badgeLora.innerText = 'LORA ONLINE'; }

  const valRssi = document.getElementById('valLoraRssi');
  if (valRssi) valRssi.innerText = `${data.rssi !== undefined ? data.rssi : -70} dBm`;

  const valPkt = document.getElementById('valLoraPkt');
  if (valPkt) valPkt.innerText = `#${data.packet_count || 0} PKT`;

  const valDb = document.getElementById('valDbCount');
  if (valDb) valDb.innerText = `DBMS: ${data.db_total_records || liveTelemetryLog.length} RECS`;

  // 1. MQ-4 Methane
  const mq4 = data.mq4 !== undefined ? data.mq4 : 0;
  liveTelemetry.ch4 = mq4;
  document.getElementById('valMq4').innerText = `${mq4} ADC`;
  document.getElementById('barMq4').style.width = `${Math.min(100, (mq4 / 1023) * 100)}%`;

  const stMq4 = document.getElementById('statusMq4');
  if (mq4 >= 700) { stMq4.className = 'tag-status danger'; stMq4.innerText = 'EXPLOSIVE DANGER'; }
  else if (mq4 >= 450) { stMq4.className = 'tag-status warn'; stMq4.innerText = 'ELEVATED'; }
  else { stMq4.className = 'tag-status safe'; stMq4.innerText = 'NORMAL'; }

  // 2. MQ-7 Carbon Monoxide
  const mq7 = data.mq7 !== undefined ? data.mq7 : 0;
  liveTelemetry.co = mq7;
  document.getElementById('valMq7').innerText = `${mq7} ADC`;
  document.getElementById('barMq7').style.width = `${Math.min(100, (mq7 / 1023) * 100)}%`;

  const stMq7 = document.getElementById('statusMq7');
  if (mq7 >= 850) { stMq7.className = 'tag-status danger'; stMq7.innerText = 'TOXIC DANGER'; }
  else if (mq7 >= 550) { stMq7.className = 'tag-status warn'; stMq7.innerText = 'ELEVATED'; }
  else { stMq7.className = 'tag-status safe'; stMq7.innerText = 'NORMAL'; }

  // 3. MQ-135 Air Quality
  const mq135 = data.mq135 !== undefined ? data.mq135 : 0;
  liveTelemetry.co2 = mq135;
  document.getElementById('valMq135').innerText = `${mq135} ADC`;
  document.getElementById('barMq135').style.width = `${Math.min(100, (mq135 / 1023) * 100)}%`;

  const stMq135 = document.getElementById('statusMq135');
  if (mq135 >= 700) { stMq135.className = 'tag-status danger'; stMq135.innerText = 'POOR QUALITY'; }
  else { stMq135.className = 'tag-status safe'; stMq135.innerText = 'NORMAL'; }

  // Master Warning Badge
  const badge = document.getElementById('gasWarningBadge');
  if (mq4 >= 700 || mq7 >= 850 || mq135 >= 700) {
    badge.className = 'pill-badge badge-danger';
    badge.innerText = 'HAZARD DETECTED';
  } else {
    badge.className = 'pill-badge badge-safe';
    badge.innerText = 'AIR: SAFE';
  }

  // Climate (DHT11)
  if (data.dht_valid && data.temp_c !== undefined) {
    document.getElementById('valTemp').innerText = `${data.temp_c.toFixed(1)} °C`;
    document.getElementById('valHum').innerText = `${data.humidity.toFixed(1)} %`;
    document.getElementById('valDew').innerText = `${data.dew_point_c.toFixed(1)} °C`;
  } else {
    document.getElementById('valTemp').innerText = '-- °C';
    document.getElementById('valHum').innerText = '-- %';
    document.getElementById('valDew').innerText = '-- °C';
  }

  // BMP280 Barometric Pressure & Altitude Telemetry
  if (data.pressure_hpa !== undefined && data.bmp_valid) {
    const press = data.pressure_hpa.toFixed(1);
    const alt = data.altitude_m !== undefined ? data.altitude_m : 0.0;
    const altFt = (alt * 3.28084).toFixed(1);

    const valPress = document.getElementById('valPressure');
    if (valPress) valPress.innerText = `${press} hPa`;

    const valBaroPress = document.getElementById('valBaroPressure');
    if (valBaroPress) valBaroPress.innerText = `${press} hPa`;

    const valAlt = document.getElementById('valAltitude');
    if (valAlt) valAlt.innerText = `${alt >= 0 ? '+' : ''}${alt.toFixed(1)} m`;

    const valAltFt = document.getElementById('valAltitudeFt');
    if (valAltFt) valAltFt.innerText = `(${altFt} ft)`;

    const trendPill = document.getElementById('altTrendPill');
    if (trendPill) {
      if (alt > 0.5) {
        trendPill.innerText = `ASCENT: +${alt.toFixed(1)}m`;
        trendPill.style.color = '#00E676';
      } else if (alt < -0.5) {
        trendPill.innerText = `DESCENT: ${alt.toFixed(1)}m`;
        trendPill.style.color = '#FFB300';
      } else {
        trendPill.innerText = 'ELEVATION: BASE LEVEL';
        trendPill.style.color = '#00E676';
      }
    }

    const bmpBadge = document.getElementById('bmpStatusBadge');
    if (bmpBadge) {
      bmpBadge.className = 'pill-badge status-live';
      bmpBadge.innerText = 'BMP280 ACTIVE';
    }
  } else if (data.bmp_valid === false) {
    const bmpBadge = document.getElementById('bmpStatusBadge');
    if (bmpBadge) {
      bmpBadge.className = 'pill-badge status-offline';
      bmpBadge.innerText = 'BMP280 DETACHED';
    }
  }
}

// ----------------------------------------------------------------------------
// B. Fetch Sensors JSON from Phone IP Webcam
// ----------------------------------------------------------------------------
async function pollPhoneSensors() {
  let base = state.phoneIp;
  if (!base.startsWith('http://') && !base.startsWith('https://')) base = 'http://' + base;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 400);

    const res = await fetch(`${base}/sensors.json`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      liveTelemetry.phoneConnected = true;
      parsePhoneSensors(data);
    } else {
      setPhoneSensorsOffline();
    }
  } catch (err) {
    setPhoneSensorsOffline();
  }
}

function setPhoneSensorsOffline() {
  liveTelemetry.phoneConnected = false;
  const rollBadge = document.getElementById('rolloverAlert');
  if (rollBadge) {
    rollBadge.className = 'pill-badge status-offline';
    rollBadge.innerText = 'PHONE OFFLINE';
  }
}

function parsePhoneSensors(data) {
  // 1. Gravity & 3D Inclinometer Pitch / Roll (Calibrated for Landscape Upright Phone Mount)
  if (data.gravity && data.gravity.data && data.gravity.data.length > 0) {
    const gArr = data.gravity.data[data.gravity.data.length - 1][1];
    const Gx = gArr[0];
    const Gy = gArr[1];
    const Gz = gArr[2];

    // Landscape Upright Mount: Climbing uphill tilts Z vs (X,Y)
    const rawPitch = Math.atan2(Gz, Math.sqrt(Gx * Gx + Gy * Gy)) * (180 / Math.PI);
    
    // 90° Compensation: Subtracted 90° so resting horizontal landscape roll maps directly to 0.0°
    let rawRoll = (Math.atan2(Gx, Math.abs(Gy)) * (180 / Math.PI)) - 90.0;
    while (rawRoll > 180) rawRoll -= 360;
    while (rawRoll < -180) rawRoll += 360;

    state.lastRawPitch = rawPitch;
    state.lastRawRoll  = rawRoll;

    // Apply User 0° Calibration Offset
    let pitch = rawPitch - state.calPitchOffset;
    let roll  = rawRoll - state.calRollOffset;

    while (pitch > 180) pitch -= 360;
    while (pitch < -180) pitch += 360;
    while (roll > 180) roll -= 360;
    while (roll < -180) roll += 360;

    // Push into live telemetry cache for real-time oscilloscope
    liveTelemetry.pitch = pitch;
    liveTelemetry.roll = roll;

    document.getElementById('valPitch').innerText = `${pitch >= 0 ? '+' : ''}${pitch.toFixed(1)}°`;
    document.getElementById('valRoll').innerText = `${roll >= 0 ? '+' : ''}${roll.toFixed(1)}°`;

    // Rotate SVG Horizon Group
    const horizonGroup = document.getElementById('horizonHorizonGroup');
    if (horizonGroup) {
      const pitchOffset = Math.max(-45, Math.min(45, pitch * 1.2));
      horizonGroup.setAttribute('transform', `rotate(${-roll}, 100, 100) translate(0, ${pitchOffset})`);
    }

    // Rollover Warning Alert
    const rollBadge = document.getElementById('rolloverAlert');
    if (rollBadge) {
      if (Math.abs(pitch) > 40 || Math.abs(roll) > 40) {
        rollBadge.className = 'pill-badge badge-danger';
        rollBadge.innerText = 'ROLLOVER HAZARD';
      } else {
        rollBadge.className = 'pill-badge badge-safe';
        rollBadge.innerText = 'ATTITUDE: STABLE';
      }
    }
  }

  // 2. Dynamic G-Force Shock
  if (data.accel && data.accel.data && data.accel.data.length > 0) {
    const accArr = data.accel.data[data.accel.data.length - 1][1];
    const Ax = accArr[0];
    const Ay = accArr[1];
    const Az = accArr[2];
    const totalG = Math.sqrt(Ax * Ax + Ay * Ay + Az * Az) / 9.81;
    liveTelemetry.gforce = totalG;
    document.getElementById('valGforce').innerText = `${totalG.toFixed(2)} G`;
  }

  // 3. Ambient Light Sensor & Auto-Torch Intelligence
  if (data.light && data.light.data && data.light.data.length > 0) {
    const lux = data.light.data[data.light.data.length - 1][1][0];
    document.getElementById('valLight').innerText = `${lux.toFixed(0)} lx`;

    // Auto Torch Trigger in Dark Mines (< 25 lx turns ON, > 65 lx turns OFF)
    if (state.autoTorch) {
      if (lux < 25 && !state.torchState) {
        setTorchState(true);
        state.autoTorchTriggered = true;
      } else if (lux > 65 && state.torchState && state.autoTorchTriggered) {
        setTorchState(false);
        state.autoTorchTriggered = false;
      }
    }
  }

  // 4. Battery & Phone Thermal (Handles both Nested Object & Direct Number formats)
  let batVal = null;
  if (data.battery_level !== undefined) {
    if (typeof data.battery_level === 'number') {
      batVal = data.battery_level;
    } else if (data.battery_level && data.battery_level.data && data.battery_level.data.length > 0) {
      const last = data.battery_level.data[data.battery_level.data.length - 1];
      batVal = Array.isArray(last[1]) ? last[1][0] : last[1];
    }
  } else if (data.battery !== undefined) {
    if (typeof data.battery === 'number') {
      batVal = data.battery;
    } else if (data.battery && data.battery.data && data.battery.data.length > 0) {
      const last = data.battery.data[data.battery.data.length - 1];
      batVal = Array.isArray(last[1]) ? last[1][0] : last[1];
    }
  }

  if (batVal !== null && !isNaN(batVal)) {
    document.getElementById('valPhoneBat').innerText = `${Math.round(batVal)} %`;
  }

  // Battery Temperature
  let tempVal = null;
  if (data.battery_temp !== undefined) {
    if (typeof data.battery_temp === 'number') {
      tempVal = data.battery_temp;
    } else if (data.battery_temp && data.battery_temp.data && data.battery_temp.data.length > 0) {
      const last = data.battery_temp.data[data.battery_temp.data.length - 1];
      tempVal = Array.isArray(last[1]) ? last[1][0] : last[1];
    }
  }

  if (tempVal !== null && !isNaN(tempVal)) {
    document.getElementById('valPhoneTemp').innerText = `${Number(tempVal).toFixed(1)} °C`;
  }
}

// ============================================================================
// 8. HUD REAL-TIME CLOCK
// ============================================================================

function startHudClock() {
  const clockEl = document.getElementById('hudClock');
  function tick() {
    const now = new Date();
    clockEl.innerText = now.toTimeString().split(' ')[0];
  }
  tick();
  state.clockTimer = setInterval(tick, 1000);
}

// ============================================================================
// 10. DRAGGABLE INTER-COLUMN RESIZER (Left/Right Width Dynamic Control)
// ============================================================================

function initColumnResizer() {
  const resizer = document.getElementById('colResizer');
  const grid = document.getElementById('cockpitGrid');
  if (!resizer || !grid) return;

  let isDragging = false;

  // Ultra-Safe Range of Motion: 44% to 56% (Tight range prevents distortion at all times)
  const MIN_PERCENT = 44.0;
  const MAX_PERCENT = 56.0;
  const DEFAULT_PERCENT = 50.0;

  // Restore & sanitize saved column split preference (resets any distorted legacy values)
  let savedSplit = localStorage.getItem('cyberrover_col_split');
  if (savedSplit) {
    let num = parseFloat(savedSplit);
    if (isNaN(num) || num < MIN_PERCENT || num > MAX_PERCENT) {
      savedSplit = `${DEFAULT_PERCENT}%`;
      localStorage.setItem('cyberrover_col_split', savedSplit);
    }
  } else {
    savedSplit = `${DEFAULT_PERCENT}%`;
  }
  grid.style.setProperty('--left-col-percent', savedSplit);

  resizer.addEventListener('mouseenter', () => {
    document.body.classList.add('cursor-resizing-cols');
  });

  resizer.addEventListener('mouseleave', () => {
    if (!isDragging) {
      document.body.classList.remove('cursor-resizing-cols');
    }
  });

  resizer.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isDragging = true;
    document.body.classList.add('cursor-resizing-cols');
    document.body.classList.add('is-dragging-splitter');

    const onMouseMove = (moveEvent) => {
      if (!isDragging) return;
      const gridRect = grid.getBoundingClientRect();
      const clientX = moveEvent.clientX;
      
      // Calculate percentage relative to total grid width
      const offset = clientX - gridRect.left;
      let percent = (offset / gridRect.width) * 100;
      
      // Tight safe clamping: Locks strictly between 44% and 56% so distortion is IMPOSSIBLE
      percent = Math.max(MIN_PERCENT, Math.min(MAX_PERCENT, percent));

      grid.style.setProperty('--left-col-percent', `${percent.toFixed(2)}%`);

      // Dynamically trigger resize for canvas and video
      window.dispatchEvent(new Event('resize'));
    };

    const onMouseUp = () => {
      if (isDragging) {
        isDragging = false;
        document.body.classList.remove('is-dragging-splitter');
        document.body.classList.remove('cursor-resizing-cols');
        
        // Save sanitized split to localStorage
        const currentSplit = grid.style.getPropertyValue('--left-col-percent');
        if (currentSplit) {
          localStorage.setItem('cyberrover_col_split', currentSplit);
        }

        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);

        // Final redraw
        window.dispatchEvent(new Event('resize'));
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  });

  // Double-click to instantly snap back to perfectly balanced 50%
  resizer.addEventListener('dblclick', () => {
    grid.style.setProperty('--left-col-percent', `${DEFAULT_PERCENT}%`);
    localStorage.setItem('cyberrover_col_split', `${DEFAULT_PERCENT}%`);
    window.dispatchEvent(new Event('resize'));
  });
}


// ============================================================================
// CYBERROVER X4.3 - WEB SERIAL (CHROME DIRECT LINK) & SQLite DBMS VIEWER
// ============================================================================
let serialPort = null;
let serialReader = null;
let serialBuffer = '';
const liveTelemetryLog = [];

async function connectWebSerial() {
  if (!('serial' in navigator)) {
    alert("Web Serial is natively supported in Google Chrome & Microsoft Edge.\nOr simply double-click 'start_ground_station.bat' for full Python & SQLite DBMS support!");
    return;
  }
  try {
    serialPort = await navigator.serial.requestPort();
    await serialPort.open({ baudRate: 115200 });
    window.webSerialActive = true;

    const btn = document.getElementById('btnLoraConnect');
    if (btn) {
      btn.innerText = 'LORA CONNECTED';
      btn.classList.add('primary');
      btn.classList.remove('secondary');
    }

    readSerialLoop();
  } catch (err) {
    console.error("Web Serial connect error:", err);
  }
}

async function readSerialLoop() {
  const textDecoder = new TextDecoderStream();
  const readableStreamClosed = serialPort.readable.pipeTo(textDecoder.writable);
  serialReader = textDecoder.readable.getReader();

  try {
    while (true) {
      const { value, done } = await serialReader.read();
      if (done) break;
      if (value) {
        serialBuffer += value;
        let lines = serialBuffer.split('\n');
        serialBuffer = lines.pop();
        for (const line of lines) {
          parseRawSerialLine(line);
        }
      }
    }
  } catch (err) {
    console.warn("Serial read error:", err);
  } finally {
    serialReader.releaseLock();
  }
}

function parseRawSerialLine(raw) {
  let line = raw.trim();
  if (!line) return;

  let rssi = -70;
  let snr = 30;
  let payload = "";

  if (line.startsWith("+RCV=")) {
    let parts = line.substring(5).split(",");
    if (parts.length >= 5) {
      rssi = parseInt(parts[parts.length - 2]) || -70;
      snr = parseInt(parts[parts.length - 1]) || 30;
      payload = parts.slice(2, parts.length - 2).join(",");
    }
  } else if (line.includes("CR43")) {
    payload = line.substring(line.indexOf("CR43"));
  }

  if (!payload.startsWith("CR43")) return;
  let items = payload.split(",");
  if (items.length < 18) return;

  try {
    let pkt = parseInt(items[1]);
    let battV = parseFloat(items[2]);
    let mq4 = parseInt(items[3]);
    let mq7 = parseInt(items[4]);
    let mq135 = parseInt(items[5]);
    let dhtT = parseFloat(items[6]);
    let dhtH = parseFloat(items[7]);
    let bmpT = parseFloat(items[8]);
    let press = parseFloat(items[9]);
    let alt = parseFloat(items[10]);
    let fix = parseInt(items[11]) === 1;
    let lat = parseFloat(items[12]);
    let lon = parseFloat(items[13]);
    let sats = parseInt(items[14]);
    let hdop = parseFloat(items[15]);
    let gpsAlt = parseFloat(items[16]);
    let spd = parseFloat(items[17]);

    let dhtValid = (dhtH > 0 || dhtT > 0);
    let bmpValid = (press > 300 && press < 1200);
    let tempAvg = (dhtValid && bmpValid) ? ((dhtT + bmpT) * 0.5) : (dhtValid ? dhtT : (bmpValid ? bmpT : 25.0));
    let dewPoint = tempAvg - ((100.0 - Math.max(1, Math.min(100, dhtH))) / 5.0);
    let battPct = Math.round(Math.max(0, Math.min(100, ((battV - 9.60) / 3.00) * 100)));

    let record = {
      timestamp: new Date().toLocaleTimeString(),
      packet_count: pkt,
      battery_voltage: battV,
      battery_percent: battPct,
      mq4: mq4,
      mq7: mq7,
      mq135: mq135,
      dht_valid: dhtValid,
      temp_c: tempAvg,
      humidity: dhtH,
      dew_point_c: dewPoint,
      bmp_valid: bmpValid,
      pressure_hpa: press,
      altitude_m: alt,
      gps_fix: fix,
      latitude: lat,
      longitude: lon,
      satellites: sats,
      hdop: hdop,
      gps_altitude: gpsAlt,
      speed_kmh: spd,
      rssi: rssi,
      snr: snr
    };

    liveTelemetryLog.unshift(record);
    if (liveTelemetryLog.length > 500) liveTelemetryLog.pop();

    liveTelemetry.espConnected = true;
    updateGasUI(record);

    if (fix && lat && lon) {
      updatePipMap(lat, lon, sats, true);
    }
  } catch (ex) {
    console.warn("Serial parse error:", ex);
  }
}

function toggleDbmsModal() {
  const modal = document.getElementById('dbmsModal');
  if (!modal) return;
  if (modal.style.display === 'none' || modal.style.display === '') {
    modal.style.display = 'flex';
    document.body.classList.add('modal-open');
    loadDbmsDates();
    refreshDbmsTable();
  } else {
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');
  }
}

// Close modal on Escape key
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const modal = document.getElementById('dbmsModal');
    if (modal && modal.style.display !== 'none' && modal.style.display !== '') {
      toggleDbmsModal();
    }
  }
});

async function loadDbmsDates() {
  const dateSelect = document.getElementById('dbmsDateFilter');
  if (!dateSelect) return;
  try {
    const res = await fetch('http://localhost:5000/api/db/dates');
    if (res.ok) {
      const data = await res.json();
      const currentVal = dateSelect.value;
      let opts = '<option value="all">All Dates</option>';
      if (data.dates && data.dates.length > 0) {
        data.dates.forEach(d => {
          opts += `<option value="${d}">${d}</option>`;
        });
      }
      dateSelect.innerHTML = opts;
      if (currentVal && Array.from(dateSelect.options).some(o => o.value === currentVal)) {
        dateSelect.value = currentVal;
      }
      const countBadge = document.getElementById('dbmsRecordCount');
      if (countBadge && data.total !== undefined) {
        countBadge.innerText = `${data.total} Total Records`;
      }
    }
  } catch (e) {
    console.warn("Failed to load DBMS dates:", e);
  }
}

async function refreshDbmsTable() {
  const tbody = document.getElementById('dbmsTableBody');
  if (!tbody) return;

  const dateFilter = document.getElementById('dbmsDateFilter')?.value || 'all';
  const limitFilter = document.getElementById('dbmsLimitFilter')?.value || '100';

  try {
    const url = `http://localhost:5000/api/db/recent?date=${encodeURIComponent(dateFilter)}&limit=${encodeURIComponent(limitFilter)}`;
    const res = await fetch(url);
    if (res.ok) {
      const rows = await res.json();
      const countBadge = document.getElementById('dbmsRecordCount');
      if (countBadge && rows) {
        countBadge.innerText = `Showing ${rows.length} records`;
      }
      if (rows && rows.length > 0) {
        tbody.innerHTML = rows.map(r => `
          <tr>
            <td>${r.timestamp}</td>
            <td>#${r.packet_id}</td>
            <td style="color:#FFB300;">${Number(r.battery_voltage || 0).toFixed(1)}V (${r.battery_percent || 0}%)</td>
            <td>${r.mq4_raw}</td>
            <td>${r.mq7_raw}</td>
            <td>${r.mq135_raw}</td>
            <td>${Number(r.temp_c || 0).toFixed(1)}°C</td>
            <td>${Number(r.humidity || 0).toFixed(0)}%</td>
            <td>${Number(r.pressure_hpa || 0).toFixed(1)} hPa</td>
            <td>${Number(r.altitude_m || 0).toFixed(1)} m</td>
            <td><span class="pill-badge ${r.gps_fix ? 'status-live' : 'status-offline'}">${r.gps_fix ? 'FIX' : 'SEARCH'}</span></td>
            <td>${Number(r.latitude || 0).toFixed(5)}</td>
            <td>${Number(r.longitude || 0).toFixed(5)}</td>
            <td>${r.satellites || 0}</td>
            <td>${r.rssi || -99} dBm</td>
          </tr>
        `).join('');
        return;
      } else {
        tbody.innerHTML = '<tr><td colspan="15" style="text-align:center; padding:20px; color:#8E94A5;">No records found for the selected date filter.</td></tr>';
        return;
      }
    }
  } catch (e) {
    console.warn("DB fetch failed:", e);
  }

  // Fallback to in-memory live log if backend is unreachable
  if (liveTelemetryLog.length > 0) {
    tbody.innerHTML = liveTelemetryLog.slice(0, 50).map(r => `
      <tr>
        <td>${r.timestamp}</td>
        <td>#${r.packet_count}</td>
        <td style="color:#FFB300;">${Number(r.battery_voltage || 0).toFixed(1)}V (${r.battery_percent || 0}%)</td>
        <td>${r.mq4}</td>
        <td>${r.mq7}</td>
        <td>${r.mq135}</td>
        <td>${Number(r.temp_c || 0).toFixed(1)}°C</td>
        <td>${Number(r.humidity || 0).toFixed(0)}%</td>
        <td>${Number(r.pressure_hpa || 0).toFixed(1)} hPa</td>
        <td>${Number(r.altitude_m || 0).toFixed(1)} m</td>
        <td><span class="pill-badge ${r.gps_fix ? 'status-live' : 'status-offline'}">${r.gps_fix ? 'FIX' : 'SEARCH'}</span></td>
        <td>${Number(r.latitude || 0).toFixed(5)}</td>
        <td>${Number(r.longitude || 0).toFixed(5)}</td>
        <td>${r.satellites || 0}</td>
        <td>${r.rssi || -99} dBm</td>
      </tr>
    `).join('');
  } else {
    tbody.innerHTML = '<tr><td colspan="15" style="text-align:center; padding:20px; color:#8E94A5;">Waiting for incoming telemetry packets...</td></tr>';
  }
}

function exportMissionCsv() {
  const dateFilter = document.getElementById('dbmsDateFilter')?.value || 'all';
  window.open(`http://localhost:5000/api/db/export?date=${encodeURIComponent(dateFilter)}`, '_blank');
}

// ============================================================================
// 12. TACTICAL PICTURE-IN-PICTURE (PiP) GPS MAP (Leaflet Engine)
// ============================================================================

let pipMapInstance = null;
let roverGpsMarker = null;
let roverGpsTrail = null;
let currentRoverPos = [23.793950, 86.295700]; // Last known GPS location from CSV

function initPipMap() {
  const mapEl = document.getElementById('pipMap');
  if (!mapEl || typeof L === 'undefined') return;

  try {
    // 1. Initialize Leaflet Map centered between Campus and Last CSV fix
    pipMapInstance = L.map('pipMap', {
      center: currentRoverPos,
      zoom: 16,
      minZoom: 7,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false
    });

    // 2. Add Offline Raster Tile Layer (local /tiles/{z}/{x}/{y}.png)
    L.tileLayer('/tiles/{z}/{x}/{y}.png', {
      minZoom: 7,
      maxZoom: 18,
      className: 'tactical-map-tiles'
    }).addTo(pipMapInstance);

    // 3. Add Rover Position Marker (Glowing Orange Dot)
    roverGpsMarker = L.circleMarker(currentRoverPos, {
      radius: 8,
      fillColor: '#FF5500',
      color: '#FFFFFF',
      weight: 2.5,
      fillOpacity: 1
    }).addTo(pipMapInstance);
    roverGpsMarker.bindPopup('<b style="color:#000;">CYBERROVER X4.3</b><br>GPS Mission Location<br>23.79395°N, 86.29570°E');

    // 4. Add Breadcrumb Polyline Trail (recording rover movement only)
    roverGpsTrail = L.polyline([], {
      color: '#FF5500',
      weight: 3,
      opacity: 0.85,
      dashArray: '5, 5'
    }).addTo(pipMapInstance);

    // 6. Asynchronously Load Jharkhand Vector Boundary
    loadJharkhandVectorBoundary();

    // 7. Ensure correct rendering size
    setTimeout(() => {
      if (pipMapInstance) pipMapInstance.invalidateSize();
    }, 400);

  } catch (err) {
    console.warn("PiP Map init warning:", err);
  }
}

async function loadJharkhandVectorBoundary() {
  if (!pipMapInstance) return;
  try {
    const res = await fetch('/maps/jharkhand_boundary.json');
    if (res.ok) {
      const data = await res.json();
      if (data && data.elements) {
        // Draw each boundary segment separately to prevent cross-state diagonal lines
        data.elements.forEach(el => {
          if (el.members) {
            el.members.forEach(m => {
              if (m.geometry && m.geometry.length > 1) {
                const seg = m.geometry.map(pt => [pt.lat, pt.lon]);
                L.polyline(seg, {
                  color: '#00E5FF',
                  weight: 1.5,
                  opacity: 0.75,
                  dashArray: '5, 5'
                }).addTo(pipMapInstance);
              }
            });
          }
        });
      }
    }
  } catch (e) {
    console.warn("Jharkhand boundary load notice:", e);
  }
}

function updatePipMap(lat, lon, sats, hasFix) {
  if (!pipMapInstance || !lat || !lon) return;

  currentRoverPos = [lat, lon];

  if (roverGpsMarker) {
    roverGpsMarker.setLatLng(currentRoverPos);
  }
  if (roverGpsTrail) {
    roverGpsTrail.addLatLng(currentRoverPos);
  }

  const coordText = document.getElementById('pipCoordText');
  if (coordText) {
    coordText.innerText = `${lat.toFixed(5)}°N, ${lon.toFixed(5)}°E (${sats || 0} SATS)`;
  }

  pipMapInstance.panTo(currentRoverPos, { animate: true, duration: 0.5 });
}

function centerRoverLocation() {
  if (pipMapInstance && currentRoverPos) {
    pipMapInstance.setView(currentRoverPos, 16, { animate: true });
  }
}

function toggleMapExpand() {
  const container = document.getElementById('pipMapContainer');
  const btn = document.getElementById('btnPipExpand');
  if (!container) return;

  const isExp = container.classList.toggle('expanded');
  if (btn) {
    btn.innerText = isExp ? '✖' : '◰';
    btn.title = isExp ? 'Restore Mini Map' : 'Maximize Map';
  }

  setTimeout(() => {
    if (pipMapInstance) {
      pipMapInstance.invalidateSize();
      if (currentRoverPos) pipMapInstance.panTo(currentRoverPos);
    }
  }, 320);
}
