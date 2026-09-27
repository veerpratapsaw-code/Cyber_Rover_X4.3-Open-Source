/**
 * ============================================================================
 * @file Config.h
 * @brief Master system configuration, pin mapping, hardware parameters, 
 *        and performance tuning flags for CYBERROVER X REMOTE.
 * 
 * Target MCU : ESP32 DevKit V1 (38-Pin, ESP32 D0WD V3)
 * Framework  : Arduino / ESP-IDF Core (C++17)
 * ============================================================================
 */

#ifndef CONFIG_H
#define CONFIG_H

#include <Arduino.h>

//==================================================
// FIRMWARE METADATA & VERSIONING
//==================================================
#define FW_NAME             "CYBERROVER X"
#define FW_ROLE             "REMOTE CONTROLLER"
#define FW_VERSION          "v3.4.0-NO_LEDS"
#define FW_BUILD_DATE       __DATE__
#define TARGET_SYSTEM       "CYBERROVER S3"

//==================================================
// OLED DISPLAY (SSD1306 128x64 I2C)
//==================================================
#define OLED_SDA            21
#define OLED_SCL            22
#define OLED_SCREEN_WIDTH   128
#define OLED_SCREEN_HEIGHT  64
#define OLED_I2C_ADDRESS    0x3C
#define OLED_I2C_SPEED      400000L  // 400kHz Standard Fast I2C Clock
#define OLED_REFRESH_HZ     30       // Target rendering frame rate (30 FPS)
#define OLED_INTERVAL_MS    (1000 / OLED_REFRESH_HZ)

//==================================================
// JOYSTICK PINS & DEDICATED ADC1 HARDWARE ASSIGNMENT
// Right Joystick X and Y swapped as requested (X=33, Y=32)
//==================================================
// Left Joystick
#define PIN_JOY_L_X         35     // ADC1_CH7 (Analog Input)
#define PIN_JOY_L_Y         34     // ADC1_CH6 (Analog Input)
#define PIN_JOY_L_SW        25     // Digital Input (Sequential P25)

// Right Joystick (X and Y axis swapped)
#define PIN_JOY_R_X         33     // ADC1_CH5 (Swapped to GPIO33 for X-Axis)
#define PIN_JOY_R_Y         32     // ADC1_CH4 (Swapped to GPIO32 for Y-Axis)
#define PIN_JOY_R_SW        26     // Digital Input (Sequential P26)

// Hardware Axis Inversion Flags
#define JOY_L_INVERT_X      true   // Invert Left X axis
#define JOY_L_INVERT_Y      true   // Invert Left Y axis (Pushed forward = +1000)
#define JOY_R_INVERT_X      true   // Invert Right X axis
#define JOY_R_INVERT_Y      true   // Invert Right Y axis (Pushed forward = +1000)

// Advanced Signal Filtering & Curve Parameters
#define JOY_OVERSAMPLE_CNT  8      // 8x Burst Oversampling per axis
#define ADC_RESOLUTION_BITS 12
#define ADC_MAX_RAW          4095
#define JOY_DEFAULT_DEADZONE 120    // Neutral center deadzone window
#define JOY_MAPPED_MIN       -1000  // Protocol min value
#define JOY_MAPPED_MAX        1000  // Protocol max value
#define JOY_FILTER_ALPHA      0.25f // EMA low-pass smoothing factor
#define JOY_EXPO_FACTOR       0.35f // Cubic exponential curve
#define JOY_CALIB_SAMPLES     100   // Boot auto-calibration sample count

//==================================================
// PUSH BUTTONS & TOGGLE SWITCHES
//==================================================
#define PIN_PUSH_1          12     // Physical Push Button 1
#define PIN_PUSH_2          13     // Physical Push Button 2
#define PIN_TOGGLE_1        27     // Toggle Switch 1
#define PIN_TOGGLE_2        14     // Toggle Switch 2

#define BUTTON_DEBOUNCE_MS  25     // Software debounce threshold
#define INVERT_PUSH_BUTTONS true   // Inverted factory hardware push buttons
#define INVERT_TOGGLE_SWITCHES false// Standard Active-LOW (INPUT_PULLUP: GND = ON)

//==================================================
// AUDIO BUZZER
//==================================================
#define PIN_BUZZER          4      // GPIO4 for Active Buzzer
#define INVERT_BUZZER_LOGIC false  // Active HIGH (LOW = Silent, HIGH = Buzz)
#define BUZZER_DEFAULT_FREQ 2000

//==================================================
// BATTERY MONITORING (1S 18650 Li-ion on ADC1_CH0)
//==================================================
#define PIN_BATTERY_ADC     36     // SVP / ADC1_CH0
#define BATTERY_OVERSAMPLE  16     // 16x Hardware Oversampling
#define BATTERY_ADC_REF_V   3.3f   // ESP32 ADC Reference Voltage
#define BATTERY_DIVIDER_RATIO 5.0f // 5:1 Resistor Divider Ratio
#define BATTERY_CALIB_FACTOR 1.0398f// Precise calibration factor (3.77V -> 3.92V)
#define BATTERY_MAX_VOLTS   4.20f  // 100% Charge Threshold
#define BATTERY_MIN_VOLTS   3.60f  // 0% Empty Threshold
#define BATTERY_CRIT_VOLTS  3.40f  // Critical Alarm Threshold
#define BATTERY_HYSTERESIS_V 0.05f  // 50mV Hysteresis
#define BATTERY_FILTER_ALPHA 0.10f // Dual EMA filter alpha
#define BATTERY_SAMPLE_MS   100    // Battery read interval

//==================================================
// SERIAL DEBUGGING & SYSTEM SCHEDULER
//==================================================
#define SERIAL_BAUD_RATE    115200
#define DEBUG_PRINT_MS      500    // Serial output rate
#define COMMS_TX_RATE_MS    10     // ESP-NOW ultra-fast polling rate (100 Hz / 10ms)
#define LINK_TIMEOUT_MS     2000   // Disconnection detection timeout

// Target ESP32-S3 N16R8 Receiver MAC Address (Field Tested @ ~170m)
const uint8_t RECEIVER_MAC_ADDR[6] = {0x1C, 0xDB, 0xD4, 0x4B, 0x08, 0x40};

#endif // CONFIG_H


