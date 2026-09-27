# 🛰️ CyberRover X4.3 — Complete Firmware & Software Architecture Breakdown

## 🌐 High-Level Architecture Overview

In conventional student robots, all motors, sensors, and radios are wired to a single Arduino or Raspberry Pi. When DC motors draw high current (up to 40A on stall), they produce severe **Electromagnetic Interference (EMI)** and **voltage sags (brownouts)** that reset the microcontroller or corrupt sensitive gas and GPS readings.

CyberRover X4.3 solves this with a **segregated multi-tier architecture**:

```
 ┌──────────────────────────────────────────────────────────────────────────┐
 │                         CYBERROVER X4.3 ECOSYSTEM                        │
 └──────────────────────────────────────────────────────────────────────────┘
                                      │
         ┌────────────────────────────┴───────────────────────────┐
         ▼                                                        ▼
┌─────────────────────────────────┐                     ┌───────────────────┐
│       LAYER 1: MOBILITY         │                     │ LAYER 2: SENSORS  │
│                                 │                     │                   │
│  [ESP32-S3 Rover Master]        │                     │   [Arduino Nano]  │
│        │ (UART 38400 baud)      │                     │  7 Gas/Env Sensors│
│        ▼                        │                     │         │         │
│  [Arduino Uno Driver]           │                     │         ▼         │
│  Dual BTS7960 + 4 Motors        │                     │  RYLR998 LoRa TX  │
└─────────────────────────────────┘                     └───────────────────┘
         ▲                                                        │
         │ (100 Hz ESP-NOW)                                       │ (868/915 MHz RF)
         │                                                        ▼
┌─────────────────────────────────┐                     ┌───────────────────┐
│      HANDHELD CONTROLLER        │                     │ GROUND COCKPIT    │
│                                 │                     │                   │
│  [ESP32 DevKit V1]              │                     │ [Python Backend]  │
│  Dual Sticks + OLED + FreeRTOS  │                     │  SQLite3 DBMS     │
│                                 │                     │         │         │
│                                 │                     │         ▼         │
│                                 │                     │ [Web Cockpit HUD] │
└─────────────────────────────────┘                     └───────────────────┘
```

---

## 🛠️ PART 1: THE FIRMWARE ARCHITECTURE (1 BY 1)

---

### 1. The Central Protocol Foundation: `CyberProtocol.h`
**File**: `firmware/shared/CyberProtocol.h`

Every microcontroller in the mobility stack communicates using this unified header.

* **What it does**: Defines the exact binary packet layout and mathematical checksum shared across the controller, the ESP32-S3 rover master, and the Arduino Uno motor driver.
* **How it was built**:
  1. **Memory-Packed 9-Byte Binary Struct (`CyberPacket`)**: Using `#pragma pack(push, 1)` ensures the compiler does not add padding bytes. It packs `seq`, `leftX`, `leftY`, `rightX`, `rightY`, `buttons` bitmask, `mode`, `batPct`, and `crc8` into exactly **9 bytes**.
  2. **8-Byte Telemetry Struct (`TelemetryPacket`)**: Sends back Rover battery %, RSSI signal strength, and left/center/right ultrasonic distances to the handheld controller.
  3. **High-Speed Hardware CRC-8 Algorithm (`computeCRC8`)**: Uses polynomial `0x07` (CCITT). If a single bit is flipped over the air or serial line due to motor EMI, the packet is instantly discarded.
  4. **UART Frame Framing**: Prefixes packets with two synchronization bytes (`0xAA 0x55`) so receiver UART buffers can lock onto frame boundaries even if garbage bytes precede them.

---

### 2. Node 01: Handheld Remote Controller
**File**: `firmware/controller/remote-controller/remote-controller.ino`  
**Target**: ESP32 DevKit V1 (Dual-Core Tensilica Xtensa @ 240 MHz).

