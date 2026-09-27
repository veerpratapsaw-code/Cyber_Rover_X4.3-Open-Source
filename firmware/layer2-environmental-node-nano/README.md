# 🛰️ CyberRover X4.3 — Layer 2 Environmental & Telemetry Node

> [!IMPORTANT]
> **MEMORY-OPTIMIZED PRODUCTION FIRMWARE (ATmega328P)**:
> This firmware is engineered to fit within the Arduino Nano's 30,720-byte flash limit and 2,048-byte SRAM limit.
> - **Zero-RAM Framebuffer OLED Driver**: Saves **1,024 bytes of SRAM** and ~10 KB of Flash by streaming text directly to display pages over I2C instead of caching a full screen in dynamic RAM.
> - **Native Lightweight BMP280 Driver**: Eliminates `Adafruit_BMP280`, `Adafruit_Sensor`, and `Adafruit_BusIO` virtual class overhead, saving **~4,500 bytes of Flash**.
> - **Only 2 External Libraries Required**: `DHT sensor library` and `TinyGPSPlus`!

---

## 🗂️ Module Architecture

```
firmware/layer2-environmental-node-nano/
├── layer2-environmental-node-nano.ino   # Main cooperative non-blocking scheduler
├── Config.h                             # Hardware pins, baud rates, thresholds & timings
├── Sensors.h                            # Unified 7-sensor engine + built-in native BMP280 driver
├── DisplayOLED.h                        # Built-in zero-RAM direct I2C OLED Cyber HUD Driver
├── LoRaTransceiver.h                    # Reyax RYLR998 AT command serialization & LoRa broadcast
└── README.md                            # Comprehensive operations manual
```

---

## ⚡ Master Wiring & Pinout Table

| Device | Device Pin | Arduino Nano Pin | Voltage Rail | Logic Level | Electrical Notes / Interconnect |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **MQ-4 Gas** | AO (Analog) | **A0** | 5V Buck | 0–5V Analog | High-current heater (~150mA); DO left unconnected |
| **MQ-7 Gas** | AO (Analog) | **A1** | 5V Buck | 0–5V Analog | High-current heater (~150mA); DO left unconnected |
| **MQ-135 Gas**| AO (Analog) | **A2** | 5V Buck | 0–5V Analog | High-current heater (~150mA); DO left unconnected |
| **0–25V Batt Sensor** | S (Signal) | **A3** | Battery (+) | 0–5V Analog | Connects across 3S pack; 5:1 onboard voltage divider |
| **BMP280 Barometer** | SDA | **A4 (SDA)** | ESP32-S3 3.3V | 3.3V I2C | Shared I2C Bus with OLED (Address `0x76` or `0x77`) |
| **BMP280 Barometer** | SCL | **A5 (SCL)** | ESP32-S3 3.3V | 3.3V I2C | Shared I2C Bus with OLED |
| **1.3" I2C OLED** | SDA | **A4 (SDA)** | ESP32-S3 3.3V | 3.3V I2C | Shared I2C Bus with BMP280 (Address `0x3C`) |
| **1.3" I2C OLED** | SCL | **A5 (SCL)** | ESP32-S3 3.3V | 3.3V I2C | Shared I2C Bus with BMP280 |
| **u-blox NEO-6M GPS** | TXD | **D2** | ESP32-S3 3.3V | 3.3V CMOS | Nano SoftwareSerial RX; GPS RXD left unconnected |
| **DHT11 Climate** | DATA | **D4** | 5V Buck | 5V Digital | Single-wire bidirectional protocol |
| **RYLR998 LoRa** | TXD | **D0 (RX)** | ESP32-S3 3.3V | 3.3V CMOS | Nano Hardware Serial RX (Direct connection) |
| **RYLR998 LoRa** | RXD | **D1 (TX)** | ESP32-S3 3.3V | **3.3V Divided** | **Requires 5V $\rightarrow$ 3.3V Divider** (1kΩ series / 2kΩ GND) |

---

## 🛠️ Required Arduino Libraries

You only need **2 external libraries** from the Arduino Library Manager (`Ctrl + Shift + I`):

1. **`DHT sensor library`** (by Adafruit)
2. **`TinyGPSPlus`** (by Mikal Hart)

*(All other drivers — including BMP280, OLED, Wire, and SoftwareSerial — are self-contained and pre-built into the firmware).*

---

## ⚠️ Critical Upload Interlock (Nano D0/D1)

* **The Rule**: When flashing new firmware from the Arduino IDE over USB, **temporarily disconnect the jumper from Nano Pin D0 (RX)**. 
* Pins D0 and D1 are shared with the CH340 USB-to-Serial converter. Reconnect D0 right after the upload completes!
