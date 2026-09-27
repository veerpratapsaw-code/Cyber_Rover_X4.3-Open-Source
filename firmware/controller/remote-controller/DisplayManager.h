/**
 * ============================================================================
 * @file DisplayManager.h
 * @brief SSD1306 128x64 OLED graphics engine featuring:
 *        - Mode 0: MANUAL HUD (Throttle & Steering Bars, Big Speed & Torque)
 *        - Mode 1: SEMI-AUTONOMOUS HUD (Dual Crosshairs, 3-Zone Ultrasonic Radar)
 *        - Mode 2: AUTONOMOUS COCKPIT HUD (Left/Right Motor Meters, Top-down Rover Radar)
 *        - Dynamic 4-Bar Signal Antenna Icon (% Quality)
 *        - Action Badges: [ Aggressive ], [ Mute ], [ Park ]
 *        - I2C Auto-Recovery & 30 FPS Capped Rendering
 * ============================================================================
 */

#ifndef DISPLAY_MANAGER_H
#define DISPLAY_MANAGER_H

#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include "Config.h"
#include "Types.h"
#include "BootAnimation.h"
#include "PhoneOSManager.h"
#include "CyberProtocol.h"

class DisplayManager {
private:
    Adafruit_SSD1306 display;
    PhoneOSManager phoneOS;
    bool displayReady;
    uint32_t lastRenderMs;
    uint32_t lastStateHash;
    uint32_t lastI2cCheckMs;

    /**
     * @brief Computes 32-bit FNV-1a hash of HUD telemetry parameters to avoid redundant redraws.
     */
    uint32_t computeStateHash(int16_t lx, int16_t ly, int16_t rx, int16_t ry,
                              uint8_t buttonsMask, uint8_t mode, float batVolts,
                              ConnectionState connState, uint8_t dL, uint8_t dC, uint8_t dR) {
        uint32_t hash = 2166136261u;
        auto addVal = [&hash](uint32_t val) {
            hash ^= val;
            hash *= 16777619u;
        };

        addVal((uint16_t)lx);
        addVal((uint16_t)ly);
        addVal((uint16_t)rx);
        addVal((uint16_t)ry);
        addVal(buttonsMask);
        addVal(mode);
        addVal((uint32_t)(batVolts * 100.0f));
        addVal((uint8_t)connState);
        addVal(dL);
        addVal(dC);
        addVal(dR);

        return hash;
    }

    /**
     * @brief Draws dynamic 4-bar cellular/signal antenna icon (0-100%).
     */
    void drawSignalAntenna(int x, int y, uint8_t pct) {
        // Base baseline bar
        display.drawFastVLine(x,     y + 7, 2, SSD1306_WHITE);
        display.drawFastVLine(x + 1, y + 7, 2, SSD1306_WHITE);

        if (pct >= 25) {
            display.drawFastVLine(x + 3, y + 5, 4, SSD1306_WHITE);
            display.drawFastVLine(x + 4, y + 5, 4, SSD1306_WHITE);
        }
        if (pct >= 50) {
            display.drawFastVLine(x + 6, y + 3, 6, SSD1306_WHITE);
            display.drawFastVLine(x + 7, y + 3, 6, SSD1306_WHITE);
        }
        if (pct >= 75) {
            display.drawFastVLine(x + 9,  y + 1, 8, SSD1306_WHITE);
            display.drawFastVLine(x + 10, y + 1, 8, SSD1306_WHITE);
        }
    }

    /**
     * @brief Draws battery icon with internal level fill bar.
     */
    void drawBatteryIcon(int x, int y, float pct) {
        display.drawRect(x, y, 14, 8, SSD1306_WHITE);
        display.fillRect(x + 14, y + 2, 2, 4, SSD1306_WHITE);

        int fillW = 0;
        if (pct > 0.0f) {
            fillW = (int)((pct / 100.0f) * 10.0f);
            if (fillW > 10) fillW = 10;
            if (fillW < 1) fillW = 1;
        }
        display.fillRect(x + 2, y + 2, fillW, 4, SSD1306_WHITE);
    }

