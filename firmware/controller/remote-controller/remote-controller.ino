/**
 * ============================================================================
 * PROJECT   : CYBERROVER X REMOTE CONTROLLER FIRMWARE
 * MCU       : ESP32 DevKit V1 (38 Pin, ESP32 D0WD V3)
 * FRAMEWORK : Arduino / C++17 (ESP-IDF Core)
 * DISPLAY   : SSD1306 OLED (128x64 I2C: SDA=21, SCL=22 @ 400kHz Fast I2C)
 * AUTHOR    : Senior Embedded Systems Firmware Team
 * VERSION   : v4.2.0-COMMERCIAL_BOOT (600ms Commercial Boot Animation & Fast Telemetry)
 * ============================================================================
 */

#include <Arduino.h>
#include "Config.h"
#include "Types.h"
#include "BatteryManager.h"
#include "JoystickManager.h"
#include "InputManager.h"
#include "SoundManager.h"
#include "BootAnimation.h"
#include "DisplayManager.h"
#include "CommsManager.h"

//==================================================
// GLOBAL SUBSYSTEM INSTANCES
//==================================================
BatteryManager   batteryMgr;
JoystickManager  joystickMgr;
InputManager     inputMgr;
SoundManager     soundMgr;
DisplayManager   displayMgr;
CommsManager     commsMgr;

// System state & performance tracking
SystemState   g_systemState = STATE_BOOT_ANIMATION;

uint32_t g_lastDebugPrintMs = 0;
uint32_t g_lastCommsTxMs = 0;
uint32_t g_loopCounter = 0;
uint32_t g_loopTimeUs = 0;

// Dual-Core FreeRTOS Task Handle
TaskHandle_t g_displayTaskHandle = NULL;

// Control State Flags
volatile uint8_t g_activeRoverMode = MODE_MANUAL;
volatile bool    g_cyberOsActive   = false;

// Multi-core thread-safe latched triggers for Cyber OS
volatile bool    s_osJrTriggered   = false;
volatile bool    s_osJlTriggered   = false;
volatile bool    s_osP1Triggered   = false;

// Function Prototypes
void startupAnimation();
void performCalibration();
void hardwareCheck();
void readBattery();
void readButtons();
void readJoysticks();
void updateOLED();
void updateBuzzer();
void printDebug();
void future_sendESPNow();

// Fast buzzer callback for boot animation (silenced on remote)
void bootBuzzerTick(uint16_t freq, uint16_t durationMs) {
    (void)freq;
    (void)durationMs;
}

//==================================================
// DUAL-CORE FREERTOS ASYNC DISPLAY TASK (CORE 0)
//==================================================
void displayWorkerTask(void *pvParameters) {
    TickType_t xLastWakeTime = xTaskGetTickCount();
    const TickType_t xFrequency = pdMS_TO_TICKS(1000 / OLED_REFRESH_HZ); // 30-40 Hz OLED render rate

    for (;;) {
        updateOLED();
        vTaskDelayUntil(&xLastWakeTime, xFrequency);
    }
}

