# 📜 CyberRover Evolution: Architectural Changelog (X4.2 $\rightarrow$ X4.3)

> [!NOTE]
> This document records the architectural lineage from **CyberRover X4.2** to **CyberRover X4.3**, detailing the motivation, structural reorganizations, power grid improvements, and new hardware nodes.

---

## 🏛️ 1. CyberRover X4.2 Baseline Architecture (Previous System)

The **CyberRover X4.2** established the foundational distributed microcontroller architecture:
* **Node 01 (Handheld Remote Controller)**: ESP32 DevKit V1 with dual analog joysticks and ESP-NOW 2.4 GHz transmission.
* **Node 02 (Rover Master)**: ESP32-S3 receiving ESP-NOW packets and relaying drive commands to the Uno via hardware UART (GPIO 17 $\rightarrow$ Uno Pin 2 at 38400 baud).
* **Node 03 (Motor Controller & Sonar Radar)**: Arduino Uno driving 4WD DC motors via dual high-current BTS7960 43A H-bridges and sampling 3x HC-SR04 ultrasonic rangefinders.
* **Node 04 (Gas Sensing Node)**: Arduino Nano reading analog voltages from MQ-4, MQ-7, and MQ-135, rendering to a 16x2 I2C LCD, and streaming CSV over UART.
* **Node 05 (Telemetry Hub & Video)**: ESP32-CAM hosting an onboard HTTP server (`/telemetry`), sampling DHT11 and BMP280, driving an LED searchlight, and streaming OV2640 video.

### Challenges Identified in X4.2:
1. **Breadboard Vulnerability**: The experimental upper deck relied on temporary breadboard jumper harnesses prone to vibration-induced disconnects during rover movement.
2. **Fragmented Environmental Sensing**: Atmospheric sensing was split across two microcontrollers (Nano handled gas; ESP32-CAM handled DHT11 & BMP280), creating unnecessary inter-board communication overhead.
3. **Short-Range Telemetry**: Telemetry was tied to 2.4 GHz Wi-Fi / ESP-NOW, which suffers rapid signal attenuation through walls, obstacles, and outdoor line-of-sight barriers.
4. **No Positioning System**: Lack of GPS meant the rover could not determine real-world coordinates or relative elevation drift.
5. **Display Ergonomics**: The 16x2 LCD mounted flat on the rover deck made operator field inspection difficult while standing or driving.

---

## 🚀 2. CyberRover X4.3 Major Upgrades & Innovations

### A. Two-Tier Hierarchical Deck Architecture (Layer 1 & Layer 2)
* **Layer 1 (Chassis Core & Mobility)**:
  * Houses high-current components: 3S Li-ion/LiPo battery pack, high-efficiency 5V step-down buck converter, dual BTS7960 H-bridges, 4x geared DC motors, and ESP32-S3 rover master.
* **Layer 2 (Environmental & Long-Range Telemetry Deck)**:
  * Dedicated modular upper deck governed by the **Arduino Nano as Master Controller**.
  * Consolidates all atmospheric, climate, altimetry, positioning, and operator display subsystems into a unified, isolated platform.

### B. Hardware & Sensor Upgrades in X4.3

| Subsystem | CyberRover X4.2 | CyberRover X4.3 | Engineering Advantage in X4.3 |
| :--- | :--- | :--- | :--- |
| **Environmental MCU** | Split between Nano & ESP32-CAM | **Dedicated Arduino Nano (Layer 2 Master)** | Single authoritative data acquisition engine; zero packet drops |
| **Long-Range Comms** | 2.4 GHz Wi-Fi / ESP-NOW only | **Reyax RYLR998 LoRa Transceiver (868/915 MHz)** | Kilometer-scale telemetry penetration bypassing 2.4 GHz noise |
| **Global Positioning** | None (Dead reckoning / remote) | **u-blox NEO-6M GPS Receiver** | Absolute latitude, longitude, satellite count, and GPS altitude |
| **Local Display** | 16x2 Character LCD (Flat mounted) | **1.3" I2C OLED (128x64) in Angled Instrument Pod** | High-contrast multi-page Cyber HUD tilted toward operator |
| **Climate & Altimetry** | Handled by ESP32-CAM | **Directly integrated into Layer 2 Nano (DHT11 + BMP280)** | Unified environmental timestamping and fail-safe telemetry |
| **Battery Monitoring** | Uncalibrated voltage estimator | **0–25V Precision Divider Module on Nano Pin A3** | Real-time 3S LiPo voltage tracking with software calibration trim |
| **Physical Mounting** | Breadboards glued to MDF | **5–10 mm Removable Nylon Standoffs & Cable Channels** | High vibration dampening, clean wire routing, rapid servicing |

### C. Redesigned Power Distribution Grid
* **5V Primary Rail**: High-current 5V buck converter powers Nano, MQ heaters (450mA total), DHT11, and ESP32-S3 logic.
* **3.3V Secondary Rail**: Isolated rail sourced from the ESP32-S3 onboard LDO powering RYLR998 LoRa, NEO-6M GPS, BMP280, and 1.3" OLED. Protects the Nano from brownouts.
* **Common Ground Reference**: Unified star-ground topology preventing ground loops between high-current motor drivers and sensitive analog gas sensors.
