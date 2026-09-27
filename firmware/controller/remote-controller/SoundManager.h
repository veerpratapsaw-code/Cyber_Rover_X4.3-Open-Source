/**
 * ============================================================================
 * @file SoundManager.h
 * @brief Non-blocking active/passive buzzer synthesizer. Driving pin LOW on 
 *        initialization to prevent boot-up buzz on active buzzers.
 *        Melodies stored in FLASH memory (PROGMEM).
 * ============================================================================
 */

#ifndef SOUND_MANAGER_H
#define SOUND_MANAGER_H

#include <Arduino.h>
#include "Config.h"

struct NoteStep {
    uint16_t frequency; // Frequency in Hz (0 = pause)
    uint16_t durationMs;// Note duration
};

// Preset Melodies Stored in PROGMEM / Flash Storage
const NoteStep PROGMEM startupSeq[] = {
    {1047, 100}, {1318, 100}, {1568, 100}, {2093, 200}
};

const NoteStep PROGMEM buttonClickSeq[] = {
    {2200, 30}
};

const NoteStep PROGMEM lowBatterySeq[] = {
    {1500, 150}, {0, 100}, {1200, 250}
};

const NoteStep PROGMEM connectionLostSeq[] = {
    {800, 100}, {0, 50}, {800, 100}, {0, 50}, {600, 300}
};

const NoteStep PROGMEM errorSeq[] = {
    {400, 200}, {0, 50}, {300, 300}
};

// Remote Controller Buzzer Silence Setting (User requested no beeping on remote)
#define REMOTE_BUZZER_ENABLED false

class SoundManager {
private:
    uint8_t buzzerPin;
    bool isPlaying;
    bool muted;
    const NoteStep* currentMelody;
    uint16_t currentStep;
    uint16_t totalSteps;
    uint32_t stepStartMs;

    void playNote(uint16_t freq) {
        #if !REMOTE_BUZZER_ENABLED
        return; // Permanently silenced on remote
        #endif
        if (muted) return;
        if (freq > 0) {
            tone(buzzerPin, freq);
        } else {
            noTone(buzzerPin);
            digitalWrite(buzzerPin, INVERT_BUZZER_LOGIC ? HIGH : LOW);
        }
    }

public:
    SoundManager() : buzzerPin(PIN_BUZZER), isPlaying(false), muted(true), currentMelody(NULL), 
                     currentStep(0), totalSteps(0), stepStartMs(0) {}

    void setMuted(bool mute) {
        muted = true; // Always muted on remote controller
        stop();
    }

    inline bool isMuted() const { return true; }

    void begin() {
        pinMode(buzzerPin, OUTPUT);
        // Keep buzzer pin completely inactive to prevent any buzz or clicks
        digitalWrite(buzzerPin, INVERT_BUZZER_LOGIC ? HIGH : LOW);
        noTone(buzzerPin);
    }

    /**
     * @brief Plays a sequence of notes non-blockingly from PROGMEM.
     */
    void playMelody(const NoteStep* melody, uint16_t stepCount) {
        if (muted) return;
        currentMelody = melody;
        totalSteps = stepCount;
        currentStep = 0;
        isPlaying = true;
        stepStartMs = millis();

        NoteStep firstStep;
        memcpy_P(&firstStep, &currentMelody[0], sizeof(NoteStep));
        playNote(firstStep.frequency);
    }

    // High-level audio triggers
    void playStartup() {
        playMelody(startupSeq, sizeof(startupSeq)/sizeof(NoteStep));
    }

    void playButtonClick() {
        playMelody(buttonClickSeq, sizeof(buttonClickSeq)/sizeof(NoteStep));
    }

    void playLowBattery() {
        playMelody(lowBatterySeq, sizeof(lowBatterySeq)/sizeof(NoteStep));
    }

    void playConnectionLost() {
        playMelody(connectionLostSeq, sizeof(connectionLostSeq)/sizeof(NoteStep));
    }

    void playError() {
        playMelody(errorSeq, sizeof(errorSeq)/sizeof(NoteStep));
    }

    void playBeep(uint16_t freq = 2000, uint16_t durMs = 50) {
        #if !REMOTE_BUZZER_ENABLED
        return; // Permanently silenced on remote
        #endif
        if (muted) return;
        tone(buzzerPin, freq, durMs);
    }

    void playTone(uint16_t freq, uint16_t durMs = 0) {
        #if !REMOTE_BUZZER_ENABLED
        return; // Permanently silenced on remote
        #endif
        if (muted) return;
        if (freq == 0) {
            stop();
            return;
        }
        if (durMs > 0) {
            tone(buzzerPin, freq, durMs);
        } else {
            tone(buzzerPin, freq);
        }
    }

    void playClick() {
        playButtonClick();
    }

    void stop() {
        noTone(buzzerPin);
        digitalWrite(buzzerPin, INVERT_BUZZER_LOGIC ? HIGH : LOW);
        isPlaying = false;
    }

    /**
     * @brief Non-blocking audio tick call executed inside loop().
     */
    void update() {
        if (!isPlaying || currentMelody == NULL) return;

        uint32_t now = millis();
        NoteStep activeStep;
        memcpy_P(&activeStep, &currentMelody[currentStep], sizeof(NoteStep));

        if (now - stepStartMs >= activeStep.durationMs) {
            currentStep++;
            if (currentStep >= totalSteps) {
                stop();
            } else {
                stepStartMs = now;
                memcpy_P(&activeStep, &currentMelody[currentStep], sizeof(NoteStep));
                playNote(activeStep.frequency);
            }
        }
    }

    inline bool isAudioPlaying() const { return isPlaying; }
};

#endif // SOUND_MANAGER_H
