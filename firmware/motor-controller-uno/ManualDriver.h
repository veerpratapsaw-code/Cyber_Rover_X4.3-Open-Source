/**
 * ============================================================================
 * PROJECT   : CYBERROVER X — NODE 03: MOTOR CONTROLLER & SOUND BRAIN
 * FILE      : ManualDriver.h
 * PURPOSE   : 100% Direct Manual Remote Joystick Arcade & Skid-Steering Mixer
 * MCU       : Arduino Uno (ATmega328P)
 * ============================================================================
 */

#ifndef UNO_MANUAL_DRIVER_H
#define UNO_MANUAL_DRIVER_H

#include <Arduino.h>
#include "Config.h"
#include "MotorDriver.h"

class ManualDriver {
public:
  ManualDriver() {}

  void update(MotorDriver &motors, int8_t throttle, int8_t steering) {
    // 1. Both sticks centered in neutral deadzone -> Hold Stop
    if (abs(throttle) < JOY_DEADZONE && abs(steering) < JOY_DEADZONE) {
      motors.setTargets(0, 0);
      return;
    }

    // 2. Pure Tank Pivot In-Place (Zero Throttle, Only Steering)
    if (abs(throttle) < JOY_DEADZONE && abs(steering) >= JOY_DEADZONE) {
      int turnPwm = map(abs(steering), JOY_DEADZONE, 100, MIN_TURN_PWM, MAX_PWM);
      if (steering > 0) { // Turn Right: Left forward, Right backward
        motors.setTargets(turnPwm, -turnPwm);
      } else {            // Turn Left: Left backward, Right forward
        motors.setTargets(-turnPwm, turnPwm);
      }
      return;
    }

    // 3. Smooth Forward / Reverse Arcade Skid-Steering Mixing
    int basePwm = 0;
    if (throttle > 0) {
      basePwm = map(throttle, JOY_DEADZONE, 100, MIN_DRIVE_PWM, MAX_PWM);
    } else {
      basePwm = -map(-throttle, JOY_DEADZONE, 100, MIN_DRIVE_PWM, MAX_PWM);
    }

    float turnRatio = (float)steering / 100.0f;
    int leftPwm = basePwm;
    int rightPwm = basePwm;

    if (steering > 0) { // Steer Right: Reduce right motor speed
      rightPwm = (int)((float)basePwm * (1.0f - (turnRatio * 1.6f)));
    } else if (steering < 0) { // Steer Left: Reduce left motor speed
      leftPwm = (int)((float)basePwm * (1.0f - (-turnRatio * 1.6f)));
    }

    motors.setTargets(constrain(leftPwm, -MAX_PWM, MAX_PWM),
                      constrain(rightPwm, -MAX_PWM, MAX_PWM));
  }
};

#endif // UNO_MANUAL_DRIVER_H