* **How it was built**:
  * **Dual-Core FreeRTOS Asynchronous Decoupling**:
    * **Core 0** runs `displayWorkerTask` at 30–40 Hz. It renders the SSD1306 128x64 OLED HUD and the embedded "CyberOS" phone menu. Because I2C transfers are slow and take several milliseconds, pinning this to Core 0 ensures the display *never slows down the radio link*.
    * **Core 1** runs the high-speed **100 Hz Real-Time Scheduler** (`loop()`). Every 10 ms, it samples the ADC joysticks, runs digital button debouncing, and transmits an ESP-NOW packet.
  * **Input & Joystick Processing (`JoystickManager.h`)**:
    * Auto-calibration takes baseline readings at boot to eliminate physical potentiometer drift.
    * Configurable deadband zone around the center prevents motor humming when hands are off the sticks.
  * **Drive Modes & Fail-Safes**:
    * Switch `T1`: Opens or exits the CyberOS on-screen menu (which safely zeros out rover throttle).
    * Switch `T2`: Master **PARK Mode** (forces electric brake hold).
    * Button `P2`: Toggles between **MANUAL** and **AUTO** self-driving.
    * Click Left Stick (`JL`): Triggers real-time stick recalibration.
    * Click Right Stick (`JR`): Re-initializes the OLED display instantly if cable vibration momentarily disconnected I2C.

---

### 3. Node 02: Rover Drive Master
**File**: `firmware/rover-master-esp32s3/rover-master-esp32s3.ino`  
**Target**: ESP32-S3 (Dual-Core Xtensa LX7 @ 240 MHz).

* **Role**: The vehicle's master radio transceiver and safety supervisory brain.
* **How it was built**:
  1. **100 Hz Bidirectional ESP-NOW Radio (`CommsReceiver.h`)**:
     * Operates completely offline without routers using peer-to-peer MAC pairing.
     * Validates incoming CRC-8 on arrival.
     * Maintains a **400 ms watchdog failsafe**: If no packet arrives within 400 ms (remote switched off or out of range), it commands an immediate full stop.
  2. **Hardware UART Gateway to Arduino Uno (`UnoGateway.h`)**:
     * Transmits the validated packet over Hardware `UART1` (Pins 17/18) at 38400 baud prefixed with `0xAA 0x55`.
     * Transmits audio codes to the Uno when horn or siren sounds are triggered.
  3. **Visual Link Diagnostics (`StatusLED.h`)**:
     * Drives an onboard WS2812 RGB LED: Solid Green when ESP-NOW link is healthy (<100ms latency); pulsing Amber on degradation; flashing Red upon failsafe timeout.

---

### 4. Node 03: Motor Controller & Sound Brain
**File**: `firmware/motor-controller-uno/motor-controller-uno.ino`  
**Target**: Arduino Uno (ATmega328P / 5V / 16 MHz).

* **Role**: Low-level high-current motor execution, obstacle sensing, and tactical sound generation.
* **How it was built**:
  1. **Dual BTS7960 43A H-Bridge Motor Control (`MotorDriver.h`)**:
     * Uses PWM pins to control forward/reverse for Left and Right tracks.
     * **50 Hz S-Curve Acceleration Ramping**: Motors never jump from 0 to 255 PWM in 1 step. Velocity increments smoothly, protecting gearbox teeth and avoiding 20A current spikes.
  2. **Round-Robin Ultrasonic Radar (`RadarSensors.h`)**:
     * Fires Left, Center, and Right HC-SR04 sensors in alternating time-slots (50 Hz) so the ultrasonic ping from the left sensor does not bounce into the right sensor and cause phantom obstacle readings.
  3. **Multi-Mode Autonomous Navigator (`AutoNavigator.h`)**:
     * **MANUAL**: Direct arcade/skid-steering mixing from the joystick X/Y.
     * **SEMI-AUTO**: Normal joystick driving, but automatically throttles down or blocks forward drive if an obstacle appears within 25 cm.
     * **FULL AUTO**: Finite State Machine (`FORWARD` ➔ `STEER_LEFT/RIGHT` ➔ `REVERSE_ESCAPE` ➔ `SPIN_ESCAPE`) enabling self-driving obstacle clearance.
  4. **Non-Blocking Piezo Sound Engine (`SoundEngine.h`)**:
     * Synthesizes sirens, sci-fi chirps, alarms, and horns using millis-based frequency step tables without ever calling `delay()`.

---

### 5. Node 04: Layer 2 Environmental Scouting Node
**File**: `firmware/layer2-environmental-node-nano/layer2-environmental-node-nano.ino`  
**Target**: Arduino Nano (ATmega328P / 5V / 16 MHz).