//==================================================
// SETUP ROUTINE (CORE 1)
//==================================================
void setup() {
    // 1. Immediately Silence Active Buzzer on Power-On
    soundMgr.begin();

    // 2. Initialize High-Speed Serial Monitor for Telemetry Diagnostics
    Serial.begin(SERIAL_BAUD_RATE);
    while (!Serial && millis() < 200);

    Serial.println();
    Serial.println(F("===================================================="));
    Serial.print(F("          ")); Serial.print(FW_NAME); Serial.print(F(" - ")); Serial.println(FW_ROLE);
    Serial.print(F("          FIRMWARE VERSION: ")); Serial.println(FW_VERSION);
    Serial.print(F("          BUILD DATE: ")); Serial.println(FW_BUILD_DATE);
    Serial.println(F("===================================================="));

    // 3. Initialize Hardware Subsystems & Drivers
    inputMgr.begin();
    joystickMgr.begin();
    batteryMgr.begin();
    commsMgr.begin();

    // 4. Initialize OLED Display Manager & Load Saved Flash NVS Preferences
    if (!displayMgr.begin()) {
        Serial.println(F("[ERROR] OLED Display (SSD1306) failed to initialize!"));
        soundMgr.playError();
    } else {
        displayMgr.getPhoneOS().begin(joystickMgr, batteryMgr);
        Serial.println(F("[OK] OLED Display initialized @ 400kHz Fast I2C (SDA:21, SCL:22)"));
    }

    // 5. Single Clean Startup Boot Animation with Progress Bar
    startupAnimation();

    // 6. Fast Silent Zeroing & Center Calibration
    joystickMgr.autoCalibrate();

    // 7. Launch FreeRTOS Display Task on Core 0 (Decouples I2C transfer from 100Hz radio loop on Core 1)
    xTaskCreatePinnedToCore(
        displayWorkerTask,
        "DisplayWorker",
        4096,
        NULL,
        1,
        &g_displayTaskHandle,
        0 // Pinned to Core 0
    );

    // 8. Transition System State Directly to Active Driving HUD
    g_systemState = STATE_ACTIVE;
    
    Serial.println(F("===================================================="));
    Serial.println(F(" CYBERROVER X REMOTE ONLINE - 100 HZ SCHEDULER READY"));
    Serial.println(F("===================================================="));
}

