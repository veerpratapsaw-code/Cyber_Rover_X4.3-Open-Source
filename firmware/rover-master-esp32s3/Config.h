/**
 * ============================================================================
 * PROJECT   : CYBERROVER X — NODE 02: ROVER MASTER (ESP32-S3)
 * FILE      : Config.h
 * PURPOSE   : Hardware pin mapping & serial baud configurations
 * MCU       : ESP32-S3 (N16R8 / DevModule)
 * ============================================================================
 */

#ifndef S3_CONFIG_H
#define S3_CONFIG_H

#include <Arduino.h>
#include "CyberProtocol.h"

// Hardware Pin Definitions
#define RGB_PIN              48     // Built-in WS2812 RGB LED (ESP32-S3 DevModule)
#define NUMPIXELS            1
#define USB_SERIAL_BAUD      115200 // PC USB Serial Monitor

// UART1 -> Arduino Uno Motor & Sound Controller (One-Way: S3 -> Uno)
#define UNO_TX_PIN           17     // ESP32-S3 TX -> Arduino Uno RX (Pin D2)
#define UNO_RX_PIN           -1     // Unused (One-way TX only: S3 sends commands to Uno)
#define UNO_UART_BAUD        UART_BAUD_S3_TO_UNO  // 38400 baud

#endif // S3_CONFIG_H