    /**
     * @brief Draws a vertical segmented gauge meter (for Throttle, Steering, Motor power).
     */
    void drawVerticalGauge(int x, int y, int w, int h, int value, int minVal, int maxVal, const char* label = "") {
        int boxY = y;
        int boxH = h;

        // Render label only if non-empty
        if (label != NULL && label[0] != '\0') {
            display.setTextSize(1);
            display.setTextColor(SSD1306_WHITE);
            display.setCursor(x - 2, y);
            display.print(label);
            boxY = y + 9;
            boxH = h - 9;
        }

        display.drawRect(x + 2, boxY, w - 4, boxH, SSD1306_WHITE);

        // Tick marks
        display.drawFastHLine(x + w, boxY, 2, SSD1306_WHITE);           // 100
        display.drawFastHLine(x + w, boxY + (boxH / 2), 2, SSD1306_WHITE); // 0
        display.drawFastHLine(x + w, boxY + boxH - 1, 2, SSD1306_WHITE);   // -100

        // Fill Bar
        if (minVal < 0) {
            // Bidirectional bar (centered at 0)
            int midY = boxY + (boxH / 2);
            if (value > 0) {
                int barH = map(value, 0, maxVal, 0, boxH / 2 - 2);
                barH = constrain(barH, 0, boxH / 2 - 2);
                display.fillRect(x + 4, midY - barH, w - 8, barH, SSD1306_WHITE);
            } else if (value < 0) {
                int barH = map(abs(value), 0, abs(minVal), 0, boxH / 2 - 2);
                barH = constrain(barH, 0, boxH / 2 - 2);
                display.fillRect(x + 4, midY, w - 8, barH, SSD1306_WHITE);
            }
        } else {
            // Unidirectional bar (0 to maxVal)
            int barH = map(value, 0, maxVal, 0, boxH - 4);
            barH = constrain(barH, 0, boxH - 4);
            display.fillRect(x + 4, boxY + boxH - 2 - barH, w - 8, barH, SSD1306_WHITE);
        }
    }

    /**
     * @brief Draws circular joystick crosshair target with active moving dot.
     */
    void drawJoystickCrosshair(int cx, int cy, int radius, int xVal, int yVal) {
        display.drawCircle(cx, cy, radius, SSD1306_WHITE);
        display.drawCircle(cx, cy, radius / 2, SSD1306_WHITE);
        display.drawFastHLine(cx - radius - 2, cy, (radius * 2) + 5, SSD1306_WHITE);
        display.drawFastVLine(cx, cy - radius - 2, (radius * 2) + 5, SSD1306_WHITE);

        // Active dot
        int dotX = cx + map(xVal, -100, 100, -radius + 2, radius - 2);
        int dotY = cy - map(yVal, -100, 100, -radius + 2, radius - 2);
        dotX = constrain(dotX, cx - radius + 2, cx + radius - 2);
        dotY = constrain(dotY, cy - radius + 2, cy + radius - 2);

        display.fillRect(dotX - 1, dotY - 1, 3, 3, SSD1306_WHITE);
    }

    /**
     * @brief Draws the 3-Zone Ultrasonic Radar Arc Graphic (Semi-Autonomous Mode: Clean Minimalist).
     */
    void draw3ZoneRadar(int cx, int cy, uint8_t dL, uint8_t dC, uint8_t dR) {
        // Concentric Radar Arcs
        display.drawCircle(cx, cy + 18, 30, SSD1306_WHITE);
        display.drawCircle(cx, cy + 18, 20, SSD1306_WHITE);
        display.drawCircle(cx, cy + 18, 10, SSD1306_WHITE);

        // Sector divider radial lines
        display.drawLine(cx, cy + 18, cx - 22, cy - 4, SSD1306_WHITE); // Left 45 deg
        display.drawLine(cx, cy + 18, cx, cy - 12, SSD1306_WHITE);     // Center 0 deg
        display.drawLine(cx, cy + 18, cx + 22, cy - 4, SSD1306_WHITE); // Right 45 deg

        // Clean numeric distance readouts directly inside/above sectors
        display.setTextSize(1);
        display.setTextColor(SSD1306_WHITE);

        // Left distance number
        display.setCursor(cx - 26, cy - 14);
        if (dL >= 250) display.print(F("--")); else display.print(dL);

        // Center distance number in clean pill badge
        display.drawRoundRect(cx - 12, cy - 16, 24, 10, 2, SSD1306_WHITE);
        display.setCursor(cx - 8, cy - 15);
        if (dC >= 250) display.print(F("--")); else display.print(dC);

        // Right distance number
        display.setCursor(cx + 12, cy - 14);
        if (dR >= 250) display.print(F("--")); else display.print(dR);
    }

