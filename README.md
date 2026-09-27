# 🛰️ CyberRover X4.3 — Modular Dual-Layer Exploration Platform

[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/veerpratapsaw-code/Cyber_Rover_X4.2-Open-Source)
[![Hardware Architecture](https://img.shields.io/badge/Architecture-Dual--Layer%20Modular-blue.svg)](hardware/MECHANICAL_INTEGRATION.md)
[![Telemetry](https://img.shields.io/badge/Telemetry-LoRa%20RYLR998%20%2B%20OLED-orange.svg)](firmware/layer2-environmental-node-nano/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)

> **CyberRover X4.3** is the next-generation open-source dual-deck unmanned ground vehicle (UGV) engineered for autonomous environmental hazard scouting, long-range LoRa telemetry broadcast, and harsh terrain exploration.

---

## 🏛️ Project Heritage: Evolution from CyberRover X4.2

CyberRover X4.3 represents a ground-up physical and electronic maturation of the original **CyberRover X4.2** project ([CyberRover X4.2 Repository](https://github.com/veerpratapsaw-code/Cyber_Rover_X4.2-Open-Source)).

### Key Architectural Advances in X4.3:
* **Two-Tier Layered Hierarchy**: Segregation of high-power mobility drives (Layer 1) from sensitive environmental/RF instrumentation (Layer 2).
* **Consolidated Environmental Deck**: All atmospheric instruments (MQ-4, MQ-7, MQ-135, DHT11, BMP280, GPS) are unified under an **Arduino Nano Layer 2 Master Controller**.
* **Long-Range LoRa Telemetry**: Integration of the **Reyax RYLR998 transceiver**, replacing short-range 2.4 GHz Wi-Fi dependency with kilometer-range 868/915 MHz RF link.
* **Global Positioning System**: Addition of the **u-blox NEO-6M GPS receiver** providing real-time latitude, longitude, satellite tracking, and altitude metrics.
* **Operator Instrument Binnacle**: Transition from a flat 16x2 character LCD to an angled wedge-mounted **1.3" I2C OLED Cyber HUD** cycling real-time diagnostic screens.
* **Vibration-Isolated Standoff Mounting**: Complete departure from temporary breadboards in favor of 5–10 mm nylon standoffs, physical cable channels, and shielded zones.

*(For detailed architectural comparison, read [`CHANGELOG_X4.2_TO_X4.3.md`](CHANGELOG_X4.2_TO_X4.3.md)).*

---

## 🧭 System Topography

```
                                CYBERROVER X4.3
                                       │
        ┌──────────────────────────────┴──────────────────────────────┐
        │                                                             │
        ▼                                                             ▼
┌───────────────────────────────┐             ┌───────────────────────────────┐
│     LAYER 1: CHASSIS & DRIVE  │             │ LAYER 2: ENVIRONMENTAL DECK   │
│                               │             │                               │
│ • 3S Li-ion Battery (11.1V)   │             │ • Arduino Nano (Layer 2 Mst)  │
│ • 5V High-Current Buck Reg    │             │ • MQ-4 Methane Sensor (A0)    │
│ • ESP32-S3 Rover Master       │             │ • MQ-7 Carbon Monox Sensor(A1)│
│ • Dual BTS7960 43A H-Bridges  │             │ • MQ-135 Air Quality (A2)     │
│ • 4WD Geared DC Motors        │             │ • 0-25V Battery Divider (A3)  │
│ • Ultrasonic Collision Radar  │             │ • BMP280 Barometer (A4/A5 I2C)│
│                               │             │ • 1.3" OLED HUD Pod (A4/A5)   │
│                               │             │ • u-blox NEO-6M GPS (Pin D2)  │
│                               │             │ • DHT11 Climate Sensor (Pin D4│
│                               │             │ • RYLR998 LoRa Radio (D0/D1)  │
└───────────────────────────────┘             └───────────────────────────────┘
```

---

## 🗂️ Repository Structure

```
cyberrover x4.3/
├── README.md                            # Primary project documentation & guide
├── CHANGELOG_X4.2_TO_X4.3.md            # Technical history & upgrade rationale
├── LICENSE.md                           # Open-source MIT license
├── .gitignore                           # Git build artifact exclusions
│
├── hardware/
│   ├── POWER_GRID_AND_WIRING.md         # Full schematics, voltage rails & pinouts
│   └── MECHANICAL_INTEGRATION.md        # Deck zone layout, standoffs & binnacle
│
└── firmware/
    └── layer2-environmental-node-nano/  # Production Layer 2 Arduino Nano firmware
        ├── layer2-environmental-node-nano.ino # Non-blocking cooperative scheduler
        ├── Config.h                     # Hardware pinout, baud rates & thresholds
        ├── Sensors.h                    # Unified 7-instrument acquisition engine
        ├── DisplayOLED.h                # 1.3" OLED Multi-Screen Cyber HUD Driver
        ├── LoRaTransceiver.h            # Reyax RYLR998 AT command serialization
        └── README.md                    # Hardware flashing & calibration manual
```

---

## ⚡ Master Pinout Matrix (Layer 2 Arduino Nano)

| Nano Pin | Peripheral Interconnect | Voltage Rail | Logic Level | Functional Description |
| :--- | :--- | :--- | :--- | :--- |
| **A0** | MQ-4 (CH4 Gas) `AO` | 5V Buck | 0–5V Analog | Methane / Natural Gas raw ADC |
| **A1** | MQ-7 (CO Gas) `AO` | 5V Buck | 0–5V Analog | Carbon Monoxide raw ADC |
| **A2** | MQ-135 (Air Quality) `AO` | 5V Buck | 0–5V Analog | Toxic VOC & Ammonia raw ADC |
| **A3** | 0–25V Voltage Divider | Battery (+) | 0–5V Analog | Real-time 3S LiPo battery monitoring |
| **A4 (SDA)** | BMP280 `SDA` + OLED `SDA` | ESP32-S3 3.3V| 3.3V I2C | Shared hardware I2C Data bus |
| **A5 (SCL)** | BMP280 `SCL` + OLED `SCL` | ESP32-S3 3.3V| 3.3V I2C | Shared hardware I2C Clock bus |
| **D0 (RX)** | RYLR998 LoRa `TXD` | ESP32-S3 3.3V| 3.3V TTL | Hardware UART RX (Direct) |
| **D1 (TX)** | RYLR998 LoRa `RXD` | ESP32-S3 3.3V| 3.3V Divided | Hardware UART TX via 1kΩ/2kΩ divider |
| **D2 (RX)** | u-blox NEO-6M GPS `TXD` | ESP32-S3 3.3V| 3.3V TTL | SoftwareSerial RX (9600 baud) |
| **D4** | DHT11 Climate `DATA` | 5V Buck | 5V Digital | Ambient temperature & relative humidity|

---

## 🚀 Setting Up Your New CyberRover X4.3 Git Repository

To initialize this folder as an independent open-source GitHub repository:

```bash
# 1. Open terminal inside the new cyberrover x4.3 directory:
cd "cyberrover x4.3"

# 2. Initialize a fresh Git repository:
git init

# 3. Stage all new X4.3 files:
git add .

# 4. Create initial commit:
git commit -m "Initial commit: CyberRover X4.3 dual-layer architecture & Layer 2 firmware"

# 5. Link to your new GitHub repository:
# git remote add origin https://github.com/YOUR_USERNAME/CyberRover_X4.3-Open-Source.git
# git branch -M main
# git push -u origin main
```

---

## 📜 License & Open Source Attribution
This project is open-source under the [MIT License](LICENSE.md). Derived from the educational and research work on CyberRover X4.2 by Veer Pratap Saw.
