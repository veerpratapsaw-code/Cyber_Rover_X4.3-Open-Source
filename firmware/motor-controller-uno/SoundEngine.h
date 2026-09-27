/**
 * ============================================================================
 * PROJECT   : CYBERROVER X — NODE 03: MOTOR CONTROLLER & SOUND BRAIN
 * FILE      : SoundEngine.h
 * PURPOSE   : 100% Non-Blocking Tactical Siren, Horn & Sound Generator
 * MCU       : Arduino Uno (ATmega328P)
 * ============================================================================
 */

#ifndef UNO_SOUND_ENGINE_H
#define UNO_SOUND_ENGINE_H

#include <Arduino.h>
#include "Config.h"

enum SoundEffect {
  FX_IDLE            = 0,
  FX_CAR_HORN        = 1,
  FX_TRUCK_HORN      = 2,
  FX_TIME_BOMB_SHORT = 3,
  FX_POLICE_SIREN    = 4,
  FX_REVERSE_BEEP    = 5,
  FX_GAS_ALARM       = 6,
  FX_SCIFI_CHIRP     = 7,
  FX_SOS_MORSE       = 8,
  FX_CONTINUOUS_HONK = 9,
  FX_TIME_BOMB_30S   = 10,
  FX_STOP_MUTE       = 99
};

class SoundEngine {
private:
  SoundEffect   currentFx;
  unsigned long fxStartTime;
  unsigned long lastFxStepTime;
  int           fxStep;
  bool          isBuzzerHigh;
  bool          muted;

public:
  SoundEngine()
    : currentFx(FX_IDLE), fxStartTime(0), lastFxStepTime(0),
      fxStep(0), isBuzzerHigh(false), muted(false) {}

  void begin() {
    pinMode(BUZZER_PIN, OUTPUT);
    setBuzzer(false);
  }

  void setMuted(bool isMute) {
    muted = isMute;
    if (muted) setBuzzer(false);
  }

  bool isMuted() const { return muted; }

  void setBuzzer(bool state, unsigned int freq = 2400) {
    if (muted || !state) {
      noTone(BUZZER_PIN);
      digitalWrite(BUZZER_PIN, LOW);
      isBuzzerHigh = false;
      return;
    }
    isBuzzerHigh = true;
    digitalWrite(BUZZER_PIN, HIGH); // Active Buzzer (5V trigger)
    tone(BUZZER_PIN, freq);          // Passive Buzzer (AC square wave)
  }

  void triggerSound(SoundEffect fx) {
    if (fx == FX_STOP_MUTE) {
      currentFx = FX_IDLE;
      setBuzzer(false);
      return;
    }
    muted = false; // Unmute on explicit user trigger
    currentFx = fx;
    fxStartTime = millis();
    lastFxStepTime = millis();
    fxStep = 0;
  }

  void triggerById(int8_t soundId) {
    switch (soundId) {
      case 1:  triggerSound(FX_CAR_HORN); break;
      case 2:  triggerSound(FX_TRUCK_HORN); break;
      case 3:  triggerSound(FX_TIME_BOMB_SHORT); break;
      case 4:  triggerSound(FX_POLICE_SIREN); break;
      case 5:  triggerSound(FX_REVERSE_BEEP); break;
      case 6:  triggerSound(FX_GAS_ALARM); break;
      case 7:  triggerSound(FX_SCIFI_CHIRP); break;
      case 8:  triggerSound(FX_SOS_MORSE); break;
      case 9:  triggerSound(FX_CONTINUOUS_HONK); break;
      case 10: triggerSound(FX_TIME_BOMB_30S); break;
      case 99: triggerSound(FX_STOP_MUTE); break;
      default: triggerSound(FX_CAR_HORN); break;
    }
  }

