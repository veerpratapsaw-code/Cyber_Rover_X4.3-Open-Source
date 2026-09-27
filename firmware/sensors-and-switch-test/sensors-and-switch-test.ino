/**
 * ============================================================================
 * PROJECT   : CYBERROVER X4.3 — HARDWARE DIAGNOSTIC BENCH TEST
 * FILE      : sensors-and-switch-test.ino
 * HARDWARE  : Arduino Uno (ATmega328P)
 * 
 * TESTS:
 *   1. 3x HC-SR04 Ultrasonic Sonar Sensors (Left, Center, Right)
 *   2. 2-Wire Auto/Manual Toggle Switch (with INPUT_PULLUP)
 *   3. Tactical Piezo Buzzer (Audio beeps on switch toggle & proximity alert)
 * 
 * WIRING GUIDE FOR 2-WIRE TOGGLE SWITCH:
 *   - Wire 1 -> Connect to Pin 7 (MODE_SWITCH_PIN)
 *   - Wire 2 -> Connect to GND (Ground)
 *   (Internal pull-up is used, so NO external resistor is needed!)
 * ============================================================================
 */

// ============================================================================
// 1. PIN DEFINITIONS
// ============================================================================

// 2-Wire Manual/Auto Toggle Switch
const int MODE_SWITCH_PIN = 11; // Connect one wire to Pin 7, other wire to GND

// Active / Passive Piezo Buzzer
const int BUZZER_PIN = 8;

// HC-SR04 Ultrasonic Radar Pins
const int LEFT_TRIG_PIN   = A5;
const int LEFT_ECHO_PIN   = A4;

const int CENTER_TRIG_PIN = A3;
const int CENTER_ECHO_PIN = A2;

const int RIGHT_TRIG_PIN  = A1;
const int RIGHT_ECHO_PIN  = A0;

// Maximum measurement distance timeout (25ms = ~400 cm)
const unsigned long MAX_TIMEOUT_US = 25000;

// State tracking
int lastSwitchState = -1;
unsigned long lastPrintMs = 0;

// ============================================================================
// 2. ULTRASONIC SENSOR PING FUNCTION
// ============================================================================
float readDistanceCm(int trigPin, int echoPin) {
  // Send 10µs trigger pulse
  digitalWrite(trigPin, LOW);
  delayMicroseconds(4);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  // Measure echo pulse width in microseconds
  unsigned long duration = pulseIn(echoPin, HIGH, MAX_TIMEOUT_US);

  if (duration == 0) {
    return 400.0f; // Out of range or no echo detected
  }

  // Speed of sound: 343 m/s = 0.0343 cm/µs. Distance = (duration / 2) * 0.0343
  float dist = (float)duration * 0.01715f;
  return dist;
}

// ============================================================================
// 3. BUZZER CHIRP FUNCTIONS
// ============================================================================
void beepChirp(int frequency, int durationMs) {
  tone(BUZZER_PIN, frequency, durationMs);
  delay(durationMs);
  noTone(BUZZER_PIN);
}

void beepAutoMode() {
  // Two quick cheerful beeps for AUTO
  tone(BUZZER_PIN, 1800, 80);
  delay(100);
  tone(BUZZER_PIN, 2400, 120);
  delay(140);
  noTone(BUZZER_PIN);
}

void beepManualMode() {
  // One low confirm tone for MANUAL
  tone(BUZZER_PIN, 1000, 150);
  delay(170);
  noTone(BUZZER_PIN);
}

void beepProximityAlert() {
  // Quick warning chirp when obstacle is closer than 15 cm
  tone(BUZZER_PIN, 3000, 30);
}