//==================================================
// MAIN NON-BLOCKING 100 HZ SCHEDULER LOOP (CORE 1)
//==================================================
void loop() {
    uint32_t startUs = micros();
    uint32_t now = millis();

    // 1. Read All Hardware Inputs & Sensors (Fast ADC / Digital reads on Core 1)
    readBattery();
    readButtons();
    readJoysticks();

    // Check if Cyber OS requested exit via JL (Back button on Launcher)
    if (displayMgr.getPhoneOS().hasRequestedExit()) {
        displayMgr.getPhoneOS().clearRequestedExit();
        g_cyberOsActive = false;
        displayMgr.getPhoneOS().saveSettings(joystickMgr, batteryMgr);
    }

    // -------------------------------------------------------------
    // COMBO 1: Toggle Switch 1 (T1) -> Master Switch for Cyber OS
    // -------------------------------------------------------------
    bool t1OsActive = inputMgr.isToggle1Active();
    if (t1OsActive != g_cyberOsActive) {
        g_cyberOsActive = t1OsActive;
        if (!g_cyberOsActive) {
            // Flipped DOWN -> Exit Cyber OS & Save all settings to Flash NVS!
            displayMgr.getPhoneOS().saveSettings(joystickMgr, batteryMgr);
        }
    }

    // -------------------------------------------------------------
    // COMBO 2: Toggle Switch 2 (T2) -> Master Parking Mode (Zero Motors)
    // -------------------------------------------------------------
    bool t2ParkActive = inputMgr.isToggle2Active();
    uint8_t effectiveRoverMode = t2ParkActive ? MODE_PARK : g_activeRoverMode;

    // -------------------------------------------------------------
    // COMBO 3: Push Button 2 (P2) -> Toggle Manual (MN) vs Auto Mode
    // -------------------------------------------------------------
    if (!g_cyberOsActive && inputMgr.isPush2JustPressed()) {
        if (g_activeRoverMode == MODE_MANUAL) {
            g_activeRoverMode = MODE_AUTO;
        } else {
            g_activeRoverMode = MODE_MANUAL;
        }
        Serial.printf("[ROVER MODE] Switched to: %s\n", g_activeRoverMode == MODE_AUTO ? "AUTO" : "MANUAL");
    }

    // -------------------------------------------------------------
    // COMBO 4: Button JL (Left Stick Click) -> Re-calibrate Joysticks
    // -------------------------------------------------------------
    if (!g_cyberOsActive && joystickMgr.isLeftSwitchJustPressed()) {
        performCalibration();
    }

    // -------------------------------------------------------------
    // COMBO 5: Button JR (Right Stick Click) -> Re-initialize OLED Display
    //          (Instant recovery without blocking if wiring is loose)
    // -------------------------------------------------------------
    if (!g_cyberOsActive && joystickMgr.isRightSwitchJustPressed()) {
        displayMgr.forceReinitOLED();
        Serial.println(F("[OLED] Re-initialized SSD1306 Display on JR click!"));
    }

    // Capture OS navigation triggers reliably on Core 1 when Cyber OS is active
    if (g_cyberOsActive) {
        if (joystickMgr.isRightSwitchJustPressed()) s_osJrTriggered = true;
        if (joystickMgr.isLeftSwitchJustPressed())  s_osJlTriggered = true;
        if (inputMgr.isPush1JustPressed())         s_osP1Triggered = true;
    }

    // Synchronize NVS sound mute setting
    soundMgr.setMuted(displayMgr.getPhoneOS().isSoundMuted());

    // 2. High-Speed 100 Hz Transmission Engine (ESP-NOW)
    if (now - g_lastCommsTxMs >= COMMS_TX_RATE_MS) {
        g_lastCommsTxMs = now;

        if (g_cyberOsActive) {
            // Cyber OS Safety Isolation: Vehicle motors are locked / zeroed
            g_systemState = STATE_PHONE_OS;
            
            // Check if Cyber OS is actively sending sound/payload triggers
            if (displayMgr.getPhoneOS().hasOutboundSoundTrigger()) {
                uint8_t soundId = displayMgr.getPhoneOS().consumeOutboundSoundTrigger();
                commsMgr.preparePacket(
                    0, 0, 0, (int8_t)soundId,
                    BTN_BIT_PUSH1, // Trigger Uno Siren Engine
                    effectiveRoverMode,
                    batteryMgr.getPercentage()
                );
            } else {
                commsMgr.preparePacket(
                    0, 0, 0, 0,
                    0,
                    effectiveRoverMode,
                    batteryMgr.getPercentage()
                );
            }
            future_sendESPNow();
        } else {
            // Normal High-Speed 100 Hz Rover Driving Mode
            g_systemState = STATE_ACTIVE;

            // Apply Drive Mode (0=ECO 50%, 1=SPORT 100%, 2=NORMAL 75%)
            int16_t rawY = joystickMgr.getLeftY(); // Full int16_t -1000..+1000 range!
            uint8_t dMode = displayMgr.getPhoneOS().getDriveMode();
            int16_t scaledY = (dMode == 0) ? (rawY * 50 / 100) : ((dMode == 2) ? (rawY * 75 / 100) : rawY);

            // Pass active selected Horn Sound Code when Push Button 1 is pressed
            int16_t rY = inputMgr.isPush1Pressed() ? ((int16_t)displayMgr.getPhoneOS().getHornSoundCode() * 10) : joystickMgr.getRightY();

            commsMgr.preparePacket(
                joystickMgr.getLeftX(),
                scaledY,
                joystickMgr.getRightX(),
                rY,
                inputMgr.getButtonsMask(joystickMgr.isLeftSwitchPressed(), joystickMgr.isRightSwitchPressed()),
                effectiveRoverMode,
                batteryMgr.getPercentage()
            );
            future_sendESPNow();
        }
    }

    // 3. Safety Alarms & Buzzer
    updateBuzzer();

    // 4. Output Serial Telemetry Diagnostics (at low 500ms rate)
    printDebug();

    // Calculate Execution Performance
    g_loopCounter++;
    g_loopTimeUs = micros() - startUs;
}

//==================================================
// REQUIRED SPECIFICATION FUNCTIONS
//==================================================

void startupAnimation() {
    displayMgr.renderStartupAnimation(bootBuzzerTick);
}

void hardwareCheck() {
    g_systemState = STATE_HARDWARE_CHECK;

    // Rapid step test sequence
    displayMgr.renderHardwareCheckStep("SSD1306 OLED", true, 1, 4);
    displayMgr.renderHardwareCheckStep("Joysticks (ADC1)", true, 2, 4);
    displayMgr.renderHardwareCheckStep("Digital Buttons", true, 3, 4);

    batteryMgr.update(true);
    bool batOk = (batteryMgr.getVoltage() > 2.5f);
    displayMgr.renderHardwareCheckStep("Battery Sensor", batOk, 4, 4);
}

void readBattery() {
    batteryMgr.update(false);
}

void readButtons() {
    inputMgr.update();
}