    /**
     * @brief Draws top-down Rover Cockpit graphic with forward radar waves (Autonomous Mode: Clean Minimalist).
     */
    void drawRoverCockpit(int cx, int cy, uint8_t dL, uint8_t dC, uint8_t dR) {
        // Clean Distance numbers over forward sectors
        display.setTextSize(1);
        display.setTextColor(SSD1306_WHITE);
        
        // Left dist
        display.setCursor(cx - 28, cy - 14);
        if (dL >= 250) display.print(F("--")); else display.print(dL);

        // Front / Center dist in clean pill badge
        display.drawRoundRect(cx - 12, cy - 16, 24, 10, 2, SSD1306_WHITE);
        display.setCursor(cx - 8, cy - 15);
        if (dC >= 250) display.print(F("--")); else display.print(dC);

        // Right dist
        display.setCursor(cx + 14, cy - 14);
        if (dR >= 250) display.print(F("--")); else display.print(dR);

        // Forward Radar Wave Arcs
        display.drawCircle(cx, cy + 14, 22, SSD1306_WHITE);
        display.drawCircle(cx, cy + 14, 14, SSD1306_WHITE);

        // Miniature 4WD Rover Icon
        int rx = cx - 8;
        int ry = cy + 4;
        // Chassis Body
        display.drawRoundRect(rx + 3, ry + 2, 10, 15, 2, SSD1306_WHITE);
        display.drawFastHLine(rx + 4, ry + 5, 8, SSD1306_WHITE);
        // 4 Treaded Wheels
        display.fillRect(rx, ry, 3, 6, SSD1306_WHITE);          // Front-Left
        display.fillRect(rx + 13, ry, 3, 6, SSD1306_WHITE);     // Front-Right
        display.fillRect(rx, ry + 12, 3, 6, SSD1306_WHITE);     // Rear-Left
        display.fillRect(rx + 13, ry + 12, 3, 6, SSD1306_WHITE); // Rear-Right
    }

    /**
     * @brief Draws rounded bottom action pill badge.
     */
    void drawActionPill(int x, int y, int w, int h, const char* text, bool active) {
        if (active) {
            display.fillRoundRect(x, y, w, h, 3, SSD1306_WHITE);
            display.setTextColor(SSD1306_BLACK);
        } else {
            display.drawRoundRect(x, y, w, h, 3, SSD1306_WHITE);
            display.setTextColor(SSD1306_WHITE);
        }

        int textLen = strlen(text);
        int textX = x + ((w - (textLen * 6)) / 2);
        display.setTextSize(1);
        display.setCursor(textX, y + 2);
        display.print(text);
    }

public:
    DisplayManager() : display(OLED_SCREEN_WIDTH, OLED_SCREEN_HEIGHT, &Wire, -1), 
                       displayReady(false), lastRenderMs(0), lastStateHash(0), lastI2cCheckMs(0) {}

    bool begin() {
        Wire.begin(OLED_SDA, OLED_SCL);
        Wire.setClock(OLED_I2C_SPEED);

        if (!display.begin(SSD1306_SWITCHCAPVCC, OLED_I2C_ADDRESS)) {
            displayReady = false;
            return false;
        }

        displayReady = true;
        display.clearDisplay();
        display.setTextColor(SSD1306_WHITE);
        display.display();
        
        initBootAnimation(&display);
        return true;
    }

    void checkAndRecoverOLED() {
        uint32_t now = millis();
        if (now - lastI2cCheckMs < 1000) return;
        lastI2cCheckMs = now;

        Wire.beginTransmission(OLED_I2C_ADDRESS);
        uint8_t error = Wire.endTransmission();

        if (error != 0 || !displayReady) {
            Wire.begin(OLED_SDA, OLED_SCL);
            Wire.setClock(OLED_I2C_SPEED);
            displayReady = display.begin(SSD1306_SWITCHCAPVCC, OLED_I2C_ADDRESS);
            if (displayReady) {
                lastStateHash = 0;
            }
        }
    }

    /**
     * @brief Force instant re-initialization of SSD1306 OLED without delay (called by JR click)
     */
    void forceReinitOLED() {
        Wire.begin(OLED_SDA, OLED_SCL);
        Wire.setClock(OLED_I2C_SPEED);
        displayReady = display.begin(SSD1306_SWITCHCAPVCC, OLED_I2C_ADDRESS);
        if (displayReady) {
            display.clearDisplay();
            display.setTextColor(SSD1306_WHITE);
            display.display();
            lastStateHash = 0;
            lastI2cCheckMs = millis();
        }
    }

