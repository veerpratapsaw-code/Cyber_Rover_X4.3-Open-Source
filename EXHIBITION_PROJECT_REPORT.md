# REGIONAL SCIENCE & TECHNOLOGY EXHIBITION - RAMGARH
## OFFICIAL PROJECT SYNOPSIS & TECHNICAL REPORT

**Project Name**: CYBERROVER X4.3 — Modular Dual-Layer Autonomous Exploration & Environmental Scouting UGV  
**Category**: Robotics, Embedded Systems, Disaster Management & Industrial Safety  
**Previous Accolades**: 1st Prize Winner — State Level Science Exhibition  
**Innovator / Lead Developer**: Sanjay & Team  
**Platform Version**: CyberRover Architecture v4.3 (Open Source & Modular)  
**Date of Submission**: September 2026  

---

## 1. ABSTRACT & SCIENTIFIC OBJECTIVE

In hazardous environments such as underground coal mines (prevalent in the Ramgarh / Jharkhand mineral belt), chemical industrial leaks, and post-earthquake structural collapses, human first responders face lethal risks from toxic gases, combustible vapors, and structural instability. 

**CyberRover X4.3** is an unmanned ground exploration vehicle (UGV) engineered to enter, survey, and analyze high-threat disaster zones without endangering human life. Operating on a **segregated dual-tier embedded architecture**, the rover combines:
1. **Heavy-Duty Tactical Mobility (Layer 1)**: High-torque 4WD drivetrain with ultrasonic obstacle avoidance and failsafe communications.
2. **Atmospheric & Environmental Instrumentation Deck (Layer 2)**: Multi-gas array (CH4, CO, Air Quality/VOC), microclimate telemetry (Temperature, Relative Humidity, Dew Point, Barometric Pressure, Altitude), and GPS navigation.
3. **Long-Range LoRa RF Telemetry (RYLR998)**: Bypasses line-of-sight and Wi-Fi attenuation, achieving kilometer-range packet transmission through rubble and soil.
4. **Tactical Laptop Ground Cockpit & SQLite DBMS**: Real-time Heads-Up Display (HUD) displaying phone optical reconnaissance, 3D inclinometer artificial horizon, live telemetry oscilloscope, and a persistent SQLite database logging all mission telemetry with millisecond precision and 1-click CSV report export for emergency incident command.

---

## 2. KEY INNOVATIONS & SYSTEM NOVELTY

| Feature | Conventional Student Robots | CyberRover X4.3 Advantage |
| :--- | :--- | :--- |
| **Electronic Architecture** | Single microcontroller overloaded with motors + sensors | **Segregated Dual-Tier Architecture**: Motors on Uno/ESP32, Sensors on Nano, eliminating motor EMI and brownouts |
| **Onboard Display** | Heavy 16x2 text LCD or static screens | **Dynamic 1.3" OLED with Zero-RAM Procedural RoboEyes** boot sequence + clean double-spaced telemetry decks |
| **Communication Link** | Short-range 2.4 GHz Wi-Fi or Bluetooth (<30m) | **Sub-GHz Long-Range LoRa (RYLR998 @ 868/915 MHz)**: Penetrates thick walls, mine shafts, and rubble over 1+ km |
| **Ground Station Software**| Simple Arduino Serial Monitor | **Tactical Web Cockpit + SQLite DBMS Engine**: Live multi-sensor oscilloscope, artificial horizon, and full mission database logging |
| **Fail-Safe Power Grid** | Single unmonitored battery pack | **3S Li-ion Precision Monitoring**: Hardware divider with calibrated 0.852 trim factor, live voltage (12.1V), and graphical fill gauge |

---

## 3. MULTI-TIER SYSTEM ARCHITECTURE

CyberRover X4.3 divides computational tasks across dedicated, asynchronous microcontrollers:

```
+-------------------------------------------------------------------------+
|                       CYBERROVER X4.3 SYSTEM TOPOLOGY                   |
+-------------------------------------------------------------------------+
                                    |
          +-------------------------+-------------------------+
          |                                                   |
+-----------------------+                           +-------------------+
|  LAYER 1: MOBILITY    |                           | LAYER 2: SENSORS  |
|  - ESP32-S3 Master    |                           | - Arduino Nano    |
|  - Arduino Uno Driver |                           | - MQ-4, MQ-7, 135 |
|  - Dual BTS7960 (43A) |                           | - BMP280 + DHT11  |
|  - 4x High-Torque DC  |                           | - NEO-6M GPS      |
|  - Ultrasonic Radar   |                           | - 1.3" OLED HUD   |
|  - 3S Li-ion (12.6V)  |                           | - RYLR998 LoRa TX |
+-----------------------+                           +-------------------+
          |                                                   |
          | ESP-NOW / 2.4GHz                                  | LoRa 868/915MHz
          v                                                   v
+-----------------------+                           +-------------------+
| HANDHELD CONTROLLER   |                           | LAPTOP GROUND STN |
| - Dual Analog Sticks  |                           | - USB-TTL LoRa RX |
| - OLED Status HUD     |                           | - SQLite DBMS     |
| - Fail-Safe E-Stop    |                           | - Mission Cockpit |
+-----------------------+                           +-------------------+
```

