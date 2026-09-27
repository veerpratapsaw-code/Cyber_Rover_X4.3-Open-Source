# 💻 CyberRover X4.2 — Ground Cockpit Web Dashboard

This directory contains the tactical laptop ground station cockpit dashboard for the **CyberRover X4.2**.

---

## 🎯 Dashboard Overview

The dashboard runs locally on any operator laptop or tablet without requiring internet access or heavy backend frameworks. It connects over the rover's local 2.4 GHz Wi-Fi access point or hotspot and polls the ESP32-CAM telemetry hub at **4 Hz**.

### Monitored Real-Time Parameters:
- **MQ-4 Methane Sensor**: Real-time ADC level + danger status badges (`NORMAL`, `ELEVATED`, `EXPLOSIVE DANGER`).
- **MQ-7 Carbon Monoxide**: Real-time ADC level + toxic danger badges.
- **MQ-135 Air Quality**: Real-time ADC level + atmospheric index.
- **DHT11 Climate**: Live temperature (°C and °F), relative humidity (%), and computed dew point.
- **BMP280 Barometer**: Atmospheric pressure (hPa) and barometric altitude (meters / feet) with ascent/descent indicators.
- **6-Channel Bézier Oscilloscope**: Smooth Canvas-rendered live graphs for all environmental parameters.
- **Searchlight Control**: Keyboard shortcut `T` or on-screen button toggles the rover's high-power white LED torch.

---

## 🚀 How to Launch

1. Connect your operator laptop to the rover's 2.4 GHz hotspot or access point.
2. Double-click [`start_dashboard.bat`](start_dashboard.bat) (Windows) or open [`index.html`](index.html) directly in Google Chrome, Edge, or Firefox.
3. In the top IP bar, enter the rover's ESP32-CAM IP address (e.g. `192.168.43.100`) and press **Enter**.
4. Telemetry cards and oscilloscope graphs will begin updating in real time.