  void update() {
    if (currentFx == FX_IDLE) return;
    unsigned long now = millis();
    unsigned long elapsedStep = now - lastFxStepTime;
    unsigned long totalElapsed = now - fxStartTime;

    switch (currentFx) {
      // 1. CAR HORN ("Beep-Beep")
      case FX_CAR_HORN:
        if (fxStep == 0) { setBuzzer(true); lastFxStepTime = now; fxStep = 1; }
        else if (fxStep == 1 && elapsedStep >= 90) { setBuzzer(false); lastFxStepTime = now; fxStep = 2; }
        else if (fxStep == 2 && elapsedStep >= 60) { setBuzzer(true); lastFxStepTime = now; fxStep = 3; }
        else if (fxStep == 3 && elapsedStep >= 160) { setBuzzer(false); currentFx = FX_IDLE; }
        break;

      // 2. HEAVY TRUCK HORN
      case FX_TRUCK_HORN:
        if (fxStep == 0) { setBuzzer(true); lastFxStepTime = now; fxStep = 1; }
        else if (fxStep == 1 && elapsedStep >= 800) { setBuzzer(false); currentFx = FX_IDLE; }
        break;

      // 3. SHORT TIME BOMB (7 Seconds Accelerating)
      case FX_TIME_BOMB_SHORT: {
        const int bombIntervals[] = {700, 550, 420, 300, 220, 160, 110, 75, 50, 30};
        const int totalBeeps = sizeof(bombIntervals) / sizeof(bombIntervals[0]);
        if (fxStep < totalBeeps * 2) {
          int idx = fxStep / 2;
          if (fxStep % 2 == 0) {
            setBuzzer(true);
            if (elapsedStep >= 35) { setBuzzer(false); lastFxStepTime = now; fxStep++; }
          } else {
            if (elapsedStep >= (unsigned long)bombIntervals[idx]) { lastFxStepTime = now; fxStep++; }
          }
        } else if (fxStep == totalBeeps * 2) {
          setBuzzer(true);
          if (elapsedStep >= 1200) { setBuzzer(false); currentFx = FX_IDLE; }
        }
        break;
      }

      // 10. AUTHENTIC 30-SECOND TIME BOMB COUNTDOWN (CS:GO / Hollywood)
      case FX_TIME_BOMB_30S: {
        if (totalElapsed < 30000) {
          unsigned long interval = 1000;
          if (totalElapsed >= 29000) interval = 60;
          else if (totalElapsed >= 27000) interval = 125;
          else if (totalElapsed >= 22000) interval = 250;
          else if (totalElapsed >= 15000) interval = 500;

          if (elapsedStep < 35) {
            setBuzzer(true);
          } else {
            setBuzzer(false);
            if (elapsedStep >= interval) {
              lastFxStepTime = now;
            }
          }
        } else if (totalElapsed < 32500) {
          setBuzzer(true); // Continuous 2.5s Blast
        } else {
          setBuzzer(false);
          currentFx = FX_IDLE;
        }
        break;
      }

      // 4. POLICE SIREN
      case FX_POLICE_SIREN:
        if (fxStep < 14) {
          if (fxStep % 2 == 0) {
            setBuzzer(true);
            if (elapsedStep >= 90) { setBuzzer(false); lastFxStepTime = now; fxStep++; }
          } else {
            if (elapsedStep >= 50) { lastFxStepTime = now; fxStep++; }
          }
        } else {
          setBuzzer(false); currentFx = FX_IDLE;
        }
        break;

      // 5. REVERSE WARNING BEEPER
      case FX_REVERSE_BEEP:
        if (fxStep < 6) {
          if (fxStep % 2 == 0) {
            setBuzzer(true);
            if (elapsedStep >= 250) { setBuzzer(false); lastFxStepTime = now; fxStep++; }
          } else {
            if (elapsedStep >= 250) { lastFxStepTime = now; fxStep++; }
          }
        } else {
          setBuzzer(false); currentFx = FX_IDLE;
        }
        break;

      // 6. GAS HAZARD ALARM
      case FX_GAS_ALARM:
        if (fxStep < 8) {
          if (fxStep % 2 == 0) {
            setBuzzer(true);
            if (elapsedStep >= 70) { setBuzzer(false); lastFxStepTime = now; fxStep++; }
          } else {
            if (elapsedStep >= 40) { lastFxStepTime = now; fxStep++; }
          }
        } else {
          setBuzzer(false); currentFx = FX_IDLE;
        }
        break;

      // 7. SCI-FI ARMING CHIRP
      case FX_SCIFI_CHIRP:
        if (fxStep == 0) { setBuzzer(true); lastFxStepTime = now; fxStep = 1; }
        else if (fxStep == 1 && elapsedStep >= 25) { setBuzzer(false); lastFxStepTime = now; fxStep = 2; }
        else if (fxStep == 2 && elapsedStep >= 45) { setBuzzer(true); lastFxStepTime = now; fxStep = 3; }
        else if (fxStep == 3 && elapsedStep >= 25) { setBuzzer(false); currentFx = FX_IDLE; }
        break;

      // 8. SOS MORSE CODE
      case FX_SOS_MORSE: {
        const int sosDurations[] = {
          80, 80, 80, 80, 80, 200,
          240, 80, 240, 80, 240, 200,
          80, 80, 80, 80, 80, 400
        };
        const int totalSteps = sizeof(sosDurations) / sizeof(sosDurations[0]);
        if (fxStep < totalSteps) {
          if (fxStep % 2 == 0) {
            setBuzzer(true);
            if (elapsedStep >= (unsigned long)sosDurations[fxStep]) {
              setBuzzer(false); lastFxStepTime = now; fxStep++;
            }
          } else {
            if (elapsedStep >= (unsigned long)sosDurations[fxStep]) {
              lastFxStepTime = now; fxStep++;
            }
          }
        } else {
          setBuzzer(false); currentFx = FX_IDLE;
        }
        break;
      }

      // 9. CONTINUOUS HONK
      case FX_CONTINUOUS_HONK:
        setBuzzer(true);
        break;

      default:
        setBuzzer(false);
        currentFx = FX_IDLE;
        break;
    }
  }
};

#endif // UNO_SOUND_ENGINE_H
