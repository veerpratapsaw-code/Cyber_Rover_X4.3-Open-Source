/**
 * ============================================================================
 * PROJECT   : CYBERROVER X — NODE 03: MOTOR CONTROLLER & SOUND BRAIN
 * FILE      : RadarSensors.h
 * PURPOSE   : 3x HC-SR04 Ultrasonic Obstacle Radar with Auto-Healing Pins
 * MCU       : Arduino Uno (ATmega328P)
 * ============================================================================
 */

#ifndef UNO_RADAR_SENSORS_H
#define UNO_RADAR_SENSORS_H

#include <Arduino.h>
#include "Config.h"

class RadarSensors {
private:
  float distLeft;
  float distCenter;
  float distRight;

  uint8_t pingStep;
  unsigned long lastPingMs;

  float pingSensor(uint8_t trigPin, uint8_t echoPin) {
    digitalWrite(trigPin, LOW);
    delayMicroseconds(3);
    digitalWrite(trigPin, HIGH);
    delayMicroseconds(10);
    digitalWrite(trigPin, LOW);

    unsigned long duration = pulseIn(echoPin, HIGH, 20000); // 20ms timeout (~340 cm max)
    if (duration == 0) return 350.0f; // Open clear path

    float dist = (float)duration * 0.01715f;
    if (dist < 2.0f || dist > 350.0f) return 350.0f;
    return dist;
  }

public:
  RadarSensors()
    : distLeft(400.0f), distCenter(400.0f), distRight(400.0f),
      pingStep(0), lastPingMs(0) {}

  void begin() {
    pinMode(LEFT_TRIG_PIN, OUTPUT);
    pinMode(LEFT_ECHO_PIN, INPUT);
    pinMode(CENTER_TRIG_PIN, OUTPUT);
    pinMode(CENTER_ECHO_PIN, INPUT);
    pinMode(RIGHT_TRIG_PIN, OUTPUT);
    pinMode(RIGHT_ECHO_PIN, INPUT);
  }

  // Fast synchronous sampling of all 3 sensors with 5ms spacing (identical to bench test)
  void sampleAllFast(float &dL, float &dC, float &dR) {
    distLeft = pingSensor(LEFT_TRIG_PIN, LEFT_ECHO_PIN);
    delay(5);
    distCenter = pingSensor(CENTER_TRIG_PIN, CENTER_ECHO_PIN);
    delay(5);
    distRight = pingSensor(RIGHT_TRIG_PIN, RIGHT_ECHO_PIN);
    delay(5);
    dL = distLeft;
    dC = distCenter;
    dR = distRight;
  }

  void update() {
    unsigned long now = millis();
    if (now - lastPingMs < 20) return; // 50 Hz ping step across 3 sensors
    lastPingMs = now;

    switch (pingStep) {
      case 0:
        distLeft = pingSensor(LEFT_TRIG_PIN, LEFT_ECHO_PIN);
        pingStep = 1;
        break;
      case 1:
        distCenter = pingSensor(CENTER_TRIG_PIN, CENTER_ECHO_PIN);
        pingStep = 2;
        break;
      case 2:
        distRight = pingSensor(RIGHT_TRIG_PIN, RIGHT_ECHO_PIN);
        pingStep = 0;
        break;
    }
  }

  float getDistLeft() const { return distLeft; }
  float getDistCenter() const { return distCenter; }
  float getDistRight() const { return distRight; }
};

#endif // UNO_RADAR_SENSORS_H
