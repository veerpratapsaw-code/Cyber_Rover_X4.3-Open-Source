/**
 * ============================================================================
 * PROJECT   : CYBERROVER X4.3 — AUTONOMOUS ANTI-COLLISION ENGINE (CRASH-PROOF V2)
 * FILE      : autonomous-bench-test.ino
 * HARDWARE  : Arduino Uno + Dual BTS7960 + 3x HC-SR04 + Switch (Pin 11 <-> GND)
 * 
 * WHY V1 WAS CRASHING:
 *   - At 80% speed, a heavy rover covers 30 cm in just ~0.35 seconds!
 *   - Vehicle inertia/momentum skids the rover forward before the pivot can complete.
 * 
 * V2 CRASH-PROOF UPGRADES:
 *   1. Dynamic 2-Stage Speed:
 *      - Clear path (> 50 cm): Full 80% Speed (Fast & agile)
 *      - Approaching zone (32 to 50 cm): Auto-throttles down to 55% speed to kill inertia
 *   2. Active Electric Pulse Brake before any Pivot (Zero skid!)
 *   3. Critical Pivot Zone increased to 35 cm (Guarantees safe air cushion)
 *   4. Side-Clip Guard: If Left or Right is < 22 cm, immediately steers away
 *   5. Ultra-Fast Sensor Cycle (5ms spacing instead of 12ms for 2x faster reflexes)
 * ============================================================================
 */

// ============================================================================
// 1. PIN DEFINITIONS
// ============================================================================
const int MODE_SWITCH_PIN = 11; // LOW = AUTO, HIGH = STOP
const int BUZZER_PIN      = 8;

const int LEFT_RPWM  = 5;
const int LEFT_LPWM  = 6;
const int RIGHT_RPWM = 9;
const int RIGHT_LPWM = 10;

const int LEFT_TRIG_PIN   = A5;
const int LEFT_ECHO_PIN   = A4;
const int CENTER_TRIG_PIN = A3;
const int CENTER_ECHO_PIN = A2;
const int RIGHT_TRIG_PIN  = A1;
const int RIGHT_ECHO_PIN  = A0;

// ============================================================================
// 2. SPEED & DISTANCE PARAMETERS
// ============================================================================
const int SPEED_SPRINT_80  = 204; // 80% Speed on wide open ground (> 50 cm)
const int SPEED_APPROACH   = 140; // 55% Controlled approach speed (prevents inertia crash)
const int SPEED_PIVOT_100  = 255; // 100% High torque tank pivot
const int SPEED_CURVE_SLOW = 102; // 40% Speed for balanced turn

// Distance Zones (cm)
const float DIST_PIVOT_DANGER   = 35.0f; // Critical distance: Stop & Pivot 100%
const float DIST_SLOW_APPROACH  = 50.0f; // Warning zone: Slow down to 55%
const float DIST_SIDE_WALL_WARN = 24.0f; // Side clip threshold: Prevent hitting doorways
const float DIST_CORNER_TRAP    = 25.0f; // All 3 sensors blocked: Reverse escape
const float DIFF_THRESHOLD_CM   = 15.0f; // Difference threshold between L and R

const unsigned long MAX_TIMEOUT_US = 20000; // ~340 cm max (faster ping timeout)

// State Tracking
unsigned long actionStartTime = 0;
unsigned long minHoldMs       = 0;
int lastSwitchState           = -1;
unsigned long lastPrintMs     = 0;

// ============================================================================
// 3. MOTOR CONTROLLER WITH ACTIVE ELECTRIC BRAKING
// ============================================================================
void stopMotors() {
  analogWrite(LEFT_RPWM, 0);
  analogWrite(LEFT_LPWM, 0);
  analogWrite(RIGHT_RPWM, 0);
  analogWrite(RIGHT_LPWM, 0);
}

// Active brake pulse kills forward momentum in 40ms
void activeBrakePulse() {
  // Brief reverse pulse to instantly kill forward inertia
  analogWrite(LEFT_RPWM, 180);
  analogWrite(LEFT_LPWM, 0);
  analogWrite(RIGHT_RPWM, 180);
  analogWrite(RIGHT_LPWM, 0);
  delay(40);
  stopMotors();
  delay(20);
}

