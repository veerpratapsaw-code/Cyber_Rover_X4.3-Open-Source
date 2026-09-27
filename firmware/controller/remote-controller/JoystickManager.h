/**
 * ============================================================================
 * @file JoystickManager.h
 * @brief Dual-joystick signal acquisition engine featuring fast auto-calibration,
 *        8x burst oversampling, deadzone clamping, cubic exponential curves,
 *        and hardware axis inversion.
 * ============================================================================
 */

#ifndef JOYSTICK_MANAGER_H
#define JOYSTICK_MANAGER_H

#include <Arduino.h>
#include "Config.h"
#include "Types.h"

class JoystickManager {
private:
    JoystickPair leftJoy;
    JoystickPair rightJoy;
    uint8_t curveMode; // 0=Linear, 1=Soft Expo, 2=Sport Boost
    int activeDeadzone;
    uint32_t lastLSwDebounceMs;
    uint32_t lastRSwDebounceMs;
    bool rawLSwState;
    bool rawRSwState;

    /**
     * @brief Performs 8x burst oversampling on an analog pin.
     */
    int readOversampledPin(uint8_t pin) {
        int sum = 0;
        for (int i = 0; i < JOY_OVERSAMPLE_CNT; i++) {
            sum += analogRead(pin);
            delayMicroseconds(10);
        }
        return sum / JOY_OVERSAMPLE_CNT;
    }

    /**
     * @brief Processes a single analog joystick axis with filtering, deadzone & curve.
     */
    void processAxis(JoystickAxis &axis, int rawAdc) {
        axis.rawValue = rawAdc;

        // Exponential Moving Average low-pass filter
        axis.smoothedValue = (JOY_FILTER_ALPHA * (float)rawAdc) + 
                             ((1.0f - JOY_FILTER_ALPHA) * axis.smoothedValue);

        // Center calculation relative to calibrated center
        float delta = axis.smoothedValue - (float)axis.centerOffset;

        // Apply Deadzone Clamping
        int currentDeadzone = (activeDeadzone > 0) ? activeDeadzone : axis.deadzone;
        if (fabs(delta) <= (float)currentDeadzone) {
            axis.mappedValue = 0;
            axis.isCentered = true;
        } else {
            axis.isCentered = false;
            float normalized = 0.0f;

            // Map positive and negative spans independently for asymmetric physical pots
            if (delta > 0) {
                float maxPosSpan = (float)(ADC_MAX_RAW - axis.centerOffset - currentDeadzone);
                if (maxPosSpan <= 0.0f) maxPosSpan = 1.0f;
                normalized = (delta - (float)currentDeadzone) / maxPosSpan;
                normalized = constrain(normalized, 0.0f, 1.0f);
            } else {
                float maxNegSpan = (float)(axis.centerOffset - currentDeadzone);
                if (maxNegSpan <= 0.0f) maxNegSpan = 1.0f;
                normalized = (delta + (float)currentDeadzone) / maxNegSpan;
                normalized = constrain(normalized, -1.0f, 0.0f);
            }

            // Apply selected response curve
            float curveResult = normalized;
            if (curveMode == 1) {
                // Cubic Expo: f(x) = (1-a)*x + a*x^3
                curveResult = ((1.0f - JOY_EXPO_FACTOR) * normalized) + 
                              (JOY_EXPO_FACTOR * (normalized * normalized * normalized));
            } else if (curveMode == 2) {
                // Sport Boost: Aggressive quadratic scaling
                curveResult = (normalized >= 0.0f) ? (normalized * normalized) : -(normalized * normalized);
            }

            axis.mappedValue = (int)(curveResult * JOY_MAPPED_MAX);
            axis.mappedValue = constrain(axis.mappedValue, JOY_MAPPED_MIN, JOY_MAPPED_MAX);
        }
    }

public:
    JoystickManager() : curveMode(1), activeDeadzone(JOY_DEFAULT_DEADZONE),
                        lastLSwDebounceMs(0), lastRSwDebounceMs(0),
                        rawLSwState(false), rawRSwState(false) {
        initAxis(leftJoy.xAxis);
        initAxis(leftJoy.yAxis);
        initAxis(rightJoy.xAxis);
        initAxis(rightJoy.yAxis);
        leftJoy.switchPressed = false;
        rightJoy.switchPressed = false;
        leftJoy.switchJustPressed = false;
        leftJoy.switchJustReleased = false;
        rightJoy.switchJustPressed = false;
        rightJoy.switchJustReleased = false;
    }

    void setCurveMode(uint8_t mode) { curveMode = mode; }
    uint8_t getCurveMode() const { return curveMode; }
    void setDeadzone(int dz) { activeDeadzone = dz; }
    int getDeadzone() const { return activeDeadzone; }

    void initAxis(JoystickAxis &axis) {
        axis.rawValue = 2048;
        axis.smoothedValue = 2048.0f;
        axis.centerOffset = 2048;
        axis.deadzone = JOY_DEFAULT_DEADZONE;
        axis.mappedValue = 0;
        axis.isCentered = true;
    }

    void begin() {
        pinMode(PIN_JOY_L_SW, INPUT_PULLUP);
        pinMode(PIN_JOY_R_SW, INPUT_PULLUP);
        analogReadResolution(ADC_RESOLUTION_BITS);
    }

