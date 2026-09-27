/**
 * ============================================================================
 * PROJECT   : CYBERROVER X — NODE 02: ROVER MASTER (ESP32-S3)
 * FILE      : StatusLED.h
 * PURPOSE   : WS2812 RGB LED Status Controller
 * MCU       : ESP32-S3
 * ============================================================================
 */

#ifndef S3_STATUS_LED_H
#define S3_STATUS_LED_H

#include <Arduino.h>
#include <Adafruit_NeoPixel.h>
#include "Config.h"

class StatusLED {
private:
  Adafruit_NeoPixel pixel;
  unsigned long     lastUpdateMs;

public:
  StatusLED()
    : pixel(NUMPIXELS, RGB_PIN, NEO_GRB + NEO_KHZ800), lastUpdateMs(0) {}

  void begin() {
    pixel.begin();
    pixel.setBrightness(45);
    setColor(0, 0, 255); // Solid Blue = Booting / Standby
  }

  void setColor(uint8_t r, uint8_t g, uint8_t b) {
    pixel.setPixelColor(0, pixel.Color(r, g, b));
    pixel.show();
  }

  void update(uint32_t lastPacketMs) {
    unsigned long now = millis();
    if (now - lastUpdateMs < 50) return; // 20 Hz refresh
    lastUpdateMs = now;

    if (lastPacketMs > 0 && (now - lastPacketMs < 600)) {
      setColor(0, 255, 0); // Solid Green = Active Healthy Link
    } else if (lastPacketMs > 0) {
      setColor(255, 0, 0); // Solid Red = Radio Lost / Failsafe
    } else {
      setColor(0, 0, 255); // Solid Blue = Standby (Waiting for Remote)
    }
  }
};

#endif // S3_STATUS_LED_H
