/**
 * ============================================================================
 * PROJECT   : CYBERROVER X4.3 — LAYER 2 ENVIRONMENTAL & TELEMETRY NODE
 * FILE      : layer2-environmental-node-nano.ino
 * MCU       : Arduino Nano (ATmega328P / 5V / 16MHz)
 * FRAMEWORK : Arduino AVR Core
 * 
 * FEATURES:
 *   - Procedural zero-RAM RoboEyes boot animation (FluxGarage style rounded eyes, glance & blink).
 *   - Minimalist vector UI: Universal top bar with LoRa antenna icon & drawn battery box (percentage inside).
 *   - Zero character glitches: Real drawn outline boxes with solid pixel fills for gas bar meters.
 *   - 3 clean data decks: Climate Deck (2x2 grid with unified average temp), Gas Deck, and GPS Deck.
 *   - 10-second minimum screen rotation (zero buffer overhead, safe for Nano 2KB SRAM).
 *   - Calibrated, jitter-free 3S battery monitoring (16x oversampled ADC).
 *   - Zero blocking delay() in loop() so GPS serial characters are never lost.
 *
 * OPERATING MODES (controlled by ENABLE_LORA_TRANSMISSION in Config.h):
 *   MODE A (ENABLE_LORA_TRANSMISSION = false):
 *     - Serial Monitor dashboard ON (prints full sensor table to USB)
 *     - LoRa transmission OFF (D0/D1 used for USB Serial)
 *     - Use this for bench debugging with Serial Monitor
 *     
 *   MODE B (ENABLE_LORA_TRANSMISSION = true):
 *     - Serial Monitor dashboard OFF (D0/D1 owned by RYLR998)
 *     - LoRa transmission ON (sends CSV telemetry every 2 seconds)
 *     - OLED display remains active (shows all data on the rover)
 * ============================================================================
 */

#include <Arduino.h>
#include <Wire.h>
#include <SoftwareSerial.h>
#include <DHT.h>
#include <TinyGPSPlus.h>

#include "Config.h"
#include "Sensors.h"
#include "DisplayOLED.h"
#include "LoRaTransceiver.h"

// ============================================================================
// GLOBAL SUBSYSTEM INSTANCES
// ============================================================================

SensorSuite     sensorDeck;
DisplayHUD      instrumentBinnacle;
LoRaTransceiver loraLink;
Layer2Telemetry liveTelemetry;

// Non-blocking Task Timers
unsigned long lastSensorSample = 0;
unsigned long lastOledRefresh  = 0;
unsigned long lastSerialPrint  = 0;

// ============================================================================
// SERIAL MONITOR DASHBOARD PRINTER (ONLY ACTIVE WHEN LORA IS DISABLED)
// ============================================================================
#if !ENABLE_LORA_TRANSMISSION