---

## 4. DETAILED HARDWARE PINOUT & SPECIFICATIONS

### Layer 2: Environmental Instrumentation Deck (Arduino Nano ATmega328P)
* **Pin A0**: MQ-4 Combustible Gas & Methane ($CH_4$) Analog Sensor
* **Pin A1**: MQ-7 Toxic Carbon Monoxide ($CO$) Analog Sensor
* **Pin A2**: MQ-135 Hazardous Air Quality, Ammonia & Benzene Analog Sensor
* **Pin A3**: Precision 0–25V Voltage Divider ($30	ext{k}\Omega / 7.5	ext{k}\Omega$) for 3S Pack Voltage
* **Pin A4 (SDA) / Pin A5 (SCL)**: Shared Hardware $I^2C$ Bus:
  - 1.3" Monochrome OLED Display (SSD1306/SH1106 @ $0	ext{x}3	ext{C}$)
  - BMP280 High-Precision Digital Barometer & Thermometer (@ $0	ext{x}76$)
* **Pin D0 (RX) / Pin D1 (TX)**: Reyax RYLR998 LoRa Transceiver (Hardware Serial @ 115200 baud)
* **Pin D2 (RX) / Pin D3 (TX)**: u-blox NEO-6M GPS Module (SoftwareSerial @ 9600 baud)
* **Pin D4**: DHT11 Digital Temperature & Humidity Sensor

### Calibration Parameters:
* **Voltage Trim**: $	ext{Trim} = 0.852	ext{f}$ (Calibrated against calibrated digital multimeter at $12.10	ext{ V}$)
* **3S Li-ion Envelope**: Cutoff = $9.60	ext{ V}$ ($0\%$), Nominal = $11.10	ext{ V}$ ($50\%$), Max Charge = $12.60	ext{ V}$ ($100\%$)
* **Gas Danger Thresholds**: MQ-4 $\ge 700	ext{ ADC}$, MQ-7 $\ge 850	ext{ ADC}$, MQ-135 $\ge 700	ext{ ADC}$

---

## 5. TELEMETRY PROTOCOL & DBMS LOGGING

Telemetry packets are broadcast every 1.5 seconds via LoRa in an optimized CSV string:

$$\mathbf{CR43,<pkt>,<volt>,<mq4>,<mq7>,<mq135>,<dhtT>,<dhtH>,<bmpT>,<pres>,<alt>,<fix>,<lat>,<lon>,<sat>,<hdop>,<gpsAlt>,<spd>}$$

### SQLite DBMS Schema (`mission_telemetry.db`):
* `id`: Auto-incrementing primary key
* `timestamp`: ISO-8601 millisecond-precision local time
* `packet_id`: Sequence counter for link reliability / packet loss analysis
* `battery_voltage`, `battery_percent`: Real-time power diagnostics
* `mq4_raw`, `mq7_raw`, `mq135_raw`: 10-bit raw ADC gas readings
* `temp_c`, `humidity`, `dew_point_c`: Atmospheric microclimate
* `pressure_hpa`, `altitude_m`: Barometric elevation profile
* `gps_fix`, `latitude`, `longitude`, `satellites`, `speed_kmh`: Geospatial localization
* `rssi`, `snr`: Radio frequency signal-to-noise and link budget metrics

---

## 6. FIELD APPLICATION & DISASTER SCENARIOS

1. **Underground Mine Safety (Ramgarh & Coalfields)**:
   - Detects methane build-ups ($CH_4$) before explosive thresholds are reached.
   - Monitors lethal carbon monoxide ($CO$) generated by smoldering coal seams.
2. **Hazardous Industrial Scouting**:
   - Inspects pipelines and storage tanks in chemical and petrochemical facilities without human entry.
3. **Post-Disaster Urban Search & Rescue**:
   - Penetrates collapsed buildings; uses phone IP optical zoom and night illumination to locate survivors.
   - GPS and altimeter record spatial 3D maps of safe ingress pathways.

---

## 7. CONCLUSION & FUTURE WORK

CyberRover X4.3 demonstrates that advanced search-and-rescue robotics can be built reliably using modular open-source architectures. By decoupling propulsion from telemetry, establishing long-range LoRa wireless links, and enforcing database-backed telemetry logging, the platform delivers enterprise-grade field exploration capabilities at a fraction of the cost of commercial reconnaissance units.

**Future Roadmap (CyberRover X5)**:
* Thermal imaging FLIR camera integration.
* Autonomous SLAM LIDAR mapping.
* Multi-rover cooperative swarm mesh networking.
