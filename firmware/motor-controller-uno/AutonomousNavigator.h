/**
 * ============================================================================
 * PROJECT   : CYBERROVER X — NODE 03: MOTOR CONTROLLER & SOUND BRAIN
 * FILE      : AutonomousNavigator.h
 * PURPOSE   : Crash-Proof Autonomous Obstacle Avoidance Engine (V3 Balanced)
 * MCU       : Arduino Uno (ATmega328P)
 * 
 * SPEED & REACTION SPECIFICATIONS:
 *   1. Obstacle Ahead (< 35 cm) ➔ Active Electric Brake Pulse + 100% Tank Pivot (340ms)
 *   2. Approaching Obstacle (35 to 45 cm) ➔ Controlled 60% approach
 *   3. Side-Wall Clip Guard (< 18 cm) ➔ Gentle bias (204 / 165) without stalling
 *   4. Open Path (>= 45 cm) ➔ 100% EQUAL 80% Sprint on BOTH Motors (204 / 204)
 *   5. Corner Trap (All 3 < 25 cm) ➔ Active Brake + 80% Reverse (450ms)
 * ============================================================================
 */

#ifndef UNO_AUTONOMOUS_NAVIGATOR_H
#define UNO_AUTONOMOUS_NAVIGATOR_H

#include <Arduino.h>
#include "Config.h"
#include "MotorDriver.h"
#include "RadarSensors.h"

// Speed constants according to user specifications
const int AUTO_SPEED_SPRINT_80   = 204; // 80% speed (255 * 0.80) on wide open path
const int AUTO_SPEED_PIVOT_100   = 255; // 100% speed for high-torque tank pivot
const int AUTO_SPEED_APPROACH    = 150; // ~60% controlled approach speed
const int AUTO_SPEED_GENTLE_BIAS = 165; // ~65% turning speed (maintains strong torque, never stalls)

// Distance Thresholds (cm)
const float AUTO_PIVOT_DANGER_CM   = 35.0f; // Critical distance: Stop & Pivot 100%
const float AUTO_SLOW_APPROACH_CM  = 45.0f; // Warning zone: Controlled approach
const float AUTO_SIDE_WALL_WARN_CM = 18.0f; // Side clip threshold: Nudge if closer than 18cm
const float AUTO_CORNER_TRAP_CM    = 25.0f; // All 3 sensors blocked: Reverse escape

class AutonomousNavigator {
private:
  unsigned long actionStartMs;
  unsigned long minHoldMs;
  const char*   actionName;

public:
  AutonomousNavigator()
    : actionStartMs(0), minHoldMs(0), actionName("STOP") {}

  void begin() {
    reset();
  }

  void reset() {
    actionStartMs = millis();
    minHoldMs = 0;
    actionName = "RESET";
  }

  /**
   * Main Autonomous Execution Loop (called in loop() when mode == MODE_AUTO)
   * Directly drives motors via setDirect() and activeBrakePulse() to eliminate lag/inertia!
   */
  void update(MotorDriver &motors, RadarSensors &radar) {
    unsigned long now = millis();

    // 1. Maintain ongoing high-priority actions (like pivot or reverse) for minimum duration
    if (minHoldMs > 0 && (now - actionStartMs < minHoldMs)) {
      return; // Keep executing current action until time completes
    }
    minHoldMs = 0;

    // 2. Read all 3 sensors synchronously with fast 5ms spacing
    float distL = 400.0f;
    float distC = 400.0f;
    float distR = 400.0f;
    radar.sampleAllFast(distL, distC, distR);

    // ========================================================================
    // PRIORITY 1: CORNER TRAP (All 3 sides blocked < 25 cm!)
    // ========================================================================
    if (distC < AUTO_CORNER_TRAP_CM && distL < AUTO_CORNER_TRAP_CM && distR < AUTO_CORNER_TRAP_CM) {
      actionName = "TRAP: REVERSE_80";
      motors.activeBrakePulse(); // Kill forward slide instantly
      actionStartMs = now;
      minHoldMs = 450;
      motors.setDirect(-AUTO_SPEED_SPRINT_80, -AUTO_SPEED_SPRINT_80); // Reverse 80%
      return;
    }

    // ========================================================================
    // PRIORITY 2: CRITICAL OBSTACLE IN FRONT (< 35 cm) ➔ ACTIVE BRAKE + 100% PIVOT
    // ========================================================================
    if (distC < AUTO_PIVOT_DANGER_CM) {
      motors.activeBrakePulse(); // Kill forward slide instantly!
      actionStartMs = now;
      minHoldMs = 340; // Clean 340ms pivot hold

      if (distL >= distR) {
        actionName = "PIVOT_LEFT_100";
        motors.setDirect(-AUTO_SPEED_PIVOT_100, AUTO_SPEED_PIVOT_100);
      } else {
        actionName = "PIVOT_RIGHT_100";
        motors.setDirect(AUTO_SPEED_PIVOT_100, -AUTO_SPEED_PIVOT_100);
      }
      return;
    }

    // ========================================================================
    // PRIORITY 3: FRONT APPROACH ZONE (35 cm to 45 cm ahead)
    // Front obstacle detected at medium distance: smooth controlled approach
    // ========================================================================
    if (distC < AUTO_SLOW_APPROACH_CM) {
      if (distL > distR + 15.0f) {
        actionName = "APPROACH: STEER_LEFT";
        motors.setDirect(AUTO_SPEED_APPROACH - 25, AUTO_SPEED_APPROACH + 25);
      } else if (distR > distL + 15.0f) {
        actionName = "APPROACH: STEER_RIGHT";
        motors.setDirect(AUTO_SPEED_APPROACH + 25, AUTO_SPEED_APPROACH - 25);
      } else {
        actionName = "APPROACH: STRAIGHT_60";
        motors.setDirect(AUTO_SPEED_APPROACH, AUTO_SPEED_APPROACH);
      }
      return;
    }

    // ========================================================================
    // PRIORITY 4: SIDE-WALL CLIP GUARD (< 18 cm on Left or Right)
    // Only triggers if wall is dangerously close to wheels/bumper!
    // Uses gentle bias (204 / 165) so inner wheel NEVER stalls!
    // ========================================================================
    if (distL < AUTO_SIDE_WALL_WARN_CM) {
      actionName = "GUARD: NUDGE_RIGHT (204/165)";
      actionStartMs = now;
      motors.setDirect(AUTO_SPEED_SPRINT_80, AUTO_SPEED_GENTLE_BIAS);
      return;
    }
    if (distR < AUTO_SIDE_WALL_WARN_CM) {
      actionName = "GUARD: NUDGE_LEFT (165/204)";
      actionStartMs = now;
      motors.setDirect(AUTO_SPEED_GENTLE_BIAS, AUTO_SPEED_SPRINT_80);
      return;
    }

    // ========================================================================
    // PRIORITY 5: WIDE OPEN CRUISE (Front >= 45 cm, sides clear)
    // BOTH MOTORS 100% EQUAL AT FULL 80% SPEED (204 / 204)!
    // ========================================================================
    actionName = "SPRINT_FORWARD_80 (EQUAL)";
    motors.setDirect(AUTO_SPEED_SPRINT_80, AUTO_SPEED_SPRINT_80);
  }

  const char* getActionName() const { return actionName; }
};

#endif // UNO_AUTONOMOUS_NAVIGATOR_H
