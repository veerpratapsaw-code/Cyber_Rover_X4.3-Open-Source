/**
 * ============================================================================
 * @file Types.h
 * @brief Data structures, protocol packets, bitfield definitions, 
 *        and state enumerations for CYBERROVER X REMOTE.
 * ============================================================================
 */

#ifndef TYPES_H
#define TYPES_H

#include <Arduino.h>

//==================================================
// SYSTEM OPERATIONAL STATES
//==================================================
enum SystemState : uint8_t {
    STATE_BOOT_ANIMATION = 0,
    STATE_HARDWARE_CHECK,
    STATE_CALIBRATING,
    STATE_ACTIVE,
    STATE_PHONE_OS,
    STATE_LOW_BATTERY,
    STATE_EMERGENCY_STOP,
    STATE_SETTINGS_MENU
};

//==================================================
// BATTERY STATUS STATES
//==================================================
enum BatteryHealth : uint8_t {
    BATTERY_OK = 0,
    BATTERY_LOW_WARNING,
    BATTERY_CRITICAL_WARNING
};

//==================================================
// COMMS LINK STATES
//==================================================
enum ConnectionState : uint8_t {
    LINK_DISCONNECTED = 0,
    LINK_CONNECTING,
    LINK_CONNECTED,
    LINK_FAILED
};

//==================================================
// CONTROL MODES
//==================================================
enum OperatingMode : uint8_t {
    MODE_ROVER = 0,
    MODE_MANUAL_DRIVE = MODE_ROVER,
    MODE_SPORT_BOOST = 1,
    MODE_SERVO_CAMERA = 2,
    MODE_PID_TUNING = 3,
    MODE_AUTONOMOUS = 4,
    MODE_CALIBRATION = 5
};


//==================================================
// ULTRA-COMPACT 9-BYTE PROTOCOL DEFINITIONS
//==================================================
#include "CyberProtocol.h"

//==================================================
// JOYSTICK AXIS STATE
//==================================================
struct JoystickAxis {
    int   rawValue;          // Current raw ADC reading (0..4095)
    float smoothedValue;     // EMA low-pass filtered value
    int   centerOffset;      // Calibrated center value
    int   deadzone;          // Active deadzone window
    int   mappedValue;       // Scaled & Expo output (-1000..1000)
    bool  isCentered;        // Center flag indicator
};

struct JoystickPair {
    JoystickAxis xAxis;
    JoystickAxis yAxis;
    bool switchPressed;
    bool switchJustPressed;
    bool switchJustReleased;
};

//==================================================
// DIGITAL BUTTON STATE
//==================================================
struct InputButton {
    uint8_t  pin;
    bool     rawState;          // Raw input read
    bool     debouncedState;    // Debounced active state (true = pressed)
    bool     lastDebouncedState;// State on previous iteration
    bool     justPressed;       // Single pulse on press edge
    bool     justReleased;      // Single pulse on release edge
    uint32_t lastDebounceMs;    // Timestamp for debounce timer
    uint32_t pressStartMs;      // Press start timing
};

//==================================================
// BATTERY STATE
//==================================================
struct BatteryState {
    int           rawAdc;
    float         smoothedAdc;
    float         voltage;
    float         percentage;
    BatteryHealth health;
    bool          lowBatteryAlert;
    bool          criticalBatteryAlert;
    uint32_t      lastReadMs;
};

//==================================================
// SYSTEM PERFORMANCE & DIAGNOSTIC STATS
//==================================================
struct SystemStats {
    uint32_t        loopCounter;
    uint32_t        currentLoopTimeUs;
    uint32_t        maxLoopTimeUs;
    uint32_t        avgLoopTimeUs;
    uint32_t        freeHeapBytes;
    uint32_t        minFreeHeapBytes;
    uint32_t        txPacketCounter;
    uint32_t        rxPacketCounter;
    uint32_t        txFailCounter;
    int8_t          rssi;
    ConnectionState linkState;
    uint32_t        lastRxTimestampMs;
};

#endif // TYPES_H
