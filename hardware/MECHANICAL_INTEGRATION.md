# 🛠️ CyberRover X4.3 — Mechanical Deck Integration Guide

> [!IMPORTANT]
> This guide outlines the structural fabrication, standoff mounting, sensor airflow zones, RF clearances, and instrument binnacle construction for **CyberRover X4.3**.

---

## 📐 1. Deck Zone Topography

The upper deck (Layer 2) is partitioned into four distinct functional zones to eliminate thermal, acoustic, and electromagnetic interference:

```
                            FRONT OF ROVER
                                  │
                                  ▼
      ┌────────────────────────────────────────────────────────┐
      │               ZONE A: ENVIRONMENTAL SAMPLING           │
      │        [MQ-4]            [MQ-7]            [MQ-135]    │
      │       (Methane)      (Carbon Monox)      (Air Quality) │
      │                                                        │
      │                  [DHT11 Climate Vent]                  │
      ├────────────────────────────────────────────────────────┤
      │               ZONE B: COMPUTE & POWER LOGIC            │
      │                                                        │
      │        ┌──────────────┐         ┌──────────────┐       │
      │        │   ESP32-S3   │         │ ARDUINO NANO │       │
      │        │ (Layer 1 GW) │         │ (Layer 2 Mst)│       │
      │        └──────────────┘         └──────────────┘       │
      │               │                        │               │
      │               ▼                        ▼               │
      │        [5V/3.3V Rails]         [BMP280 Barometer]      │
      ├────────────────────────────────────────────────────────┤
      │               ZONE C: RF & GLOBAL POSITIONING          │
      │                                                        │
      │         ┌────────────────┐     ┌──────────────┐        │
      │         │ NEO-6M GPS     │     │ RYLR998 LoRa │        │
      │         │ Ceramic Patch  │     │ 868/915 Ant. │        │
      │         └────────────────┘     └──────────────┘        │
      ├────────────────────────────────────────────────────────┤
      │               ZONE D: OPERATOR INSTRUMENTATION         │
      │                                                        │
      │                   ╱──────────────────╲                 │
      │                  ╱  1.3" OLED DISPLAY ╲                │
      │                 ╱  ANGLED BINNACLE POD ╲               │
      │                └────────────────────────┘              │
      └────────────────────────────────────────────────────────┘
                                  ▲
                                  │
                             REAR OF ROVER
```

---

## 🔩 2. Mechanical Mounting Rules

### Rule 1: Removable Standoff Architecture (No Hot Glue)
* Mount all microcontrollers and modules using **M3 nylon or brass standoffs** with $5\,\text{mm}$ to $10\,\text{mm}$ clearance above the deck plate.
* Benefits:
  * Eliminates vibration fatigue during rough surface driving.
  * Prevents accidental solder bridge shorts against conductive carbon or damp MDF.
  * Allows rapid removal and servicing during field operations.

### Rule 2: Gas Sensor Exposure vs Heat Isolation
* The sensing meshes of **MQ-4, MQ-7, and MQ-135** must face outwards through dedicated deck or side cutouts to sample ambient atmosphere.
* **DHT11 Placement**: Do not place the DHT11 directly beside the MQ sensor bodies. MQ internal heating coils reach over $150^\circ\text{C}$ internally; mounting the DHT11 too close will induce false elevated temperature readings. Place DHT11 at an outer ventilation boundary.

### Rule 3: BMP280 Enclosure & Pressure Equalization
* The BMP280 barometric sensor must be mounted inside the central protected electronics bay to shield it from dynamic ram-air wind pressure caused by vehicle forward motion.
* Provide a small $2\,\text{mm}$ atmospheric equalization hole in the enclosure shell.

### Rule 4: GPS Zenith View & Antenna Clearances
* Mount the **NEO-6M GPS** near the highest, rearmost point of the upper plate.
* The ceramic patch antenna must point directly toward the zenith (sky). Never place metal plates, battery packs, or carbon fiber directly over the patch.

### Rule 5: Operator-Facing Angled Instrument Binnacle
* The **1.3" I2C OLED display** must not be mounted flat on the deck.
* Fabricate a wedge-shaped instrument pod (angled at $30^\circ$ to $45^\circ$ facing the rear) so the operator can inspect sensor readouts and GPS fix status at a glance without bending over the rover:
  ```
                   1.3" OLED DISPLAY
                 ┌───────────────────┐
                /                    │
               /                     │
              /      30°-45°         │
             /     Operator Tilt     │
  ──────────┴────────────────────────┴──────────
                  UPPER DECK PLATE
  ```

---

## 🪢 3. Cable Channel Routing Separation

To prevent motor commutation electromagnetic interference (EMI) from corrupting sensor and RF data, route wires in dedicated physical channels:

1. **Power Channel**: Direct path from 3S battery to buck converter and H-bridges.
2. **Motor PWM Channel**: High-current leads isolated to the lower chassis deck.
3. **Sensor & I2C Bus Channel**: Low-voltage signal wires running along the center channel.
4. **RF Antenna Channel**: LoRa and GPS antenna coax lines kept clear of motor driver lines.