// ============================================================================
// 4. SETUP
// ============================================================================
void setup() {
  // 1. Configure Switch with internal pullup resistor
  // When switch is OPEN (disconnected)  -> Pin 7 reads HIGH (1) = MANUAL
  // When switch is CLOSED (to GND)      -> Pin 7 reads LOW  (0) = AUTO
  pinMode(MODE_SWITCH_PIN, INPUT_PULLUP);

  // 2. Configure Buzzer pin
  pinMode(BUZZER_PIN, OUTPUT);

  // 3. Configure Ultrasonic pins
  pinMode(LEFT_TRIG_PIN, OUTPUT);
  pinMode(LEFT_ECHO_PIN, INPUT);

  pinMode(CENTER_TRIG_PIN, OUTPUT);
  pinMode(CENTER_ECHO_PIN, INPUT);

  pinMode(RIGHT_TRIG_PIN, OUTPUT);
  pinMode(RIGHT_ECHO_PIN, INPUT);

  // 4. Start Serial Monitor
  Serial.begin(115200);
  delay(500);

  Serial.println();
  Serial.println(F("=================================================================="));
  Serial.println(F(" CYBERROVER X4.3 — ULTRASONIC SENSORS, SWITCH & BUZZER TEST       "));
  Serial.println(F("=================================================================="));
  Serial.println(F(" Instructions:"));
  Serial.println(F("   1. Move your hand in front of LEFT, CENTER, RIGHT sensors."));
  Serial.println(F("   2. Flip your 2-wire switch (Pin 7 <-> GND) to test mode changes."));
  Serial.println(F("   3. Buzzer will beep on switch flip and alert if Center < 15 cm."));
  Serial.println(F("=================================================================="));
  Serial.println();

  // Power-on confirmation chirp
  beepChirp(2000, 150);
}

// ============================================================================
// 5. MAIN LOOP
// ============================================================================
void loop() {
  unsigned long now = millis();

  // -------------------------------------------------------------
  // 1. READ 2-WIRE TOGGLE SWITCH (Pin 7 <-> GND)
  // -------------------------------------------------------------
  int rawSwitch = digitalRead(MODE_SWITCH_PIN);
  bool isAutoMode = (rawSwitch == LOW); // LOW means switch is flipped to GND

  // Detect switch toggle edge and play sound
  if (rawSwitch != lastSwitchState) {
    lastSwitchState = rawSwitch;
    if (isAutoMode) {
      Serial.println(F("\n>>> [SWITCH TOGGLED] ➔ Switched to AUTO MODE (Closed to GND)"));
      beepAutoMode();
    } else {
      Serial.println(F("\n>>> [SWITCH TOGGLED] ➔ Switched to MANUAL MODE (Open)"));
      beepManualMode();
    }
  }

  // -------------------------------------------------------------
  // 2. SAMPLE 3X ULTRASONIC SENSORS IN ROUND-ROBIN
  // -------------------------------------------------------------
  // Ping Left
  float distL = readDistanceCm(LEFT_TRIG_PIN, LEFT_ECHO_PIN);
  delay(15); // Small delay between pings to prevent ultrasonic echo crosstalk

  // Ping Center
  float distC = readDistanceCm(CENTER_TRIG_PIN, CENTER_ECHO_PIN);
  delay(15);

  // Ping Right
  float distR = readDistanceCm(RIGHT_TRIG_PIN, RIGHT_ECHO_PIN);
  delay(15);

  // Proximity alarm if center obstacle is closer than 15 cm
  if (distC < 15.0f && distC > 2.0f) {
    beepProximityAlert();
  }

  // -------------------------------------------------------------
  // 3. PRINT FORMATTED SENSOR TABLE TO SERIAL MONITOR (every 200 ms / 5 Hz)
  // -------------------------------------------------------------
  if (now - lastPrintMs >= 200) {
    lastPrintMs = now;

    Serial.print(F("[MODE: "));
    if (isAutoMode) {
      Serial.print(F("AUTO (ON)  "));
    } else {
      Serial.print(F("MANUAL (OFF)"));
    }
    Serial.print(F("] | US SENSORS -> "));

    // Left Sensor
    Serial.print(F("LEFT: "));
    if (distL >= 400.0f) Serial.print(F(">400"));
    else Serial.print(distL, 1);
    Serial.print(F(" cm  "));

    // Center Sensor
    Serial.print(F("| CENTER: "));
    if (distC >= 400.0f) Serial.print(F(">400"));
    else Serial.print(distC, 1);
    Serial.print(F(" cm "));
    if (distC < 25.0f) Serial.print(F("[WARN!] "));
    else               Serial.print(F("        "));

    // Right Sensor
    Serial.print(F("| RIGHT: "));
    if (distR >= 400.0f) Serial.print(F(">400"));
    else Serial.print(distR, 1);
    Serial.println(F(" cm"));
  }
}
