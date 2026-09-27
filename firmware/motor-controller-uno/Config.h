/**
 * ============================================================================
 * PROJECT   : CYBERROVER X — NODE 03: MOTOR CONTROLLER & SOUND BRAIN
 * FILE      : Config.h
 * PURPOSE   : Hardware pinout mapping, PWM speed parameters, and distance thresholds
 * MCU       : Arduino Uno (ATmega328P / 5V / 16MHz)
 * ============================================================================
 */

#ifndef UNO_CONFIG_H
#define UNO_CONFIG_H

#include <Arduino.h>
#include "CyberProtocol.h"

// Compile-Time Architecture Guard
#if defined(ESP32) || defined(ESP8266)
  #error "Wrong board selected! Please compile for 'Arduino Uno' under Arduino AVR Boards."
#endif

// ============================================================================
// HARDWARE PIN DEFINITIONS
// ============================================================================

// SoftwareSerial Link from ESP32-S3 (One-Way Control: S3 -> Uno)
#define ESP_RX_PIN        2     // Uno RX (Pin D2) <- From ESP32-S3 TX (GPIO 17)
#define ESP_TX_PIN        -1    // Unused (One-way RX only: no Uno to S3 transmission)

// BTS7960 Dual H-Bridge Motor Driver
#define LEFT_RPWM         5     // Left Motor Forward/Reverse PWM
#define LEFT_LPWM         6
#define RIGHT_RPWM        9     // Right Motor Forward/Reverse PWM
#define RIGHT_LPWM        10

// Tactical Buzzer / Siren
#define BUZZER_PIN        8     // Active or Passive Piezo Buzzer Pin

// Physical 2-Wire Auto/Manual Toggle Switch (Pin 11 <-> GND)
#define MODE_SWITCH_PIN   11    // LOW = AUTO Mode, HIGH = MANUAL Mode

// HC-SR04 Ultrasonic Obstacle Radar Sensors
#define LEFT_TRIG_PIN     A5
#define LEFT_ECHO_PIN     A4

#define CENTER_TRIG_PIN   A3
#define CENTER_ECHO_PIN   A2

#define RIGHT_TRIG_PIN    A1
#define RIGHT_ECHO_PIN    A0

// ============================================================================
// TUNED SPEED & PWM PARAMETERS
// ============================================================================

const int MAX_PWM              = 255;
const int MIN_DRIVE_PWM        = 100;  // Smooth forward/reverse crawl threshold
const int MIN_TURN_PWM         = 160;  // High torque starting PWM for tank turns
const int JOY_DEADZONE         = 6;    // Deadzone on -100..+100 scale

// Autonomous Navigation Speeds
const int AUTO_CRUISE_PWM      = 160;  // Controlled forward cruise (~60% power)
const int AUTO_TURN_PWM        = 200;  // High-torque turning PWM (prevents tire stall)
const int AUTO_REVERSE_PWM     = 175;  // Reverse escape power
const int CORRIDOR_HIGH_PWM    = 170;  // Gentle steering outer wheel
const int CORRIDOR_LOW_PWM     = 120;  // Gentle steering inner wheel

// Distance Thresholds (cm)
const float DIST_CRITICAL_STOP = 20.0f; // Critical danger -> Quick reverse
const float DIST_OBSTACLE_WARN = 45.0f; // Early front detection -> Tank turn
const float DIST_SIDE_WALL     = 25.0f; // Side clearance warning
const float DIST_MAX_SENSOR    = 400.0f;

const unsigned long MAX_TIMEOUT_US     = 25000; // 25ms timeout (~400 cm range)
const unsigned long UART_TIMEOUT_MS     = 400;   // 400ms failsafe timeout for radio link

// Motor Ramping & Direction Dead-Time
const int ACCEL_STEP           = 12;
const int DECEL_STEP           = 18;
const unsigned long DIRECTION_PAUSE_MS = 30;

#endif // UNO_CONFIG_H
