/**
 * ============================================================================
 * PROJECT   : CYBERROVER X4.3 — LAYER 2 ENVIRONMENTAL & TELEMETRY NODE
 * FILE      : Config.h
 * MCU       : Arduino Nano (ATmega328P / 5V / 16MHz)
 * PURPOSE   : Hardware pin mappings, communication rates, calibration metrics,
 *             gas safety thresholds, OLED parameters, and non-blocking timers.
 * ============================================================================
 */

#ifndef CONFIG_H
#define CONFIG_H

#include <Arduino.h>

// ============================================================================
// HARDWARE PIN DEFINITIONS
// ============================================================================

// Analog Inputs
const uint8_t PIN_MQ4       = A0;  // MQ-4 Methane (CH4) / Natural Gas analog output
const uint8_t PIN_MQ7       = A1;  // MQ-7 Carbon Monoxide (CO) analog output
const uint8_t PIN_MQ135     = A2;  // MQ-135 Air Quality / NH3 / Benzene analog output
const uint8_t PIN_BATTERY   = A3;  // 0-25V Voltage Divider Module signal (S/OUT)

// I2C Shared Bus (BMP280 Barometer + 1.3" I2C OLED Display)
const uint8_t PIN_I2C_SDA   = A4;  // Shared I2C Data
const uint8_t PIN_I2C_SCL   = A5;  // Shared I2C Clock

// Digital I/O
const uint8_t PIN_LORA_RX   = 0;   // Nano D0 (Hardware RX <- RYLR998 TXD)
const uint8_t PIN_LORA_TX   = 1;   // Nano D1 (Hardware TX -> 5V to 3.3V Divider -> RYLR998 RXD)
const uint8_t PIN_GPS_RX    = 2;   // Nano D2 (SoftwareSerial RX <- NEO-6M TXD)
const uint8_t PIN_GPS_TX    = 3;   // Nano D3 (SoftwareSerial TX -> Unused / Not connected)
const uint8_t PIN_DHT_DATA  = 4;   // Nano D4 (Single-wire digital bus for DHT11)

// ============================================================================
// COMMUNICATION CONSTANTS & BAUD RATES
// ============================================================================

// Hardware Serial (Pins D0/D1): 115200 baud for Serial Monitor & LoRa
const unsigned long SERIAL_BAUD_RATE = 115200;

// SoftwareSerial (Pin D2): Used by u-blox NEO-6M GPS receiver
const unsigned long GPS_BAUD_RATE    = 9600;

// Set to true when RYLR998 LoRa is wired to D0/D1 (disables USB Serial Monitor dashboard)
// Set to false to disconnect LoRa jumper on D0 and use Serial Monitor for debugging
#define ENABLE_LORA_TRANSMISSION     true

// LoRa Destination Address (0 = broadcast to all receivers)
#define LORA_TARGET_ADDRESS          0

// ============================================================================
// BATTERY VOLTAGE SENSOR CALIBRATION (3S Li-ion / LiPo)
// ============================================================================

// Standard 0-25V blue voltage sensor module divider ratio (30k + 7.5k) / 7.5k = 5.0
const float VOLTAGE_DIVIDER_RATIO   = 5.0f;

// Nano ATmega328P standard analog reference voltage (nominally 5.00V)
const float ADC_REFERENCE_VOLTAGE   = 5.00f;

// CALIBRATED TRIM FACTOR:
// When actual battery was 11.7V, uncalibrated read ~14.2V.
// Trim = 11.7V / 14.2V = 0.824f
const float BATTERY_CALIBRATION_TRIM = 0.852f;

// 3S Pack Voltage Envelope (3 cells x 3.2V - 4.2V)
const float BATTERY_FULL_VOLTAGE    = 12.60f; // 100% (4.20V / cell)
const float BATTERY_NOM_VOLTAGE     = 11.10f; //  50% (3.70V / cell)
const float BATTERY_WARN_VOLTAGE    = 10.50f; //  15% (3.50V / cell)
const float BATTERY_CRIT_VOLTAGE    =  9.60f; //   0% (3.20V / cell - cutoff threshold)

// ============================================================================
// SENSOR SAFETY THRESHOLDS (10-BIT ADC: 0 .. 1023)
// ============================================================================

const uint16_t MQ4_ALERT_THRESHOLD   = 650; // Elevated methane / combustible gas
const uint16_t MQ7_ALERT_THRESHOLD   = 750; // Elevated carbon monoxide
const uint16_t MQ135_ALERT_THRESHOLD = 600; // Degraded air quality / high VOC

// ============================================================================
// OLED DISPLAY HARDWARE CONFIGURATION
// ============================================================================

#define OLED_I2C_ADDRESS     0x3C   // Default I2C address
#define OLED_IS_SH1106       false  // Set to false for SSD1306 (eliminates phantom vertical line at right/left)
#define OLED_FLIP_180        true   // Set to true to rotate display 180 degrees to match rover chassis mounting

// Multi-Screen Display Timing: Display each page for minimum 10 seconds before changing
const unsigned long OLED_PAGE_INTERVAL_MS = 10000; // 10.0 seconds per screen

// ============================================================================
// SYSTEM TIMING CONSTANTS (NON-BLOCKING)
// ============================================================================

const unsigned long SENSOR_READ_INTERVAL_MS      = 500;  // Sample sensors at 2 Hz
const unsigned long OLED_REDRAW_INTERVAL_MS      = 250;  // Refresh OLED HUD at 4 Hz
const unsigned long SERIAL_CONSOLE_INTERVAL_MS   = 2000; // Print detailed serial console every 2.0 sec
const unsigned long LORA_TRANSMIT_INTERVAL_MS    = 2000; // Transmit LoRa telemetry every 2.0 sec

#endif // CONFIG_H
