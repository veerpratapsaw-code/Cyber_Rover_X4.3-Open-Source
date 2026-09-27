# ⚡ CyberRover X4.3 — Power Grid & Master Wiring Architecture

> [!IMPORTANT]
> This document specifies the complete electrical wiring diagram, voltage rails, pinout matrices, and logic-level conversion circuits for **CyberRover X4.3**.

---

## 🧭 1. Dual-Rail Power Distribution Grid

```
                         3S LITHIUM-ION BATTERY PACK
                         (Nominal: 11.1V | Peak: 12.6V)
                                       │
               ┌───────────────────────┴───────────────────────┐
               │                                               │
               ▼                                               ▼
     HIGH-CURRENT 5V BUCK                              0-25V VOLTAGE SENSOR
     CONVERTER REGULATOR                                       │
               │                                               ▼
       ┌───────┴───────┐                                    Nano A3
       │               │
      +5V             GND (Unified Common Ground)
       │               │
       ├── Arduino Nano (5V Pin)
       ├── MQ-4 Methane Sensor VCC (~150mA)
       ├── MQ-7 Carbon Monoxide Sensor VCC (~150mA)
       ├── MQ-135 Air Quality Sensor VCC (~150mA)
       ├── DHT11 Climate Sensor VCC (~2mA)
       │
       └── ESP32-S3 Dev Board (5V / VBUS Pin)
               │
               ▼ (Onboard 3.3V Linear Regulator)
          +3.3V LOGIC & RF BUS
               │
               ├── Reyax RYLR998 LoRa Transceiver (~120mA Peak TX)
               ├── u-blox NEO-6M GPS Receiver (~50mA Tracking)
               ├── BMP280 Barometer Sensor (~2mA)
               └── 1.3" I2C OLED Display Module (~25mA)
```

> [!CAUTION]
> **ELECTRICAL RULE**:
> Never connect the Arduino Nano's onboard `3.3V` pin to the 3.3V distribution rail. The Nano's onboard regulator can only output 30–50mA max and will instantly brown out or burn when the RYLR998 transmits. The 3.3V bus must be powered by the ESP32-S3's dedicated regulator.

---

## 📌 2. Layer 2 Arduino Nano Master Pinout Matrix

| Nano Pin | Peripheral Interconnect | Signal Direction | Logic Level | Notes / Protection |
| :--- | :--- | :--- | :--- | :--- |
| **A0** | MQ-4 (CH4 Gas) `AO` | Input (Analog) | 0–5V | 10-bit ADC read (DO pin left floating) |
| **A1** | MQ-7 (CO Gas) `AO` | Input (Analog) | 0–5V | 10-bit ADC read (DO pin left floating) |
| **A2** | MQ-135 (Air Quality) `AO` | Input (Analog) | 0–5V | 10-bit ADC read (DO pin left floating) |
| **A3** | 0–25V Voltage Module `S/OUT`| Input (Analog) | 0–5V | Measures 3S battery through 5:1 divider |
| **A4 (SDA)**| BMP280 `SDA` + OLED `SDA` | Bidirectional | 3.3V / 5V | Shared hardware I2C data bus |
| **A5 (SCL)**| BMP280 `SCL` + OLED `SCL` | Output (Clock) | 3.3V / 5V | Shared hardware I2C clock bus |
| **D0 (RX)** | RYLR998 LoRa `TXD` | Input (Serial) | 3.3V TTL | Direct connection to Nano RX pin |
| **D1 (TX)** | RYLR998 LoRa `RXD` | Output (Serial) | **3.3V Divided** | **Requires 1kΩ / 2kΩ voltage divider** |
| **D2 (RX)** | u-blox NEO-6M GPS `TXD` | Input (Serial) | 3.3V TTL | SoftwareSerial RX (GPS RXD left floating) |
| **D3 (TX)** | *(Reserved for GPS TX)* | — | — | Not connected |
| **D4** | DHT11 Climate `DATA` | Bidirectional | 5V Digital | Single-wire digital data pin |

---

## 🔌 3. Signal Conditioning & Level-Shifting Schematics

### A. Nano D1 (TX) $\rightarrow$ RYLR998 RXD Voltage Divider
The ATmega328P drives `D1 (TX)` at 5.0V. The RYLR998 input is strictly 3.3V. A two-resistor divider safely shifts the voltage down:

```
Nano Pin D1 ──────────[ 1.0 kΩ ]──────────┬──────────> RYLR998 RXD
                                          │
                                       [ 2.0 kΩ ]
                                          │
                                         GND
```
$$\text{Output Voltage} = 5.0\,\text{V} \times \frac{2.0\,\text{k}\Omega}{1.0\,\text{k}\Omega + 2.0\,\text{k}\Omega} = 3.33\,\text{V}$$

### B. 3S Battery Voltage Sensing (Pin A3)
The 0–25V voltage divider module steps down the battery pack voltage (9.6V to 12.6V) by a factor of 5:1:
```
3S Battery (+) ───────[ 30.0 kΩ ]─────────┬──────────> Nano Pin A3
                                          │
                                       [ 7.5 kΩ ]
                                          │
Battery (-) / GND ────────────────────────┴──────────> Common GND
```
$$\text{Max Voltage at A3} = \frac{12.6\,\text{V}}{5.0} = 2.52\,\text{V} \quad (\text{Safely below 5.0V ADC limit})$$

---

## ⚡ 4. Pre-Power Safety Verification Protocol

Before powering the rover from the 3S battery, execute this test checklist with a multimeter:
1. **Buck Converter Output Check**: Disconnect all loads, power the 5V buck from the battery, and confirm output is exactly $5.00 \pm 0.10\,\text{V}$.
2. **ESP32-S3 3.3V Rail Check**: Power the ESP32-S3 via the 5V rail and verify its 3.3V pin outputs $3.30 \pm 0.05\,\text{V}$.
3. **Continuity & Short-Circuit Check**: Ensure resistance between 5V and GND is $>1\,\text{k}\Omega$ and between 3.3V and GND is $>1\,\text{k}\Omega$.
4. **Common Ground Verification**: Verify $0.0\,\Omega$ continuity between Nano GND, ESP32-S3 GND, battery ground, and all peripheral grounds.