    void renderStartupAnimation(void (*buzzerTick)(uint16_t freq, uint16_t dur) = NULL) {
        if (!displayReady) return;
        if (buzzerTick) buzzerTick(1800, 40);
        runBootAnimation();
    }

    void renderHardwareCheckStep(const char* component, bool status, int step, int totalSteps) {
        checkAndRecoverOLED();
        if (!displayReady) return;

        display.clearDisplay();
        display.setTextSize(1);
        display.setCursor(0, 0);
        display.println(F("--- HARDWARE TEST ---"));
        display.drawFastHLine(0, 10, 128, SSD1306_WHITE);

        display.setCursor(0, 20);
        display.print(F("Testing: "));
        display.println(component);

        display.setCursor(0, 36);
        display.print(F("Status : "));
        if (status) {
            display.println(F("[ OK ]"));
        } else {
            display.println(F("[ FAIL ]"));
        }

        int barW = (step * 128) / totalSteps;
        display.fillRect(0, 56, barW, 8, SSD1306_WHITE);
        display.display();

        delay(15);
    }

    void renderCalibrationScreen(int percent) {
        checkAndRecoverOLED();
        if (!displayReady) return;

        display.clearDisplay();
        display.setTextSize(1);
        display.setTextColor(SSD1306_WHITE);
        display.setCursor(4, 4);
        display.println(F("--- CALIBRATION ---"));
        display.drawFastHLine(0, 15, 128, SSD1306_WHITE);

        display.setCursor(6, 22);
        display.println(F("CALIBRATING STICKS"));
        display.setCursor(6, 33);
        display.println(F("DO NOT TOUCH STICKS!"));

        display.drawRect(8, 46, 112, 10, SSD1306_WHITE);
        int barW = (constrain(percent, 0, 100) * 108) / 100;
        if (barW > 0) {
            display.fillRect(10, 48, barW, 6, SSD1306_WHITE);
        }

        display.display();
    }

    void renderEmergencyStopScreen() {
        checkAndRecoverOLED();
        if (!displayReady) return;

        display.clearDisplay();
        display.drawRect(0, 0, 128, 64, SSD1306_WHITE);
        display.drawRect(2, 2, 124, 60, SSD1306_WHITE);

        display.fillRect(5, 5, 118, 16, SSD1306_WHITE);
        display.setTextSize(1);
        display.setTextColor(SSD1306_BLACK);
        display.setCursor(10, 9);
        display.print(F("! EMERGENCY STOP !"));

        display.setTextColor(SSD1306_WHITE);
        display.setCursor(13, 27);
        display.print(F("ALL MOTORS LOCKED"));

        display.fillRect(10, 43, 108, 14, SSD1306_WHITE);
        display.setTextColor(SSD1306_BLACK);
        display.setCursor(10, 46);
        display.print(F("PRESS JR TO RESUME"));

        display.display();
    }