    /**
     * @brief Auto calibration with visual progress bar updates.
     */
    void autoCalibrate(void (*progressCallback)(int percent) = NULL) {
        // Brief 150ms settling time so thumb releases tactile switch
        delay(150);

        long sumLX = 0, sumLY = 0;
        long sumRX = 0, sumRY = 0;

        for (int i = 0; i < JOY_CALIB_SAMPLES; i++) {
            sumLX += analogRead(PIN_JOY_L_X);
            sumLY += analogRead(PIN_JOY_L_Y);
            sumRX += analogRead(PIN_JOY_R_X);
            sumRY += analogRead(PIN_JOY_R_Y);

            if (progressCallback != NULL && (i % 2 == 0)) {
                progressCallback((i * 100) / JOY_CALIB_SAMPLES);
            }
            delay(5); // Clean 500ms calibration duration for accurate zeroing
        }

        leftJoy.xAxis.centerOffset  = (int)(sumLX / JOY_CALIB_SAMPLES);
        leftJoy.yAxis.centerOffset  = (int)(sumLY / JOY_CALIB_SAMPLES);
        rightJoy.xAxis.centerOffset = (int)(sumRX / JOY_CALIB_SAMPLES);
        rightJoy.yAxis.centerOffset = (int)(sumRY / JOY_CALIB_SAMPLES);

        leftJoy.xAxis.smoothedValue  = leftJoy.xAxis.centerOffset;
        leftJoy.yAxis.smoothedValue  = leftJoy.yAxis.centerOffset;
        rightJoy.xAxis.smoothedValue = rightJoy.xAxis.centerOffset;
        rightJoy.yAxis.smoothedValue = rightJoy.yAxis.centerOffset;

        leftJoy.xAxis.mappedValue = 0;
        leftJoy.yAxis.mappedValue = 0;
        rightJoy.xAxis.mappedValue = 0;
        rightJoy.yAxis.mappedValue = 0;

        if (progressCallback != NULL) {
            progressCallback(100);
            delay(50);
        }
    }

    /**
     * @brief Periodic non-blocking joystick sampling & signal processing loop.
     */
    void update() {
        // Read & Process Left Joystick
        processAxis(leftJoy.xAxis, readOversampledPin(PIN_JOY_L_X));
        processAxis(leftJoy.yAxis, readOversampledPin(PIN_JOY_L_Y));

        // Read & Process Right Joystick
        processAxis(rightJoy.xAxis, readOversampledPin(PIN_JOY_R_X));
        processAxis(rightJoy.yAxis, readOversampledPin(PIN_JOY_R_Y));

        // Read Joystick Push Switches with 25ms Debounce Filter
        uint32_t now = millis();
        bool curRawL = (digitalRead(PIN_JOY_L_SW) == LOW);
        leftJoy.switchJustPressed = false;
        leftJoy.switchJustReleased = false;

        if (curRawL != rawLSwState) {
            rawLSwState = curRawL;
            lastLSwDebounceMs = now;
        }
        if ((now - lastLSwDebounceMs) >= 25) {
            if (curRawL != leftJoy.switchPressed) {
                leftJoy.switchPressed = curRawL;
                if (leftJoy.switchPressed) {
                    leftJoy.switchJustPressed = true;
                } else {
                    leftJoy.switchJustReleased = true;
                }
            }
        }

        bool curRawR = (digitalRead(PIN_JOY_R_SW) == LOW);
        rightJoy.switchJustPressed = false;
        rightJoy.switchJustReleased = false;

        if (curRawR != rawRSwState) {
            rawRSwState = curRawR;
            lastRSwDebounceMs = now;
        }
        if ((now - lastRSwDebounceMs) >= 25) {
            if (curRawR != rightJoy.switchPressed) {
                rightJoy.switchPressed = curRawR;
                if (rightJoy.switchPressed) {
                    rightJoy.switchJustPressed = true;
                } else {
                    rightJoy.switchJustReleased = true;
                }
            }
        }
    }

    // Accessors with hardware axis inversion support
    inline const JoystickPair& getLeftJoystick() const { return leftJoy; }
    inline const JoystickPair& getRightJoystick() const { return rightJoy; }
    
    inline int16_t getLeftX() const { 
        int val = leftJoy.xAxis.mappedValue;
        return JOY_L_INVERT_X ? (int16_t)(-val) : (int16_t)val;
    }
    
    inline int16_t getLeftY() const { 
        int val = leftJoy.yAxis.mappedValue;
        return JOY_L_INVERT_Y ? (int16_t)(-val) : (int16_t)val;
    }
    
    inline int16_t getRightX() const { 
        int val = rightJoy.xAxis.mappedValue;
        return JOY_R_INVERT_X ? (int16_t)(-val) : (int16_t)val;
    }
    
    inline int16_t getRightY() const { 
        int val = rightJoy.yAxis.mappedValue;
        return JOY_R_INVERT_Y ? (int16_t)(-val) : (int16_t)val;
    }

    inline bool isLeftSwitchPressed() const { return leftJoy.switchPressed; }
    inline bool isRightSwitchPressed() const { return rightJoy.switchPressed; }
    inline bool isLeftSwitchJustPressed() const { return leftJoy.switchJustPressed; }
    inline bool isRightSwitchJustPressed() const { return rightJoy.switchJustPressed; }
};

#endif // JOYSTICK_MANAGER_H
