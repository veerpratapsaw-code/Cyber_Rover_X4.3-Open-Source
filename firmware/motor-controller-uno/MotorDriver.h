/**
 * ============================================================================
 * PROJECT   : CYBERROVER X — NODE 03: MOTOR CONTROLLER & SOUND BRAIN
 * FILE      : MotorDriver.h
 * PURPOSE   : Low-level BTS7960 Dual H-Bridge Motor Control with Ramping
 * MCU       : Arduino Uno (ATmega328P)
 * ============================================================================
 */

#ifndef UNO_MOTOR_DRIVER_H
#define UNO_MOTOR_DRIVER_H

#include <Arduino.h>
#include "Config.h"

class MotorDriver {
private:
  int targetLeft;
  int targetRight;
  int currentLeft;
  int currentRight;

  bool leftPauseActive;
  bool rightPauseActive;
  unsigned long leftPauseStart;
  unsigned long rightPauseStart;

  int rampValue(int current, int target) {
    if (current < target) {
      current += ACCEL_STEP;
      if (current > target) current = target;
    } else if (current > target) {
      current -= DECEL_STEP;
      if (current < target) current = target;
    }
    return current;
  }

  void writeRawLeft(int pwm) {
    pwm = constrain(pwm, -MAX_PWM, MAX_PWM);
    if (pwm > 0) {
      analogWrite(LEFT_RPWM, 0);
      analogWrite(LEFT_LPWM, pwm);
    } else if (pwm < 0) {
      analogWrite(LEFT_RPWM, -pwm);
      analogWrite(LEFT_LPWM, 0);
    } else {
      analogWrite(LEFT_RPWM, 0);
      analogWrite(LEFT_LPWM, 0);
    }
  }

  void writeRawRight(int pwm) {
    pwm = constrain(pwm, -MAX_PWM, MAX_PWM);
    if (pwm > 0) {
      analogWrite(RIGHT_RPWM, 0);
      analogWrite(RIGHT_LPWM, pwm);
    } else if (pwm < 0) {
      analogWrite(RIGHT_RPWM, -pwm);
      analogWrite(RIGHT_LPWM, 0);
    } else {
      analogWrite(RIGHT_RPWM, 0);
      analogWrite(RIGHT_LPWM, 0);
    }
  }

public:
  MotorDriver()
    : targetLeft(0), targetRight(0), currentLeft(0), currentRight(0),
      leftPauseActive(false), rightPauseActive(false),
      leftPauseStart(0), rightPauseStart(0) {}

  void begin() {
    pinMode(LEFT_RPWM, OUTPUT);
    pinMode(LEFT_LPWM, OUTPUT);
    pinMode(RIGHT_RPWM, OUTPUT);
    pinMode(RIGHT_LPWM, OUTPUT);
    stopImmediate();
  }

  void setTargets(int leftPwm, int rightPwm) {
    targetLeft  = constrain(leftPwm, -MAX_PWM, MAX_PWM);
    targetRight = constrain(rightPwm, -MAX_PWM, MAX_PWM);
  }

  // Direct instantaneous PWM write for fast autonomous reactions (bypasses slow ramping)
  void setDirect(int leftPwm, int rightPwm) {
    targetLeft  = constrain(leftPwm, -MAX_PWM, MAX_PWM);
    targetRight = constrain(rightPwm, -MAX_PWM, MAX_PWM);
    currentLeft  = targetLeft;
    currentRight = targetRight;
    writeRawLeft(currentLeft);
    writeRawRight(currentRight);
  }

  // Active reverse brake pulse to instantly kill forward vehicle momentum
  void activeBrakePulse() {
    writeRawLeft(-180);
    writeRawRight(-180);
    delay(40);
    stopImmediate();
    delay(20);
  }

  void stopImmediate() {
    targetLeft   = 0;
    targetRight  = 0;
    currentLeft  = 0;
    currentRight = 0;
    writeRawLeft(0);
    writeRawRight(0);
  }

  void update() {
    unsigned long now = millis();

    // Left Motor Direction Pause & Ramp
    if (currentLeft == 0 && targetLeft != 0 && leftPauseActive) {
      if (now - leftPauseStart >= DIRECTION_PAUSE_MS) {
        leftPauseActive = false;
      } else {
        writeRawLeft(0);
        return;
      }
    }

    int oldLeft = currentLeft;
    currentLeft = rampValue(currentLeft, targetLeft);
    if (oldLeft != 0 && currentLeft == 0 && targetLeft != 0) {
      leftPauseActive = true;
      leftPauseStart = now;
    }
    writeRawLeft(currentLeft);

    // Right Motor Direction Pause & Ramp
    if (currentRight == 0 && targetRight != 0 && rightPauseActive) {
      if (now - rightPauseStart >= DIRECTION_PAUSE_MS) {
        rightPauseActive = false;
      } else {
        writeRawRight(0);
        return;
      }
    }

    int oldRight = currentRight;
    currentRight = rampValue(currentRight, targetRight);
    if (oldRight != 0 && currentRight == 0 && targetRight != 0) {
      rightPauseActive = true;
      rightPauseStart = now;
    }
    writeRawRight(currentRight);
  }

  int getCurrentLeft() const { return currentLeft; }
  int getCurrentRight() const { return currentRight; }
  int getTargetLeft() const { return targetLeft; }
  int getTargetRight() const { return targetRight; }
};

#endif // UNO_MOTOR_DRIVER_H
