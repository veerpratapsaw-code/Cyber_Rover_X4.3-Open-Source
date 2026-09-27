/**
 * ============================================================================
 * PROJECT   : CYBERROVER X4.3 — STANDALONE MOTOR DRIVER BENCH TEST
 * FILE      : motor-driver-test.ino
 * HARDWARE  : Arduino Uno (ATmega328P) + Dual BTS7960 43A Motor Drivers
 * 
 * SEQUENCE IN LOOP:
 *   1. Forward  (2 sec) ➔ STOP (1 sec)
 *   2. Backward (2 sec) ➔ STOP (1 sec)
 *   3. Turn Left (1.5 sec) ➔ STOP (1 sec)
 *   4. Turn Right (1.5 sec) ➔ STOP (1 sec)
 * ============================================================================
 */

// ============================================================================
// 1. PIN DEFINITIONS (Exact match with CyberRover X4.3 Hardware)
// ============================================================================
// Left BTS7960 Motor Driver
const int LEFT_RPWM = 5;
const int LEFT_LPWM = 6;

// Right BTS7960 Motor Driver
const int RIGHT_RPWM = 9;
const int RIGHT_LPWM = 10;

// Test Speed: 0 (Off) to 255 (Full Speed). 160 = Safe ~60% power for testing.
const int TEST_SPEED = 160;

// ============================================================================
// 2. HELPER FUNCTIONS FOR EACH DIRECTION
// ============================================================================

void stopMotors() {
  analogWrite(LEFT_RPWM, 0);
  analogWrite(LEFT_LPWM, 0);
  analogWrite(RIGHT_RPWM, 0);
  analogWrite(RIGHT_LPWM, 0);
}

void moveForward(int speed) {
  // Left Forward
  analogWrite(LEFT_RPWM, 0);
  analogWrite(LEFT_LPWM, speed);
  // Right Forward
  analogWrite(RIGHT_RPWM, 0);
  analogWrite(RIGHT_LPWM, speed);
}

void moveBackward(int speed) {
  // Left Backward
  analogWrite(LEFT_RPWM, speed);
  analogWrite(LEFT_LPWM, 0);
  // Right Backward
  analogWrite(RIGHT_RPWM, speed);
  analogWrite(RIGHT_LPWM, 0);
}

void turnLeft(int speed) {
  // Left Backward, Right Forward (Tank Spin Left)
  analogWrite(LEFT_RPWM, speed);
  analogWrite(LEFT_LPWM, 0);
  analogWrite(RIGHT_RPWM, 0);
  analogWrite(RIGHT_LPWM, speed);
}

void turnRight(int speed) {
  // Left Forward, Right Backward (Tank Spin Right)
  analogWrite(LEFT_RPWM, 0);
  analogWrite(LEFT_LPWM, speed);
  analogWrite(RIGHT_RPWM, speed);
  analogWrite(RIGHT_LPWM, 0);
}

// ============================================================================
// 3. SETUP
// ============================================================================
void setup() {
  // Configure BTS7960 PWM control pins as outputs
  pinMode(LEFT_RPWM, OUTPUT);
  pinMode(LEFT_LPWM, OUTPUT);
  pinMode(RIGHT_RPWM, OUTPUT);
  pinMode(RIGHT_LPWM, OUTPUT);

  // Ensure motors start completely stopped
  stopMotors();

  Serial.begin(115200);
  delay(500);

  Serial.println(F("=================================================="));
  Serial.println(F("    CYBERROVER X4.3 — MOTOR DRIVER BENCH TEST     "));
  Serial.println(F("=================================================="));
  Serial.println(F("Starting in 3 seconds... Keep wheels off the desk!"));
  
  // 3-second safety pause so you can get ready
  delay(3000);
}

// ============================================================================
// 4. MAIN TEST LOOP
// ============================================================================
void loop() {
  // --- 1. FORWARD ---
  Serial.println(F(">>> 1. MOVING FORWARD"));
  moveForward(TEST_SPEED);
  delay(2000); // Drive for 2 seconds

  Serial.println(F("--- STOP ---"));
  stopMotors();
  delay(1000); // Pause for 1 second


  // --- 2. BACKWARD ---
  Serial.println(F(">>> 2. MOVING BACKWARD"));
  moveBackward(TEST_SPEED);
  delay(2000); // Reverse for 2 seconds

  Serial.println(F("--- STOP ---"));
  stopMotors();
  delay(1000); // Pause for 1 second


  // --- 3. TURN LEFT ---
  Serial.println(F(">>> 3. TURNING LEFT (Tank Pivot)"));
  turnLeft(TEST_SPEED);
  delay(1500); // Spin for 1.5 seconds

  Serial.println(F("--- STOP ---"));
  stopMotors();
  delay(1000); // Pause for 1 second


  // --- 4. TURN RIGHT ---
  Serial.println(F(">>> 4. TURNING RIGHT (Tank Pivot)"));
  turnRight(TEST_SPEED);
  delay(1500); // Spin for 1.5 seconds

  Serial.println(F("--- STOP ---"));
  stopMotors();
  delay(1500); // Pause for 1.5 seconds before repeating


  Serial.println(F("Cycle complete! Repeating...\n"));
}