* **Role**: Dedicated atmospheric hazard analysis, GPS telemetry, and long-range LoRa transmission.
* **How it was built**:
  1. **Unified Sensor Acquisition Engine (`Sensors.h`)**:
     * **Gas Array**: Samples MQ-4 (Methane $CH_4$ on A0), MQ-7 (Carbon Monoxide $CO$ on A1), and MQ-135 (Air Quality/Ammonia on A2).
     * **Climate & Barometer**: BMP280 via I2C (`A4/A5`) for high-precision barometric pressure & altitude; DHT11 on D4 for relative humidity. Computes true ambient temperature and dew point.
     * **16x Oversampled 3S Battery Divider (Pin A3)**: Reads 0–25V divider ($30\text{k}\Omega / 7.5\text{k}\Omega$). Implements 16-sample burst averaging with a precision software calibration factor (`Trim = 0.852f`) to match professional DMM readings at 12.10V.
     * **Continuous GPS NMEA Parser**: Reads u-blox NEO-6M on Pin D2 using `TinyGPSPlus`. `sensorDeck.updateGPSStream()` runs on *every single pass of loop()* to prevent the 64-byte UART buffer from overflowing.
  2. **1.3" OLED Dynamic HUD & Procedural RoboEyes (`DisplayOLED.h`)**:
     * Boots with procedural, zero-RAM vector "RoboEyes" that blink, glance left and right, and wake up.
     * Cycles through 3 diagnostic pages (Climate Deck, Hazardous Gas Deck with filled pixel bar meters, and GPS Tactical Deck) on a 10-second cooperative timer.
  3. **Reyax RYLR998 LoRa Radio Serialization (`LoRaTransceiver.h`)**:
     * Communicates with the RYLR998 module via Hardware Serial (Pins D0/D1) at 115200 baud.
     * Formats all 18 sensor metrics into an optimized CSV packet:
       $$\mathbf{CR43,<pkt>,<volt>,<mq4>,<mq7>,<mq135>,<dhtT>,<dhtH>,<bmpT>,<pres>,<alt>,<fix>,<lat>,<lon>,<sat>,<hdop>,<gpsAlt>,<spd>}$$
     * Sends `AT+SEND=0,<length>,<payload>` every 1.5–2.0 seconds, achieving kilometer-range packet broadcast.

---

## 💻 PART 2: THE SOFTWARE ARCHITECTURE (1 BY 1)

The software part lives in `software/ground-dashboard/` and runs on the operator's mission laptop.

---

### 1. The Tactical Backend & DBMS Server: `ground_station.py`
**File**: `software/ground-dashboard/ground_station.py`  
**Built using**: Python 3, Flask, pySerial, and SQLite3.

* **How it was built**:
  1. **Intelligent Serial Auto-Discovery (`serial_worker()`)**:
     * Runs in a dedicated background daemon thread.
     * Scans all system COM ports using `serial.tools.list_ports.comports()`, skips unwanted Bluetooth ports, and auto-locks onto the USB-TTL LoRa receiver at 115200 baud.
  2. **LoRa Packet Decoder (`parse_telemetry_line()`)**:
     * Handles raw RYLR998 response strings: `+RCV=<addr>,<len>,<payload>,<rssi>,<snr>`.
     * Strips radio metadata, extracts signal parameters (RSSI in dBm and SNR), unpacks the 18 CSV tokens, computes battery percentage, and updates the thread-safe global telemetry object.
  3. **SQLite DBMS Logging Engine (`init_db()` & `insert_telemetry_to_db()`)**:
     * Saves every received telemetry packet into `mission_telemetry.db` with millisecond timestamps (`YYYY-MM-DD HH:MM:SS.mmm`).
     * Prevents data loss during field missions, recording battery health, atmospheric toxins, pressure variations, and GPS fixes.
  4. **REST API & Telemetry Serving**:
     * `GET /api/sensors`: Returns the latest real-time sensor metrics as JSON for the web frontend.
     * `GET /api/status`: Provides RF link status, RSSI, and database record count.
     * `GET /api/db/export`: One-click generation and streaming download of an official CSV mission log report for exhibition judges.

---

### 2. The Tactical Ground Cockpit Frontend: `app.js`, `index.html`, & `style.css`
**Files**: `software/ground-dashboard/app.js`, `index.html`, `style.css`  
**Built using**: HTML5 Canvas, Vanilla CSS3 (tactical military cyber aesthetic), and modern JavaScript.

