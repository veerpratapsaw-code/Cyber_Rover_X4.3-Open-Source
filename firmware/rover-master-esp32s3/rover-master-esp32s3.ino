/*
============================================================================
PROJECT   : CYBERROVER X — NODE 02: ROVER MASTER (ESP32-S3)
MCU       : ESP32-S3 (N16R8 / DevModule)
FRAMEWORK : Arduino / C++17
BAUD      : USB Serial = 115200, UART1 (Uno Link) = 38400

SYSTEM MODULES:
----------------------------------------------------------------------------
1. Config.h        : Hardware pin mappings & serial baud parameters
2. StatusLED.h     : WS2812 RGB LED indicator (Solid Green=Link OK, Red=Failsafe)
3. UnoGateway.h    : Hardware UART1 Gateway to Arduino Uno (@ 38400 baud)
4. CommsReceiver.h : 100 Hz Bidirectional ESP-NOW Radio Engine & CRC-8 Validator
============================================================================
*/

#include <Arduino.h>
#include "Config.h"
#include "StatusLED.h"
#include "UnoGateway.h"
#include "CommsReceiver.h"

// Define static instance pointer for ESP-NOW C-callback
CommsReceiver* CommsReceiver::instance = nullptr;

//==================================================
// GLOBAL SUBSYSTEM INSTANCES
//==================================================

StatusLED     statusLed;
UnoGateway    unoGateway;
CommsReceiver comms;

unsigned long g_lastTelemetrySendMs = 0;

//==================================================
// SETUP
//==================================================

void setup() {
  Serial.begin(USB_SERIAL_BAUD);
  delay(400);

  // 1. Initialize Hardware Subsystems
  statusLed.begin();
  unoGateway.begin();
  comms.begin(unoGateway);

  Serial.println();
  Serial.println(F("===================================================="));
  Serial.println(F(" CYBERROVER X — ESP32-S3 REAL-TIME DRIVE MASTER    "));
  Serial.println(F(" Status: 100% Offline | ESP-NOW 100Hz | UART Ready  "));
  Serial.println(F("===================================================="));
}

//==================================================
// MAIN REAL-TIME LOOP
//==================================================

void loop() {
  uint32_t now = millis();

  // 1. Smooth Status RGB LED Manager (20 Hz)
  statusLed.update(comms.getLastPacketMs());

  // 2. Send Telemetry Reply to Remote Controller at 10 Hz (every 100 ms)
  if (now - g_lastTelemetrySendMs >= 100) {
    g_lastTelemetrySendMs = now;
    comms.sendTelemetry();
  }
}