    /**
     * @brief Master Multi-Mode HUD Renderer (Exact Match to Design Mockup).
     */
    void renderHUD(int16_t lx, int16_t ly, int16_t rx, int16_t ry,
                   uint8_t buttonsMask, uint8_t mode, float batVolts, float batPct,
                   ConnectionState connState, int8_t rssi,
                   uint8_t distL, uint8_t distC, uint8_t distR) {
        checkAndRecoverOLED();
        if (!displayReady) return;

        uint32_t now = millis();
        if (now - lastRenderMs < OLED_INTERVAL_MS) {
            return;
        }

        uint32_t currentHash = computeStateHash(lx, ly, rx, ry, buttonsMask, mode, batVolts, connState, distL, distC, distR);
        if (currentHash == lastStateHash && (now - lastRenderMs < 1000)) {
            return;
        }
        lastRenderMs = now;
        lastStateHash = currentHash;

        display.clearDisplay();

        // -------------------------------------------------------------
        // TOP HEADER BAR (Y = 0..10)
        // -------------------------------------------------------------
        uint8_t signalPct = 0;
        if (connState == LINK_CONNECTED) {
            if (rssi >= -50) signalPct = 100;
            else if (rssi <= -95) signalPct = 15;
            else signalPct = (uint8_t)map(rssi, -95, -50, 20, 100);
        }
        drawSignalAntenna(0, 0, signalPct);

        display.setTextSize(1);
        display.setTextColor(SSD1306_WHITE);
        display.setCursor(13, 1);
        display.print(signalPct);
        display.print(F("%"));

        // Center Mode Badge: ML (Manual), FA (Full-Auto), PK (Park)
        display.setCursor(60, 1);
        if (mode == MODE_PARK) {
            display.print(F("PK"));
        } else if (mode == MODE_AUTO) {
            display.print(F("FA"));
        } else {
            display.print(F("ML"));
        }

        // Voltage & Battery Icon
        display.setCursor(88, 1);
        display.print(batVolts, 1);
        display.print(F("V"));
        drawBatteryIcon(113, 0, batPct);

        display.drawFastHLine(0, 10, 128, SSD1306_WHITE);

        // -------------------------------------------------------------
        // CENTER SECTION (Y = 11..49) - MODE SPECIFIC LAYOUT
        // -------------------------------------------------------------
        if (mode == MODE_AUTO) {
            // MODE 2: AUTONOMOUS COCKPIT HUD (Clean Minimalist: No L/R text)
            int leftPwr = (ly > 0) ? map(ly, 0, 1000, 0, 100) : 0;
            int rightPwr = (ry > 0) ? map(ry, 0, 1000, 0, 100) : 0;
            drawVerticalGauge(2, 12, 18, 37, leftPwr, 0, 100, "");
            drawRoverCockpit(64, 28, distL, distC, distR);
            drawVerticalGauge(108, 12, 18, 37, rightPwr, 0, 100, "");

        } else {
            // MODE 0: MANUAL DRIVING HUD
            int throttleVal = ly / 10; // -100 .. +100
            int steerVal    = rx / 10; // -100 .. +100

            drawVerticalGauge(2, 12, 18, 37, throttleVal, -100, 100, "THR");

            // Center Digital Real Speed (cm/s, strictly 0 at deadzone, real number only)
            display.setTextSize(1);
            display.setTextColor(SSD1306_WHITE);
            display.setCursor(48, 14);
            display.print(F("SPEED"));

            int realSpeedCmS = 0;
            if (abs(ly) >= 60) {
                // 300 RPM motor + 70mm wheel = ~110 cm/s theoretical max
                realSpeedCmS = map(abs(ly), 60, 1000, 12, 110);
                realSpeedCmS = constrain(realSpeedCmS, 0, 110);
            }

            display.setTextSize(2);
            if (realSpeedCmS < 10) {
                display.setCursor(58, 27);
            } else if (realSpeedCmS < 100) {
                display.setCursor(52, 27);
            } else {
                display.setCursor(46, 27);
            }
            display.print(realSpeedCmS);

            drawVerticalGauge(108, 12, 18, 37, steerVal, -100, 100, "STR");
        }

        // -------------------------------------------------------------
        // BOTTOM FOOTER (Y = 50..63) - 2 CLEAN ROUNDED ACTION PILLS
        // -------------------------------------------------------------
        display.drawFastHLine(0, 50, 128, SSD1306_WHITE);

        bool parkActive = (mode == MODE_PARK) || ((buttonsMask & BTN_BIT_TOGGLE2) != 0);

        // Left Pill: Current Drive Mode (Eco / Sport / Norm)
        uint8_t dMode = phoneOS.getDriveMode();
        const char* dModeStr = (dMode == 0) ? "Eco" : ((dMode == 1) ? "Sport" : "Norm");
        drawActionPill(10, 52, 48, 11, dModeStr, false);
        drawActionPill(70, 52, 48, 11, "Park", parkActive);

        display.display();
    }

    /**
     * @brief Specialized Cyber OS renderer.
     *        Inside OS: JR = Enter/Select, JL = Back/Escape, Joysticks = Scroll, P1 = Special
     */
    void renderPhoneOS(JoystickManager &joyMgr, BatteryManager &batMgr,
                       int16_t lx, int16_t ly, int16_t rx, int16_t ry,
                       bool jrJustPressed, bool jlJustPressed, bool p1JustPressed) {
        checkAndRecoverOLED();
        if (!displayReady) return;
        phoneOS.update(display, joyMgr, batMgr, lx, ly, rx, ry, jrJustPressed, jlJustPressed, p1JustPressed);
        display.display();
    }

    PhoneOSManager& getPhoneOS() { return phoneOS; }
};

#endif // DISPLAY_MANAGER_H