void printSerialConsole(const Layer2Telemetry &d) {
  Serial.println();
  Serial.println(F("======================================================================"));
  Serial.println(F("              CYBERROVER X4.3 — LAYER 2 SENSOR CONSOLE                "));
  Serial.println(F("======================================================================"));

  // 1. BATTERY & POWER
  Serial.println(F("[1. BATTERY & POWER SUBSYSTEM]"));
  Serial.print(F("   Battery Voltage     : "));
  Serial.print(d.batteryVoltage, 2);
  Serial.println(F(" V"));

  Serial.print(F("   State of Charge     : "));
  Serial.print(d.batteryPercent);
  Serial.print(F(" %  ["));
  if (d.batteryPercent > 75)      Serial.print(F("████"));
  else if (d.batteryPercent > 50) Serial.print(F("███ "));
  else if (d.batteryPercent > 25) Serial.print(F("██  "));
  else if (d.batteryPercent > 10) Serial.print(F("█   "));
  else                           Serial.print(F("WARN"));
  Serial.println(F("]"));

  Serial.print(F("   Raw ADC (Smoothed)  : "));
  Serial.print(d.batteryRaw);
  Serial.print(F(" / 1023  (Status: "));
  Serial.print(d.batteryLow ? F("LOW BATTERY WARNING") : F("NORMAL"));
  Serial.println(F(")"));

  // 2. ATMOSPHERIC GAS SENSORS
  Serial.println();
  Serial.println(F("[2. ATMOSPHERIC GAS SENSOR ARRAY]"));
  Serial.print(F("   MQ-4   (Methane / CNG) : "));
  Serial.print(d.mq4Raw);
  Serial.println(d.mq4Alert ? F("  --> [ALERT: ELEVATED GAS]") : F("  [OK: CLEAN]"));

  Serial.print(F("   MQ-7   (Carbon Monox)  : "));
  Serial.print(d.mq7Raw);
  Serial.println(d.mq7Alert ? F("  --> [ALERT: ELEVATED CO]") : F("  [OK: CLEAN]"));

  Serial.print(F("   MQ-135 (Air Quality)   : "));
  Serial.print(d.mq135Raw);
  Serial.println(d.mq135Alert ? F("  --> [ALERT: POOR AIR]") : F("  [OK: CLEAN]"));

  // 3. CLIMATE & BAROMETER (BOTH DHT11 & BMP280 DISPLAYED SEPARATELY!)
  Serial.println();
  Serial.println(F("[3. CLIMATE & BAROMETRIC ALTIMETRY]"));
  if (d.dhtValid) {
    Serial.print(F("   DHT11 Temperature      : "));
    Serial.print(d.temperature, 1);
    Serial.println(F(" C"));

    Serial.print(F("   DHT11 Humidity         : "));
    Serial.print(d.humidity, 1);
    Serial.println(F(" % RH"));
  } else {
    Serial.println(F("   DHT11 Climate          : SENSOR ERROR / DISCONNECTED"));
  }

  if (d.bmpValid) {
    Serial.print(F("   BMP280 Temperature     : "));
    Serial.print(d.bmpTemperature, 2);
    Serial.println(F(" C"));

    Serial.print(F("   Barometric Pressure    : "));
    Serial.print(d.bmpPressure, 2);
    Serial.println(F(" hPa"));

    Serial.print(F("   Barometric Altitude    : "));
    if (d.bmpAltitude >= 0.0f) Serial.print(F("+"));
    Serial.print(d.bmpAltitude, 2);
    Serial.println(F(" meters MSL"));
  } else {
    Serial.println(F("   BMP280 Barometer       : SENSOR ERROR / NOT DETECTED (Check I2C A4/A5)"));
  }

  // 4. GLOBAL POSITIONING (u-blox NEO-6M)
  Serial.println();
  Serial.println(F("[4. SATELLITE NAVIGATION (u-blox NEO-6M GPS)]"));
  if (d.gpsFix) {
    Serial.print(F("   Fix Status             : 3D FIX ("));
    Serial.print(d.satellites);
    Serial.println(F(" Satellites Tracked)"));

    Serial.print(F("   Latitude               : "));
    Serial.println(d.latitude, 6);

    Serial.print(F("   Longitude              : "));
    Serial.println(d.longitude, 6);

    Serial.print(F("   GPS Altitude           : "));
    Serial.print(d.gpsAltitude, 1);
    Serial.println(F(" m"));

    Serial.print(F("   Precision (HDOP)       : "));
    Serial.println(d.hdop, 1);

    Serial.print(F("   Ground Speed           : "));
    Serial.print(d.gpsSpeedKmH, 1);
    Serial.println(F(" km/h"));
  } else {
    Serial.print(F("   Fix Status             : NO FIX (Searching sky... "));
    Serial.print(d.satellites);
    Serial.println(F(" satellites in view)"));
    Serial.println(F("   Coordinates            : WAITING FOR CLEAR SKY VIEW"));
  }

  Serial.println(F("======================================================================"));
}