void readJoysticks() {
    joystickMgr.update();
}

void updateOLED() {
    if (g_systemState == STATE_CALIBRATING) {
        return; // Handled directly inside performCalibration()
    } else if (g_cyberOsActive) {
        g_systemState = STATE_PHONE_OS;
        // Reliably read and consume Core-1 latched button triggers
        bool osJr = s_osJrTriggered; s_osJrTriggered = false;
        bool osJl = s_osJlTriggered; s_osJlTriggered = false;
        bool osP1 = s_osP1Triggered; s_osP1Triggered = false;

        // Inside OS: JR = Enter/Select, JL = Back/Escape, Joysticks = Scroll, P1 = Special Action
        displayMgr.renderPhoneOS(
            joystickMgr,
            batteryMgr,
            joystickMgr.getLeftX(),
            joystickMgr.getLeftY(),
            joystickMgr.getRightX(),
            joystickMgr.getRightY(),
            osJr,
            osJl,
            osP1
        );
    } else {
        g_systemState = STATE_ACTIVE;
        bool t2ParkActive = inputMgr.isToggle2Active();
        uint8_t effectiveRoverMode = t2ParkActive ? MODE_PARK : g_activeRoverMode;

        displayMgr.renderHUD(
            joystickMgr.getLeftX(),
            joystickMgr.getLeftY(),
            joystickMgr.getRightX(),
            joystickMgr.getRightY(),
            inputMgr.getButtonsMask(joystickMgr.isLeftSwitchPressed(), joystickMgr.isRightSwitchPressed()),
            effectiveRoverMode,
            batteryMgr.getVoltage(),
            batteryMgr.getPercentage(),
            commsMgr.getLinkState(),
            commsMgr.getRSSI(),
            commsMgr.getDistLeft(),
            commsMgr.getDistCenter(),
            commsMgr.getDistRight()
        );
    }
}

void performCalibration() {
    g_systemState = STATE_CALIBRATING;
    displayMgr.renderCalibrationScreen(10);
    delay(100);
    displayMgr.renderCalibrationScreen(50);
    joystickMgr.autoCalibrate();
    displayMgr.renderCalibrationScreen(100);
    g_systemState = STATE_ACTIVE;
    Serial.println(F("[JOYSTICK] Center calibration completed!"));
}

void updateBuzzer() {
    soundMgr.update();
    
    // Critical Low Battery Alarm (Triggered once per 5 seconds)
    static uint32_t s_lastBatAlarmMs = 0;
    if (batteryMgr.isCritical() && (millis() - s_lastBatAlarmMs > 5000)) {
        s_lastBatAlarmMs = millis();
        soundMgr.playError();
    }
}

void printDebug() {
    uint32_t now = millis();
    if (now - g_lastDebugPrintMs >= DEBUG_PRINT_MS) {
        g_lastDebugPrintMs = now;

        const char* modeStr = "MANUAL";
        if (inputMgr.isToggle2Active()) modeStr = "PARK";
        else if (g_activeRoverMode == MODE_AUTO) modeStr = "AUTO";

        Serial.printf(
            "[TX %05u] MODE:%-6s %s | LX:%+04d LY:%+04d | RX:%+04d RY:%+04d | BAT:%.2fV (%02.0f%%) | LINK:%s (%ddBm) | RADAR:[%d,%d,%d] | %uus\n",
            commsMgr.getTxCount(),
            modeStr,
            g_cyberOsActive ? "[OS:ON]" : "[OS:OFF]",
            joystickMgr.getLeftX() / 10,
            joystickMgr.getLeftY() / 10,
            joystickMgr.getRightX() / 10,
            joystickMgr.getRightY() / 10,
            batteryMgr.getVoltage(),
            batteryMgr.getPercentage(),
            commsMgr.getLinkState() == LINK_CONNECTED ? "OK" : "LOST",
            commsMgr.getRSSI(),
            commsMgr.getDistLeft(),
            commsMgr.getDistCenter(),
            commsMgr.getDistRight(),
            g_loopTimeUs
        );
    }
}

// 100 Hz Async ESP-NOW Transmission Call
void future_sendESPNow() {
    commsMgr.updateTx();
}