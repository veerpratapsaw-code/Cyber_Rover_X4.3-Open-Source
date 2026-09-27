# 🕹️ CyberRover X4.2 — Handheld Remote Controller (ESP32)

This directory contains the complete source code for the **CyberRover X4.2 Handheld Remote Controller**, running on an **Espressif ESP32 DevKit V1**.

![CyberRover Remote Hero](../../media/remote-controller/cyberrover_x4_remote_hero.png)

---

## 🧭 System Overview

The handheld controller provides real-time, zero-delay wireless teleoperation of the rover over **2.4 GHz ESP-NOW**. It features an integrated **Cyber OS** micro-operating system displayed on a high-refresh 0.96" SSD1306 OLED (128x64 resolution via 400kHz I2C).

> [!NOTE]
> The physical remote controller is an authentic handmade prototype constructed with custom-contoured MDF/cardboard, dual analog thumbsticks, toggle switches, and tactile pushbuttons. A full manufacturing BOM and assembly manual is deferred. Do not modify or misrepresent its handmade physical nature.

---

## 🎮 Controls & Operating Modes

| Input Control | Hardware Pin | Primary Function in Driving HUD | Secondary Function in Cyber OS |
| :--- | :--- | :--- | :--- |
| **Left Joystick (X/Y)** | GPIO 34 (LX), 35 (LY) | Steering (X) & Throttle (Y) | Menu navigation & parameter scroll |
| **Left Click (JL)** | GPIO 25 (`INPUT_PULLUP`) | Calibration trigger | Universal **BACK** / Exit sub-app |
| **Right Joystick (X/Y)** | GPIO 32 (RX), 33 (RY) | Secondary pan/tilt / speed trim | Horizontal / vertical navigation |
| **Right Click (JR)** | GPIO 26 (`INPUT_PULLUP`) | Display reset / instant re-init | Universal **ENTER** / Select |
| **Push Button 1 (P1)** | GPIO 14 (`INPUT_PULLUP`) | **Honk Vehicle Horn** | Universal **SAVE** to NVS Flash (`SAVED OK`) |
| **Push Button 2 (P2)** | GPIO 27 (`INPUT_PULLUP`) | Toggle **Manual MN $\leftrightarrow$ Auto Assist** | Toggle drive mode |
| **Toggle Switch 1 (T1)**| GPIO 12 (`INPUT_PULLUP`) | Flip DOWN = Live Driving HUD | Flip UP = Enter Cyber OS System Menu |
| **Toggle Switch 2 (T2)**| GPIO 13 (`INPUT_PULLUP`) | **Master Parking Brake** (Zeroes all motors) | Master Parking Brake |
| **Battery Voltage ADC** | GPIO 36 / VP (ADC1_CH0)| Remote battery voltage divider monitoring | Display remote battery status |

---

## 💻 Cyber OS Architecture

The remote firmware is modularized into dedicated managers:
- [`remote-controller.ino`](remote-controller.ino): Main setup and real-time execution loop.
- [`Config.h`](Config.h): Pin assignments, ESP-NOW peer MAC address, and calibration constants.
- [`CyberProtocol.h`](CyberProtocol.h): 9-byte packet definition shared with the rover.
- [`DisplayManager.h`](DisplayManager.h): Fast Adafruit SSD1306 drawing engine, driving HUD, radar indicators.
- [`JoystickManager.h`](JoystickManager.h): Non-linear curve mapping, center deadband filtering, ADC smoothing.
- [`CommsManager.h`](CommsManager.h): ESP-NOW transmission loop, packet retry, and link health monitoring.
- [`PhoneOSManager.h`](PhoneOSManager.h): Interactive OS menus, system settings, and diagnostic screens.
- [`BatteryManager.h`](BatteryManager.h): Battery ADC sampling and battery bar calculations.
- [`BootAnimation.h`](BootAnimation.h) & [`bitmaps.h`](bitmaps.h): Startup animations and Panther logo splash.

---

## 📸 Authentic Controller Photographs

- **Studio Hero View**: [`media/remote-controller/cyberrover_x4_remote_hero.png`](../../media/remote-controller/cyberrover_x4_remote_hero.png)
- **Top Controls View**: [`media/remote-controller/cyberrover_x4_remote_controls.png`](../../media/remote-controller/cyberrover_x4_remote_controls.png)
- **Engineering Perspective**: [`media/remote-controller/cyberrover_x4_remote_engineering_view.png`](../../media/remote-controller/cyberrover_x4_remote_engineering_view.png)
- **In-Hand Field Photo**: [`media/remote-controller/cyberrover_x4_remote_photo_01.jpg`](../../media/remote-controller/cyberrover_x4_remote_photo_01.jpg)
