/**
 * ============================================================================
 * PROJECT   : CYBERROVER X - CENTRAL PROTOCOL DEFINITION
 * FILE      : CyberProtocol.h
 * PURPOSE   : Authoritative packet structure, framing constants, CRC8 algorithm,
 *             and button masks shared across all subsystems.
 * ============================================================================
 */

#ifndef CYBER_PROTOCOL_H
#define CYBER_PROTOCOL_H

#include <stdint.h>
#include <stddef.h>

// UART Synchronization Frame Header
#define UART_SYNC_BYTE_1       0xAA
#define UART_SYNC_BYTE_2       0x55
#define UART_BAUD_S3_TO_UNO    38400

// Target ESP32-S3 Receiver MAC Address
#define S3_RECEIVER_MAC        {0x1C, 0xDB, 0xD4, 0x4B, 0x08, 0x40}

// Operating Modes
#define MODE_MANUAL            0  // 100% Direct Remote Joystick Control
#define MODE_AUTO              2  // Full Autonomous Self-Driving Obstacle Avoidance
#define MODE_PARK              3  // Autonomous Self-Parking at wall edge & low-power hold

// Digital Button Bitmasks
#define BTN_BIT_PUSH1          (1 << 0)  // Physical Push Button 1
#define BTN_BIT_PUSH2          (1 << 1)  // Physical Push Button 2
#define BTN_BIT_TOGGLE1        (1 << 2)  // Toggle Switch 1 (Armed / Parking Mode)
#define BTN_BIT_TOGGLE2        (1 << 3)  // Toggle Switch 2 (Mute / Sound)
#define BTN_BIT_JOY_L_SW       (1 << 4)  // Left Joystick Switch (Re-calibrate)
#define BTN_BIT_JOY_R_SW       (1 << 5)  // Right Joystick Switch (Emergency Stop / Brake)

// ==========================================================================
// ULTRA-COMPACT 9-BYTE PACKED BINARY PACKET
// ==========================================================================

#pragma pack(push, 1)

struct CyberPacket {
    uint8_t seq;          // Rolling packet counter (0..255)
    int8_t  leftX;        // -100 .. +100
    int8_t  leftY;        // -100 .. +100 (Throttle: Forward > 0, Reverse < 0)
    int8_t  rightX;       // -100 .. +100 (Steering: Right > 0, Left < 0)
    int8_t  rightY;       // -100 .. +100
    uint8_t buttons;      // Packed buttons bitmask (Bits 0..5)
    uint8_t mode;         // Operating Mode (0=MANUAL, 2=AUTO, 3=PARK)
    uint8_t batPct;       // Transmitter Battery (0..100%)
    uint8_t crc8;         // Fast CRC-8 Checksum
};

// Lightweight Telemetry Reply (Rover -> Remote, 8 Bytes)
struct TelemetryPacket {
    uint8_t seq;          // Sequence counter
    int8_t  rssi;         // Signal RSSI in dBm
    uint8_t roverBatPct;  // Rover Battery %
    uint8_t modeAck;      // Current Active Mode acknowledged by rover
    uint8_t distLeft;     // Ultrasonic Left distance (cm)
    uint8_t distCenter;   // Ultrasonic Center distance (cm)
    uint8_t distRight;    // Ultrasonic Right distance (cm)
    uint8_t crc8;         // Checksum
};

#pragma pack(pop)

// Fast CRC-8 Algorithm (Polynomial: 0x07 / CCITT)
inline uint8_t computeCRC8(const uint8_t *data, size_t len) {
    uint8_t crc = 0x00;
    for (size_t i = 0; i < len; i++) {
        crc ^= data[i];
        for (uint8_t j = 0; j < 8; j++) {
            if (crc & 0x80) {
                crc = (crc << 1) ^ 0x07;
            } else {
                crc <<= 1;
            }
        }
    }
    return crc;
}

#endif // CYBER_PROTOCOL_H