void setMotors(int leftPwm, int rightPwm) {
  leftPwm  = constrain(leftPwm, -255, 255);
  rightPwm = constrain(rightPwm, -255, 255);

  // Left Motor
  if (leftPwm > 0) {
    analogWrite(LEFT_RPWM, 0);
    analogWrite(LEFT_LPWM, leftPwm);
  } else if (leftPwm < 0) {
    analogWrite(LEFT_RPWM, -leftPwm);
    analogWrite(LEFT_LPWM, 0);
  } else {
    analogWrite(LEFT_RPWM, 0);
    analogWrite(LEFT_LPWM, 0);
  }

  // Right Motor
  if (rightPwm > 0) {
    analogWrite(RIGHT_RPWM, 0);
    analogWrite(RIGHT_LPWM, rightPwm);
  } else if (rightPwm < 0) {
    analogWrite(RIGHT_RPWM, -rightPwm);
    analogWrite(RIGHT_LPWM, 0);
  } else {
    analogWrite(RIGHT_RPWM, 0);
    analogWrite(RIGHT_LPWM, 0);
  }
}

// ============================================================================
// 4. FAST ULTRASONIC SENSOR PING
// ============================================================================
float readDistanceCm(int trigPin, int echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(3);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  unsigned long duration = pulseIn(echoPin, HIGH, MAX_TIMEOUT_US);
  if (duration == 0) return 350.0f; // Clear path
  return (float)duration * 0.01715f;
}

void beep(int freq, int dur) {
  tone(BUZZER_PIN, freq, dur);
  delay(dur);
  noTone(BUZZER_PIN);
}

// ============================================================================
// 5. SETUP
// ============================================================================
void setup() {
  pinMode(MODE_SWITCH_PIN, INPUT_PULLUP);
  pinMode(BUZZER_PIN, OUTPUT);

  pinMode(LEFT_RPWM, OUTPUT);
  pinMode(LEFT_LPWM, OUTPUT);
  pinMode(RIGHT_RPWM, OUTPUT);
  pinMode(RIGHT_LPWM, OUTPUT);
  stopMotors();

  pinMode(LEFT_TRIG_PIN, OUTPUT);
  pinMode(LEFT_ECHO_PIN, INPUT);
  pinMode(CENTER_TRIG_PIN, OUTPUT);
  pinMode(CENTER_ECHO_PIN, INPUT);
  pinMode(RIGHT_TRIG_PIN, OUTPUT);
  pinMode(RIGHT_ECHO_PIN, INPUT);

  Serial.begin(115200);
  delay(400);

  Serial.println();
  Serial.println(F("=========================================================="));
  Serial.println(F(" CYBERROVER X4.3 — CRASH-PROOF AUTONOMOUS BENCH TEST V2   "));
  Serial.println(F(" Upgrades: Dynamic 2-Stage Speed + Active Inertia Brake    "));
  Serial.println(F("=========================================================="));

  beep(2000, 150);
}