#endif // !ENABLE_LORA_TRANSMISSION

// ============================================================================
// SYSTEM SETUP
// ============================================================================

void setup() {
  // Start Hardware Serial at 115200 baud
  // In LoRa mode: this UART talks to RYLR998
  // In Debug mode: this UART talks to USB Serial Monitor
  Serial.begin(SERIAL_BAUD_RATE);
  delay(500);

#if !ENABLE_LORA_TRANSMISSION
  // Only print boot messages when Serial Monitor is available (Debug mode)
  Serial.println();
  Serial.println(F("Booting CyberRover X4.3 Layer 2 Node..."));
  Serial.println(F("MODE: Serial Monitor Debug (LoRa OFF)"));
#endif

  // 1. Initialize RYLR998 LoRa Driver (sends AT config commands when enabled)
  loraLink.begin();

  // 2. Initialize Environmental Sensor Array, Analog Pins, I2C, and GPS
  sensorDeck.begin();

  // 3. Initialize Operator Instrument Binnacle (1.3" I2C OLED Display)
  instrumentBinnacle.begin();

  // Clear telemetry structure and take initial readings
  memset(&liveTelemetry, 0, sizeof(Layer2Telemetry));
  sensorDeck.sampleAll(liveTelemetry);

#if !ENABLE_LORA_TRANSMISSION
  Serial.println(F("Layer 2 initialization complete. Starting console output..."));
#endif
}

// ============================================================================
// MAIN LOOP (NON-BLOCKING COOPERATIVE SCHEDULER)
// ============================================================================

void loop() {
  // --------------------------------------------------------------------------
  // 1. HIGH-PRIORITY: Stream GPS NMEA characters from SoftwareSerial (Pin D2)
  //    Must execute on every loop iteration to prevent 64-byte UART buffer drops!
  // --------------------------------------------------------------------------
  sensorDeck.updateGPSStream();

  // --------------------------------------------------------------------------
  // 2. HIGH-PRIORITY: Drain/parse incoming LoRa serial bytes (+RCV & RSSI)
  // --------------------------------------------------------------------------
  loraLink.updateReceiver(liveTelemetry);

  unsigned long currentMillis = millis();

  // --------------------------------------------------------------------------
  // 3. TASK: Sample Environmental Sensor Array (Every 500 ms / 2 Hz)
  // --------------------------------------------------------------------------
  if (currentMillis - lastSensorSample >= SENSOR_READ_INTERVAL_MS) {
    lastSensorSample = currentMillis;
    sensorDeck.sampleAll(liveTelemetry);
  }

  // --------------------------------------------------------------------------
  // 4. TASK: Refresh Operator OLED Instrument HUD (Every 250 ms / 4 Hz)
  //    Display rotates every 10 seconds (OLED_PAGE_INTERVAL_MS)
  //    ALWAYS ACTIVE in both LoRa and Debug modes!
  // --------------------------------------------------------------------------
  if (currentMillis - lastOledRefresh >= OLED_REDRAW_INTERVAL_MS) {
    lastOledRefresh = currentMillis;
    instrumentBinnacle.update(liveTelemetry);
  }

  // --------------------------------------------------------------------------
  // 5. MODE-DEPENDENT TASK:
  //    LoRa ON  -> Transmit CSV telemetry via RYLR998 (every 2 sec)
  //    LoRa OFF -> Print Serial Monitor dashboard (every 2 sec)
  // --------------------------------------------------------------------------
#if ENABLE_LORA_TRANSMISSION
  // LoRa transmission (interval controlled inside LoRaTransceiver.h)
  loraLink.transmit(liveTelemetry);
#else
  // Serial Monitor dashboard (every 2 seconds)
  if (currentMillis - lastSerialPrint >= SERIAL_CONSOLE_INTERVAL_MS) {
    lastSerialPrint = currentMillis;
    printSerialConsole(liveTelemetry);
  }
#endif
}
