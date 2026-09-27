/*
============================================================================
PROJECT   : CYBERROVER X — NODE 03: MOTOR CONTROLLER & SOUND BRAIN
MCU       : Arduino Uno (ATmega328P / 5V / 16MHz)
FRAMEWORK : Arduino AVR
BAUD      : USB Serial = 115200, SoftwareSerial (S3 Link) = 38400

SYSTEM MODULES:
----------------------------------------------------------------------------
1. Config.h              : Hardware pinout mapping and speed/distance thresholds
2. SoundEngine.h         : Non-blocking tactical sirens, horns & sound effects
3. MotorDriver.h         : BTS7960 Dual H-Bridge motor control with smooth ramping
4. RadarSensors.h        : 3x HC-SR04 ultrasonic obstacle sensors with auto-healing
5. ManualDriver.h        : 100% Direct manual remote joystick skid-steering mixer
6. AutonomousNavigator.h : New autonomous self-driving engine (written from scratch)
7. CommsGateway.h        : Serial frame parser (0xAA 0x55 + CyberPacket) & telemetry
============================================================================
*/

#include <Arduino.h>
#include "Config.h"
#include "SoundEngine.h"
#include "MotorDriver.h"
#include "RadarSensors.h"
#include "ManualDriver.h"
#include "AutonomousNavigator.h"
#include "CommsGateway.h"

//==================================================
// GLOBAL SUBSYSTEM INSTANCES
//==================================================

SoundEngine          sound;
MotorDriver          motors;
RadarSensors         radar;
ManualDriver         manualDrive;
AutonomousNavigator  autoNav;
CommsGateway         comms;

unsigned long g_lastMotorUpdateMs = 0;
unsigned long g_lastDebugPrintMs  = 0;
uint8_t       g_previousMode      = MODE_MANUAL;

//==================================================
// SERIAL MONITOR DEBUG TELEMETRY OUTPUT (4 Hz)
//==================================================

void printSerialDebug() {
  Serial.print(F("[MODE: "));
  uint8_t mode = (digitalRead(MODE_SWITCH_PIN) == LOW) ? MODE_AUTO : comms.getMode();

  switch (mode) {
    case MODE_MANUAL: Serial.print(F("MANUAL")); break;
    case MODE_AUTO:   
      Serial.print(F("AUTO -> ")); 
      Serial.print(autoNav.getActionName()); 
      break;
    case MODE_PARK:   Serial.print(F("PARK")); break;
    default:          Serial.print(F("UNKNOWN")); break;
  }

  Serial.print(F("] | US RADAR [L: "));
  Serial.print(radar.getDistLeft(), 1);
  Serial.print(F(" cm | C: "));
  Serial.print(radar.getDistCenter(), 1);
  Serial.print(F(" cm | R: "));
  Serial.print(radar.getDistRight(), 1);
  Serial.print(F(" cm] | MOTORS [L: "));
  Serial.print(motors.getCurrentLeft());
  Serial.print(F(" | R: "));
  Serial.print(motors.getCurrentRight());
  Serial.println(F("]"));
}

//==================================================
// SETUP
//==================================================

void setup() {
  // 1. Configure Hardware Mode Switch (Pin 11 <-> GND)
  pinMode(MODE_SWITCH_PIN, INPUT_PULLUP);

  // 2. Initialize Hardware Subsystems
  motors.begin();

  // Force Timer 1 (Pins 9/10 = Right Motors) to Fast PWM mode (~976 Hz)
  // to match Timer 0 (Pins 5/6 = Left Motors). Default Phase Correct PWM
  // runs at ~490 Hz which behaves differently under interrupt load.
  TCCR1A = (TCCR1A & 0xFC) | 0x01;  // WGM10=1, WGM11=0
  TCCR1B = (TCCR1B & 0xE7) | 0x08;  // WGM12=1, WGM13=0 → Fast PWM 8-bit

  sound.begin();
  radar.begin();
  comms.begin();
  autoNav.begin();

  // 3. Start PC USB Diagnostic Serial
  Serial.begin(115200);

  // 4. Play Startup Confirmation Chirp
  sound.triggerSound(FX_SCIFI_CHIRP);

  Serial.println();
  Serial.println(F("=================================================="));
  Serial.println(F(" CYBERROVER X — UNO MOTOR & SOUND CONTROLLER      "));
  Serial.println(F(" Status: BTS7960 Ready | Radar Active | 38400 S3  "));
  Serial.println(F(" Mode Switch: Pin 11 <-> GND (LOW=AUTO, HIGH=MAN) "));
  Serial.println(F("=================================================="));
}

//==================================================
// MAIN REAL-TIME LOOP
//==================================================

void loop() {
  unsigned long now = millis();

  // 1. Process Non-Blocking Tactical Sound Engine
  sound.update();

  // 2. Read and Parse Incoming Frames from ESP32-S3
  //    (SoftwareSerial buffer is harmlessly empty when paused in AUTO mode)
  bool newPacket = comms.update(sound);
  
  // 3. Determine Active Mode (Physical Switch on Pin 11 overrides remote)
  bool physicalAutoSwitch = (digitalRead(MODE_SWITCH_PIN) == LOW);
  uint8_t effectiveMode = physicalAutoSwitch ? MODE_AUTO : comms.getMode();

  // Mode transition: pause/resume SoftwareSerial to protect Timer 1 PWM in AUTO
  if (effectiveMode != g_previousMode) {
    g_previousMode = effectiveMode;
    if (effectiveMode == MODE_AUTO) {
      comms.pauseListening();  // Stop Pin 2 interrupts so Timer 1 PWM (Pins 9/10) runs clean
      autoNav.reset();
      sound.triggerSound(FX_SCIFI_CHIRP);
    } else {
      comms.resumeListening(); // Re-enable SoftwareSerial for remote control packets
    }
  }

  // 4. Update Ultrasonic Radar Sensors (Only needed in MANUAL mode; AUTO handles fast sampling internally)
  if (effectiveMode != MODE_AUTO) {
    radar.update();
  }

  // 5. Safety Failsafe & Mode Dispatcher
  if (effectiveMode == MODE_AUTO) {
    // AUTONOMOUS MODE: Direct, instant control identical to the proven bench test!
    autoNav.update(motors, radar);
  } else if (comms.isTimedOut()) {
    // Radio link lost > 400ms: Emergency safety halt
    motors.stopImmediate();
  } else if (comms.isEmergencyStop()) {
    // Remote emergency brake flag active
    motors.stopImmediate();
  } else {
    // Remote Manual Driving Mode
    const CyberPacket &pkt = comms.getPacket();

    switch (effectiveMode) {
      case MODE_MANUAL:
        manualDrive.update(motors, pkt.leftY, pkt.rightX);
        break;

      case MODE_PARK:
        motors.stopImmediate();
        break;
    }
  }

  // 6. Smooth Acceleration & Deceleration Motor Ramping (ONLY for MANUAL driving!)
  // In AUTO mode, direct instantaneous PWM and active braking are used to prevent collisions.
  if (effectiveMode == MODE_MANUAL && (now - g_lastMotorUpdateMs >= 20)) {
    g_lastMotorUpdateMs = now;
    motors.update();
  }

  // 7. Live Debug Telemetry to PC Serial Monitor (4 Hz)
  if (now - g_lastDebugPrintMs >= 250) {
    g_lastDebugPrintMs = now;
    printSerialDebug();
  }
}