* **How it was built**:
  1. **60 FPS Real-Time Bézier Spline Oscilloscope (`initTelemetryGraph()`)**:
     * Rendered directly on an HTML5 `<canvas>` via `requestAnimationFrame`.
     * Plots **6 continuous channels simultaneously** with zero line overlap:
       * **CH4 Methane** (Orange glow)
       * **CO Carbon Monoxide** (Red alert glow)
       * **Air Quality / VOC** (Amber)
       * **G-Force Shock Impact** (White)
       * **Chassis Roll Angle** (Neon Green)
       * **Chassis Pitch Angle** (Cyan)
     * Mathematical quadratic Bézier curves smooth the points into a fluid wave with pulsing cursor dots at the head.
  2. **Phone Optical Reconnaissance & IP Camera HUD (`refreshVideoFeed()`)**:
     * Mounts a smartphone on the rover as an HD wireless optical turret.
     * Streams MJPEG video with latency display (~45ms) and live FPS tracking.
     * **Auto-Torch in Darkness**: Checks sensor light levels and triggers the phone's LED flash when entering dark mine tunnels.
     * Multi-method command dispatcher (utilizing hidden iframes, image beacons, and fetch) to bypass browser CORS policies when issuing zoom, flip camera, and torch commands to the phone.
  3. **3D Artificial Horizon & Inclinometer (`updateInclinometer()`)**:
     * Calculates terrain pitch and roll.
     * Renders an aircraft-grade artificial horizon line and pitch ladder.
     * Pressing **'Z'** zero-calibrates offsets relative to the ground.
  4. **Emergency Gas Danger Hierarchy (`updateGasUI()`)**:
     * Evaluates raw ADC against calibrated safety standards:
       * Normal: Green Safe tags.
       * Elevated: Warning Amber tags.
       * Dangerous: Red Pulsing Danger badges ($CH_4 \ge 700$, $CO \ge 850$, $AQI \ge 700$).
  5. **Tactical Hotkey Engine (`initKeyboardShortcuts()`)**:
     * Single-keystroke control without taking hands off the keyboard:
       * `T` ➔ Toggle Phone Torch | `A` ➔ Auto-Torch mode
       * `F` ➔ Flip Front/Rear Camera | `S` ➔ Snapshot
       * `P` / `M` ➔ Optical Zoom In / Out
       * `Z` ➔ Zero-Calibrate Horizon | `Enter` ➔ Lock Network IPs

---

## 🔄 End-to-End Data Flow (How It All Connects)

```
[OPERATOR MOVES JOYSTICK]
         │
         ▼
1. Controller (ESP32) samples ADC sticks, computes CRC8, packs into 9 bytes
         │
         ▼ (ESP-NOW 100Hz RF Link)
2. Rover Master (ESP32-S3) checks CRC8 and watchdog failsafe
         │
         ▼ (UART 38400 baud: 0xAA 0x55 + Packet)
3. Motor Uno smoothly ramps BTS7960 PWM to spin wheels & sounds buzzer

─────────────────────────────────────────────────────────────────────────────

[ENVIRONMENTAL METHANE LEAK OCCURS ON GROUND]
         │
         ▼
1. Layer 2 Nano samples MQ-4 analog pin A0 & oversamples 3S Li-ion pack
2. Nano displays warning on 1.3" OLED HUD & serializes to "CR43,..." CSV
         │
         ▼ (RYLR998 LoRa AT Command @ 115200 baud)
3. Sub-GHz 868/915 MHz RF packet travels 1+ km through walls/rubble
         │
         ▼
4. Ground Station LoRa USB receiver receives: "+RCV=..."
5. Python backend (ground_station.py) logs record to SQLite database
6. Web Cockpit (app.js) updates 60 FPS oscilloscope curve and sounds alert
```

---

### 📂 Master Subsystem Reference Matrix

| Subsystem | Source Path | Key Responsibilities |
| :--- | :--- | :--- |
| **Protocol** | `firmware/shared/CyberProtocol.h` | 9-byte struct, CRC8 calculation, frame synchronization |
| **Controller** | `firmware/controller/remote-controller/remote-controller.ino` | Dual-core FreeRTOS, sticks calibration, CyberOS menu |
| **Rover Master** | `firmware/rover-master-esp32s3/rover-master-esp32s3.ino` | 100 Hz ESP-NOW receiver, failsafe watchdog, UART gateway |
| **Motor Drive** | `firmware/motor-controller-uno/motor-controller-uno.ino` | Dual BTS7960 H-Bridge, 3x radar pinging, AutoNavigator |
| **Sensors/LoRa** | `firmware/layer2-environmental-node-nano/layer2-environmental-node-nano.ino` | 7 instruments, RoboEyes OLED, RYLR998 packet broadcast |
| **Python Backend** | `software/ground-dashboard/ground_station.py` | COM port auto-connect, SQLite3 persistence, REST API |
| **Cockpit Engine** | `software/ground-dashboard/app.js` | 60 FPS canvas oscilloscope, artificial horizon, hotkeys |