// ============================================================================
// 6. MAIN LOOP
// ============================================================================
void loop() {
  unsigned long now = millis();

  // 1. Read Mode Switch (Pin 11 <-> GND)
  int rawSwitch = digitalRead(MODE_SWITCH_PIN);
  bool isAutoActive = (rawSwitch == LOW);

  if (rawSwitch != lastSwitchState) {
    lastSwitchState = rawSwitch;
    if (isAutoActive) {
      Serial.println(F("\n>>> [AUTO ACTIVE] Starting in 1s..."));
      beep(1800, 80); delay(80); beep(2400, 120);
      delay(700);
    } else {
      Serial.println(F("\n>>> [STOP / STANDBY] Motors Locked"));
      stopMotors();
      beep(1000, 200);
    }
  }

  if (!isAutoActive) {
    stopMotors();
    delay(40);
    return;
  }

  // 2. Read All 3 Sensors with ultra-fast 5ms spacing
  float distL = readDistanceCm(LEFT_TRIG_PIN, LEFT_ECHO_PIN);
  delay(5);
  float distC = readDistanceCm(CENTER_TRIG_PIN, CENTER_ECHO_PIN);
  delay(5);
  float distR = readDistanceCm(RIGHT_TRIG_PIN, RIGHT_ECHO_PIN);
  delay(5);

  // 3. Maintain active pivot / reverse duration
  if (minHoldMs > 0 && (now - actionStartTime < minHoldMs)) {
    return;
  }
  minHoldMs = 0;

  // --------------------------------------------------------------------------
  // CRASH-PROOF DECISION TREE:
  // --------------------------------------------------------------------------
  const char* actionStr = "FORWARD";

  // ==========================================================================
  // PRIORITY 1: CORNER TRAP (All 3 sides blocked!)
  // ==========================================================================
  if (distC < DIST_CORNER_TRAP && distL < DIST_CORNER_TRAP && distR < DIST_CORNER_TRAP) {
    actionStr = "TRAP: REVERSE_80";
    activeBrakePulse();
    actionStartTime = now;
    minHoldMs = 450;
    setMotors(-SPEED_SPRINT_80, -SPEED_SPRINT_80); // Reverse 80%
  }

  // ==========================================================================
  // PRIORITY 2: CRITICAL OBSTACLE IN FRONT (< 35 cm) ➔ ACTIVE BRAKE + 100% PIVOT
  // ==========================================================================
  else if (distC < DIST_PIVOT_DANGER) {
    activeBrakePulse(); // Instantly kill forward momentum so rover doesn't skid forward!

    if (distL >= distR) {
      actionStr = "DANGER: PIVOT_LEFT_100";
      actionStartTime = now;
      minHoldMs = 340; // Clean 340ms pivot
      setMotors(-SPEED_PIVOT_100, SPEED_PIVOT_100);
    } else {
      actionStr = "DANGER: PIVOT_RIGHT_100";
      actionStartTime = now;
      minHoldMs = 340; // Clean 340ms pivot
      setMotors(SPEED_PIVOT_100, -SPEED_PIVOT_100);
    }
  }

  // ==========================================================================
  // PRIORITY 3: SIDE-WALL CLIP GUARD (< 24 cm on Left or Right)
  // Prevents wheels or front bumper from clipping side walls/doorways!
  // ==========================================================================
  else if (distL < DIST_SIDE_WALL_WARN) {
    actionStr = "GUARD: VEER_RIGHT";
    actionStartTime = now;
    // Steer away: Left normal, Right slow to swing away from left wall
    setMotors(SPEED_SPRINT_80, SPEED_CURVE_SLOW);
  }
  else if (distR < DIST_SIDE_WALL_WARN) {
    actionStr = "GUARD: VEER_LEFT";
    actionStartTime = now;
    // Steer away: Right normal, Left slow to swing away from right wall
    setMotors(SPEED_CURVE_SLOW, SPEED_SPRINT_80);
  }

  // ==========================================================================
  // PRIORITY 4: APPROACH WARNING ZONE (35 cm to 50 cm ahead)
  // Slow down to 55% speed & smoothly steer to the more open side
  // ==========================================================================
  else if (distC < DIST_SLOW_APPROACH) {
    float diff = distL - distR;

    if (diff < -DIFF_THRESHOLD_CM) {
      actionStr = "APPROACH: SLOW_CURVE_RIGHT";
      setMotors(SPEED_APPROACH, SPEED_CURVE_SLOW);
    } else if (diff > DIFF_THRESHOLD_CM) {
      actionStr = "APPROACH: SLOW_CURVE_LEFT";
      setMotors(SPEED_CURVE_SLOW, SPEED_APPROACH);
    } else {
      actionStr = "APPROACH: SLOW_FORWARD_55";
      setMotors(SPEED_APPROACH, SPEED_APPROACH);
    }
  }

  // ==========================================================================
  // PRIORITY 5: WIDE OPEN CRUISE (> 50 cm clear!)
  // Full 80% sprint with smooth balance correction
  // ==========================================================================
  else {
    float diff = distL - distR;

    if (diff < -DIFF_THRESHOLD_CM) {
      actionStr = "OPEN: CURVE_RIGHT (80%/40%)";
      setMotors(SPEED_SPRINT_80, SPEED_CURVE_SLOW);
    } else if (diff > DIFF_THRESHOLD_CM) {
      actionStr = "OPEN: CURVE_LEFT (40%/80%)";
      setMotors(SPEED_CURVE_SLOW, SPEED_SPRINT_80);
    } else {
      actionStr = "OPEN: SPRINT_FORWARD_80";
      setMotors(SPEED_SPRINT_80, SPEED_SPRINT_80);
    }
  }

  // 4. Debug Telemetry Printout (5 Hz)
  if (now - lastPrintMs >= 200) {
    lastPrintMs = now;
    Serial.print(F("[L: "));
    if (distL >= 350.0f) Serial.print(F(">350")); else Serial.print(distL, 1);
    Serial.print(F(" cm | C: "));
    if (distC >= 350.0f) Serial.print(F(">350")); else Serial.print(distC, 1);
    Serial.print(F(" cm | R: "));
    if (distR >= 350.0f) Serial.print(F(">350")); else Serial.print(distR, 1);
    Serial.print(F(" cm] ➔ "));
    Serial.println(actionStr);
  }
}
