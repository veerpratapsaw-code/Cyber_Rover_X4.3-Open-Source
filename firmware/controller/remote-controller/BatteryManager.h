/**
 * ============================================================================
 * @file BatteryManager.h
 * @brief Precision battery voltage monitor with factory esp_adc_cal characterization,
 *        disconnection detection (< 1.0V), 16x oversampling, and 50mV hysteresis.
 * ============================================================================
 */

#ifndef BATTERY_MANAGER_H
#define BATTERY_MANAGER_H

#include <Arduino.h>
#include <esp_adc_cal.h>
#include "Config.h"
#include "Types.h"

class BatteryManager {
private:
    BatteryState state;
    bool initialized;
    esp_adc_cal_characteristics_t adcChars;
    float dynamicCalibFactor;
    float avgVoltage;
    uint32_t lastAvgTickMs;

    /**
     * @brief Performs 16x oversampled ADC read to eliminate noise.
     */
    int readOversampledAdc() {
        uint32_t sum = 0;
        for (int i = 0; i < BATTERY_OVERSAMPLE; i++) {
            sum += analogRead(PIN_BATTERY_ADC);
            delayMicroseconds(50);
        }
        return (int)(sum / BATTERY_OVERSAMPLE);
    }

public:
    BatteryManager() : initialized(false), dynamicCalibFactor(BATTERY_CALIB_FACTOR), avgVoltage(0.0f), lastAvgTickMs(0) {
        state.rawAdc = 0;
        state.smoothedAdc = 0.0f;
        state.voltage = 0.0f;
        state.percentage = 0.0f;
        state.health = BATTERY_OK;
        state.lowBatteryAlert = false;
        state.criticalBatteryAlert = false;
        state.lastReadMs = 0;
    }

    void setCalibFactor(float factor) {
        dynamicCalibFactor = factor;
    }

    float getCalibFactor() const {
        return dynamicCalibFactor;
    }

    void begin() {
        analogReadResolution(ADC_RESOLUTION_BITS);
        analogSetPinAttenuation(PIN_BATTERY_ADC, ADC_11db);

        // Characterize ADC using factory eFuse Vref stored in ESP32 ROM
        esp_adc_cal_characterize(
            ADC_UNIT_1,
            ADC_ATTEN_DB_11,
            ADC_WIDTH_BIT_12,
            1100, // Default Vref in mV
            &adcChars
        );

        // Seed initial oversampled filter state
        state.rawAdc = readOversampledAdc();
        state.smoothedAdc = (float)state.rawAdc;
        update(true);
        avgVoltage = state.voltage;
        initialized = true;
    }

    /**
     * @brief Periodic non-blocking battery sensor reading & 10-second rolling average processing.
     */
    void update(bool forceRead = false) {
        uint32_t now = millis();
        if (!forceRead && (now - state.lastReadMs < BATTERY_SAMPLE_MS)) {
            return;
        }
        state.lastReadMs = now;

        // 1. Oversampled ADC acquisition
        state.rawAdc = readOversampledAdc();

        // 2. Exponential Moving Average (EMA) low-pass filter
        if (state.smoothedAdc == 0.0f) {
            state.smoothedAdc = (float)state.rawAdc;
        } else {
            state.smoothedAdc = (BATTERY_FILTER_ALPHA * (float)state.rawAdc) + 
                               ((1.0f - BATTERY_FILTER_ALPHA) * state.smoothedAdc);
        }

        // 3. Check for Disconnected Battery (floating noise < 150 ADC counts)
        if (state.smoothedAdc < 150.0f) {
            state.voltage = 0.0f;
            avgVoltage = 0.0f;
            state.percentage = 0.0f;
            state.health = BATTERY_CRITICAL_WARNING;
            state.lowBatteryAlert = true;
            state.criticalBatteryAlert = true;
            return;
        }

        // 4. Convert raw ADC to calibrated pin millivolts via eFuse calibration
        uint32_t pinMilliVolts = esp_adc_cal_raw_to_voltage((uint32_t)state.smoothedAdc, &adcChars);
        float adcVolts = (float)pinMilliVolts / 1000.0f;

        // 5. Compute Instant Battery Voltage using Resistor Divider & Dynamic Calibration
        float instantVoltage = adcVolts * BATTERY_DIVIDER_RATIO * dynamicCalibFactor;

        // 6. 10-Second Heavy EMA Rolling Average (0.02 alpha = 10-second window stabilization)
        if (avgVoltage == 0.0f) {
            avgVoltage = instantVoltage;
        } else {
            avgVoltage = (0.02f * instantVoltage) + (0.98f * avgVoltage);
        }
        state.voltage = avgVoltage;

        // 7. Calculate Percentage (4.20V = 100%, 3.60V = 0%)
        state.percentage = ((state.voltage - BATTERY_MIN_VOLTS) / (BATTERY_MAX_VOLTS - BATTERY_MIN_VOLTS)) * 100.0f;
        if (state.percentage > 100.0f) {
            state.percentage = 100.0f;
        }

        // 8. Evaluate Health & Alert Statuses with 50mV Hysteresis to prevent bouncing
        float lowThresh = 3.70f;
        float critThresh = BATTERY_CRIT_VOLTS;

        if (state.voltage < critThresh) {
            state.health = BATTERY_CRITICAL_WARNING;
        } else if (state.voltage < lowThresh) {
            state.health = BATTERY_LOW_WARNING;
        } else {
            state.health = BATTERY_OK;
        }

        state.lowBatteryAlert = (state.health != BATTERY_OK);
        state.criticalBatteryAlert = (state.health == BATTERY_CRITICAL_WARNING);
    }

    // Getters
    inline float getVoltage() const { return state.voltage; }
    inline float getPercentage() const { return state.percentage; }
    inline int getRawAdc() const { return state.rawAdc; }
    inline BatteryHealth getHealth() const { return state.health; }
    inline bool isLow() const { return state.lowBatteryAlert; }
    inline bool isCritical() const { return state.criticalBatteryAlert; }
    inline const BatteryState& getState() const { return state; }
};

#endif // BATTERY_MANAGER_H
