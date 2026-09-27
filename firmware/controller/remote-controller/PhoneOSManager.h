/**
 * ============================================================================
 * @file PhoneOSManager.h
 * @brief Commercial Flipper-Zero Style Cyber OS Suite for CYBERROVER X.
 *        Features:
 *          1. ESP32 Non-Volatile Flash Storage (NVS <Preferences.h>) for:
 *             - Theme (Light Mode / Dark Mode)
 *             - Joystick Response Curve (Linear, Soft Expo, Sport Boost)
 *             - Joystick Deadzone (50..300)
 *             - Battery Voltage Calibration Multiplier
 *             - Radio Wi-Fi Channel Selection
 *             - Chrome Dino & Flappy Bird High Scores
 *          2. 11-Item Vertical Scrolling Launcher
 *          3. Authentic Chrome Offline T-Rex Dino Game with High Score Persistence
 *          4. Flappy Bird Arcade Game with High Score Persistence
 *          5. Selective SAVED ✔ Pop-Up Confirmation
 *          6. Dual Crosshairs Joystick Tuner
 *          7. 6-Slot QR Code Gallery
 * ============================================================================
 */

#ifndef PHONE_OS_MANAGER_H
#define PHONE_OS_MANAGER_H

#include <Arduino.h>
#include <Adafruit_SSD1306.h>
#include <Preferences.h>
#include "Config.h"
#include "Types.h"
#include "JoystickManager.h"
#include "BatteryManager.h"

enum PhoneApp : uint8_t {
    APP_LAUNCHER = 0,
    APP_HORN_SELECTOR,
    APP_SETTINGS,
    APP_SYS_INFO,
    APP_STOPWATCH,
    APP_TIMER,
    APP_JOYSTICK_TUNER,
    APP_QR_GALLERY,
    APP_RADIO_SCANNER,
    APP_GAME_DINO,
    APP_GAME_FLAPPY,
    APP_GAME_SHOOTER,
    APP_GAME_PONG
};

// 33x33 Pixel QR Code Bitmap Placeholder
const uint8_t PROGMEM qrCodeBitmap[132] = {
    0xFF, 0x87, 0xF1, 0xFF, 0x80, 0x81, 0x01, 0x80, 0x8D, 0x9D, 0x61, 0x80,
    0x8D, 0x9D, 0x61, 0x80, 0x8D, 0x81, 0x61, 0x80, 0x80, 0x00, 0x01, 0x80,
    0xFF, 0x55, 0xF1, 0xFF, 0x00, 0xAA, 0x00, 0x00, 0xC3, 0xFF, 0x0F, 0xC0,
    0x3C, 0x3C, 0xF0, 0x30, 0xF0, 0x0F, 0x3C, 0xC0, 0xC3, 0xF0, 0x0F, 0x00,
    0x33, 0x33, 0x33, 0x30, 0xF0, 0xCC, 0x33, 0xC0, 0xFF, 0x0F, 0x0F, 0xFF,
    0x80, 0xAA, 0x55, 0x80, 0x8D, 0xF0, 0x0F, 0x80, 0x8D, 0x0F, 0xF0, 0x80,
    0x8D, 0xAA, 0x55, 0x80, 0x80, 0x55, 0xAA, 0x80, 0xFF, 0xFF, 0xFF, 0xFF,
    0x00, 0x00, 0x00, 0x00, 0xC3, 0x3C, 0xC3, 0x30, 0x3C, 0xC3, 0x3C, 0xC0,
    0xF0, 0x0F, 0xF0, 0x00, 0x0F, 0xF0, 0x0F, 0x30, 0xC3, 0x3C, 0xC3, 0xC0,
    0x33, 0xCC, 0x33, 0x00, 0xFF, 0x87, 0xF1, 0xFF, 0x80, 0x81, 0x01, 0x80,
    0x8D, 0x9D, 0x61, 0x80, 0x8D, 0x9D, 0x61, 0x80, 0xFF, 0x87, 0xF1, 0xFF
};

class PhoneOSManager {
private:
    Preferences prefs;
    PhoneApp currentApp;
    uint8_t selectedIndex; // 0..11 active launcher item
    uint8_t topIndex;      // 0..9 top visible row index
    uint32_t lastNavMs;

    // Horn State
    uint8_t selectedHornId; // 0..7
    uint8_t hornTopIndex;
    bool isHornTriggered;

    // Drive Mode & Settings State
    uint8_t driveMode;     // 0=ECO (50%), 1=SPORT (100%), 2=NORMAL (75%)
    bool lightMode;
    bool soundMuted;
    uint8_t settingsIndex;

    // 1. Stopwatch State
    uint32_t stopwatchStartMs;
    uint32_t stopwatchElapsedMs;
    uint32_t lapTimes[3];
    uint8_t lapCount;
    bool stopwatchRunning;

    // 2. Timer State
    int timerMins;
    int timerSecs;
    uint32_t timerStartMs;
    uint32_t timerDurationMs;
    bool timerRunning;

    // 3. QR Gallery State
    uint8_t selectedQrSlot;
    bool qrViewActive;

    // 4. Radio Scanner State
    uint8_t activeChannel;

    // 5. Authentic Chrome Dino Game State
    int dinoY;
    int dinoVel;
    bool dinoJumping;
    bool dinoDucking;
    uint8_t dinoLegStep;
    uint8_t animTick;
    int obstacleX;
    uint8_t obstacleType; // 0=Small Cactus, 1=Tall Cactus, 2=Flying Bird
    int groundScrollX;
    int dinoScore;
    int dinoHiScore;
    bool dinoGameOver;

    // 6. Flappy Bird State
    int birdY;
    int birdVel;
    int pipeX;
    int pipeGapY;
    int flappyScore;
    int flappyHiScore;
    bool flappyGameOver;

    // 7. Space Shooter State
    int shipX;
    int bulletX, bulletY;
    bool bulletActive;
    int alienX, alienY;
    int alienDir;
    int shooterScore;
    bool shooterGameOver;

    // 8. Cyber Pong State (1.2x Speed)
    int pongP1Y, pongP2Y;
    int pongBallX, pongBallY;
    int pongVelX, pongVelY;
    int scoreP1, scoreP2;

    bool requestOsExit;
    uint32_t hornTriggerUntilMs;
    uint32_t savedPopupUntilMs;

public:
    PhoneOSManager() : currentApp(APP_LAUNCHER), selectedIndex(0), topIndex(0), lastNavMs(0),
                       selectedHornId(0), hornTopIndex(0), isHornTriggered(false),
                       driveMode(1), lightMode(false), soundMuted(false), settingsIndex(0),
                       stopwatchStartMs(0), stopwatchElapsedMs(0), lapCount(0), stopwatchRunning(false),
                       timerMins(3), timerSecs(0), timerStartMs(0), timerDurationMs(180000), timerRunning(false),
                       selectedQrSlot(0), qrViewActive(false), activeChannel(0),
                       dinoY(42), dinoVel(0), dinoJumping(false), dinoDucking(false), dinoLegStep(0), animTick(0),
                       obstacleX(128), obstacleType(0), groundScrollX(0), dinoScore(0), dinoHiScore(0), dinoGameOver(false),
                       birdY(32), birdVel(0), pipeX(128), pipeGapY(24), flappyScore(0), flappyHiScore(0), flappyGameOver(false),
                       shipX(60), bulletX(0), bulletY(0), bulletActive(false), alienX(20), alienY(15), alienDir(2), shooterScore(0), shooterGameOver(false),
                       pongP1Y(24), pongP2Y(24), pongBallX(64), pongBallY(32), pongVelX(4), pongVelY(3), scoreP1(0), scoreP2(0),
                       requestOsExit(false), hornTriggerUntilMs(0), savedPopupUntilMs(0) {
        
        memset(lapTimes, 0, sizeof(lapTimes));
    }

    /**
     * @brief Load all settings & game high scores from ESP32 Flash NVS Memory at bootup
     */
    void begin(JoystickManager &joyMgr, BatteryManager &batMgr) {
        prefs.begin("cyber_os", true); // Read-only mode
        lightMode = prefs.getBool("theme", false);
        soundMuted = prefs.getBool("sound_mute", false);
        driveMode = prefs.getUChar("drive_mode", 1);
        selectedHornId = prefs.getUChar("horn_id", 0);
        uint8_t curveMode = prefs.getUChar("curve", 1);
        int deadzone = prefs.getInt("deadzone", JOY_DEFAULT_DEADZONE);
        float batCal = prefs.getFloat("bat_cal", BATTERY_CALIB_FACTOR);
        activeChannel = prefs.getUChar("radio_ch", 0);
        dinoHiScore = prefs.getInt("dino_hi", 0);
        flappyHiScore = prefs.getInt("flappy_hi", 0);
        prefs.end();

        joyMgr.setCurveMode(curveMode);
        joyMgr.setDeadzone(deadzone);
        batMgr.setCalibFactor(batCal);
    }
    /**
     * @brief Save active settings & high scores to ESP32 Flash NVS Memory
     */
    void saveSettings(JoystickManager &joyMgr, BatteryManager &batMgr) {
        prefs.begin("cyber_os", false); // Read-write mode
        prefs.putBool("theme", lightMode);
        prefs.putBool("sound_mute", soundMuted);
        prefs.putUChar("drive_mode", driveMode);
        prefs.putUChar("horn_id", selectedHornId);
        prefs.putUChar("curve", joyMgr.getCurveMode());
        prefs.putInt("deadzone", joyMgr.getDeadzone());
        prefs.putFloat("bat_cal", batMgr.getCalibFactor());
        prefs.putUChar("radio_ch", activeChannel);
        prefs.putInt("dino_hi", dinoHiScore);
        prefs.putInt("flappy_hi", flappyHiScore);
        prefs.end();
    }

    void saveHornSetting() {
        prefs.begin("cyber_os", false);
        prefs.putUChar("horn_id", selectedHornId);
        prefs.end();
    }

    uint8_t getSelectedHornId() const { return selectedHornId; }
    uint8_t getHornSoundCode() const {
        switch (selectedHornId) {
            case 0: return 1;  // Car Horn
            case 1: return 2;  // Heavy Truck
            case 2: return 10; // 30s Time Bomb Countdown
            case 3: return 3;  // Fast Bomb (7s)
            case 4: return 4;  // Police Siren
            case 5: return 5;  // Reverse Beep
            case 6: return 6;  // Gas Alarm
            case 7: return 7;  // Sci-Fi Chirp
            case 8: return 8;  // SOS Morse
            default: return 1;
        }
    }
    uint8_t getDriveMode() const { return driveMode; }
    inline bool hasRequestedExit() const { return requestOsExit; }
    inline void clearRequestedExit() { requestOsExit = false; }

    void triggerOutboundHorn() {
        hornTriggerUntilMs = millis() + 300; // 300ms window sends ~30 packets to rover
    }
    bool hasOutboundSoundTrigger() const { return (millis() < hornTriggerUntilMs); }
    uint8_t consumeOutboundSoundTrigger() {
        return getHornSoundCode();
    }

    void triggerSavedPopup() {
        savedPopupUntilMs = millis() + 800; // 800ms non-blocking display
    }
    void drawSavedBadgeIfActive(Adafruit_SSD1306 &display) {
        if (millis() < savedPopupUntilMs) {
            display.fillRoundRect(22, 48, 84, 15, 3, SSD1306_WHITE);
            display.setTextColor(SSD1306_BLACK);
            display.setTextSize(1);
            display.setCursor(30, 52);
            display.print(F("SAVED OK"));
        }
    }

    bool isSoundMuted() const { return soundMuted; }
    void setSoundMuted(bool m) { soundMuted = m; }

    void resetStopwatch() {
        stopwatchStartMs = 0;
        stopwatchElapsedMs = 0;
        lapCount = 0;
        stopwatchRunning = false;
        memset(lapTimes, 0, sizeof(lapTimes));
    }

    void resetTimer() {
        timerStartMs = 0;
        timerRunning = false;
    }

    void resetDino() {
        dinoY = 42;
        dinoVel = 0;
        dinoJumping = false;
        dinoDucking = false;
        dinoLegStep = 0;
        animTick = 0;
        obstacleX = 128;
        obstacleType = random(0, 3);
        groundScrollX = 0;
        dinoScore = 0;
        dinoGameOver = false;
    }

    void resetFlappy() {
        birdY = 32;
        birdVel = 0;
        pipeX = 128;
        pipeGapY = random(16, 40);
        flappyScore = 0;
        flappyGameOver = false;
    }

    void resetShooter() {
        shipX = 60;
        bulletActive = false;
        alienX = 20;
        alienY = 15;
        alienDir = 2;
        shooterScore = 0;
        shooterGameOver = false;
    }

    void resetPong() {
        pongP1Y = 24;
        pongP2Y = 24;
        pongBallX = 64;
        pongBallY = 32;
        pongVelX = 4;
        pongVelY = 3;
        scoreP1 = 0;
        scoreP2 = 0;
    }

    /**
     * @brief Pop-Up "SAVED ✔" Confirmation Screen
     */
    void showSavedPopup(Adafruit_SSD1306 &display) {
        display.clearDisplay();
        display.drawRoundRect(20, 14, 88, 36, 6, SSD1306_WHITE);
        display.fillRoundRect(22, 16, 84, 32, 4, SSD1306_WHITE);

        // Vector Checkmark Icon ✔
        display.drawLine(34, 32, 42, 40, SSD1306_BLACK);
        display.drawLine(42, 40, 56, 24, SSD1306_BLACK);
        display.drawLine(34, 33, 42, 41, SSD1306_BLACK);
        display.drawLine(42, 41, 56, 25, SSD1306_BLACK);

        display.setTextSize(2);
        display.setTextColor(SSD1306_BLACK);
        display.setCursor(60, 25);
        display.print(F("SAVED"));

        display.display();
        delay(320);
    }

    /**
     * @brief Vector Icon Renderer for 11 Menu Items
     */
    void drawMenuIcon(Adafruit_SSD1306 &display, int x, int y, int type, uint16_t color) {
        switch (type) {
            case 0: // Settings Gear
                display.drawCircle(x + 6, y + 6, 5, color);
                display.drawCircle(x + 6, y + 6, 2, color);
                break;
            case 1: // System Info Gauge
                display.drawCircle(x + 6, y + 6, 5, color);
                display.drawLine(x + 6, y + 6, x + 9, y + 3, color);
                break;
            case 2: // Stopwatch Chronometer
                display.drawCircle(x + 6, y + 7, 4, color);
                display.drawFastHLine(x + 4, y + 1, 5, color);
                display.drawFastVLine(x + 6, y + 1, 3, color);
                break;
            case 3: // Timer Clock
                display.drawCircle(x + 6, y + 6, 5, color);
                display.drawFastVLine(x + 6, y + 3, 4, color);
                display.drawFastHLine(x + 6, y + 6, 3, color);
                break;
            case 4: // Joystick Tuner Target
                display.drawCircle(x + 6, y + 6, 5, color);
                display.drawFastHLine(x + 2, y + 6, 9, color);
                display.drawFastVLine(x + 6, y + 2, 9, color);
                break;
            case 5: // QR Gallery
                display.drawRect(x + 2, y + 2, 9, 9, color);
                display.fillRect(x + 4, y + 4, 3, 3, color);
                break;
            case 6: // Radio Signal Scanner
                display.drawFastVLine(x + 2, y + 9, 3, color);
                display.drawFastVLine(x + 5, y + 6, 6, color);
                display.drawFastVLine(x + 8, y + 3, 9, color);
                break;
            case 7: // Chrome Dino
                display.fillRect(x + 4, y + 2, 6, 5, color);
                display.fillRect(x + 3, y + 7, 5, 4, color);
                display.drawFastVLine(x + 4, y + 11, 2, color);
                display.drawFastVLine(x + 7, y + 11, 2, color);
                break;
            case 8: // Flappy Bird Wing
                display.drawCircle(x + 6, y + 6, 4, color);
                display.drawPixel(x + 9, y + 5, color);
                break;
            case 9: // Space Defender Rocket
                display.drawTriangle(x + 6, y + 1, x + 2, y + 10, x + 10, y + 10, color);
                display.fillRect(x + 5, y + 6, 3, 5, color);
                break;
            case 10: // Cyber Pong Paddles
                display.drawFastVLine(x + 2, y + 2, 8, color);
                display.drawFastVLine(x + 10, y + 4, 8, color);
                display.fillRect(x + 5, y + 5, 2, 2, color);
                break;
        }
    }

    /**
     * @brief Master Update Router
     *        Inside OS: JR = Enter/Select, JL = Back/Escape, Joysticks = Scroll, P1 = Special
     */
    void update(Adafruit_SSD1306 &display, JoystickManager &joyMgr, BatteryManager &batMgr,
                int16_t lx, int16_t ly, int16_t rx, int16_t ry,
                bool jrJustPressed, bool jlJustPressed, bool p1JustPressed) {

        // Button JL (Left Stick Click) = UNIVERSAL BACK BUTTON FOR ALL
        if (jlJustPressed) {
            if (currentApp != APP_LAUNCHER) {
                // Exit current sub-app back to launcher
                saveSettings(joyMgr, batMgr);

                if (currentApp == APP_STOPWATCH) resetStopwatch();
                else if (currentApp == APP_TIMER) resetTimer();
                else if (currentApp == APP_GAME_DINO) resetDino();
                else if (currentApp == APP_GAME_FLAPPY) resetFlappy();
                else if (currentApp == APP_GAME_SHOOTER) resetShooter();
                else if (currentApp == APP_GAME_PONG) resetPong();

                qrViewActive = false;
                currentApp = APP_LAUNCHER;
                return;
            } else {
                // Already on launcher: Request exit from Cyber OS to Driving HUD!
                requestOsExit = true;
                return;
            }
        }

        display.invertDisplay(lightMode);

        switch (currentApp) {
            case APP_LAUNCHER:
                renderScrollingLauncher(display, ly, jrJustPressed);
                break;
            case APP_HORN_SELECTOR:
                renderHornSelector(display, ly, jrJustPressed, p1JustPressed);
                break;
            case APP_SETTINGS:
                renderSettings(display, joyMgr, batMgr, ly, lx, jrJustPressed, p1JustPressed);
                break;
            case APP_SYS_INFO:
                renderSysInfo(display, batMgr, ly);
                break;
            case APP_STOPWATCH:
                renderStopwatch(display, jrJustPressed);
                break;
            case APP_TIMER:
                renderTimer(display, ly, ry, jrJustPressed);
                break;
            case APP_JOYSTICK_TUNER:
                renderJoystickTuner(display, joyMgr, lx, ly, rx, ry, jrJustPressed);
                break;
            case APP_QR_GALLERY:
                renderQRGallery(display, lx, ly, jrJustPressed, jlJustPressed);
                break;
            case APP_RADIO_SCANNER:
                renderRadioScanner(display, lx, jrJustPressed);
                break;
            case APP_GAME_DINO:
                updateDino(display, joyMgr, batMgr, ly, jrJustPressed, jlJustPressed);
                break;
            case APP_GAME_FLAPPY:
                updateFlappy(display, joyMgr, batMgr, jrJustPressed);
                break;
            case APP_GAME_SHOOTER:
                updateShooter(display, lx, jrJustPressed);
                break;
            case APP_GAME_PONG:
                updatePong(display, ly, ry);
                break;
        }
    }

private:
    /**
     * @brief 12-Item Vertical Scrolling Menu (Flipper-Zero Style UI)
     */
    void renderScrollingLauncher(Adafruit_SSD1306 &display, int16_t ly, bool jrJustPressed) {
        uint32_t now = millis();

        if (now - lastNavMs > 160) {
            if (ly > 300) { // Up
                if (selectedIndex > 0) {
                    selectedIndex--;
                    if (selectedIndex < topIndex) topIndex = selectedIndex;
                    lastNavMs = now;
                }
            } else if (ly < -300) { // Down
                if (selectedIndex < 11) {
                    selectedIndex++;
                    if (selectedIndex >= topIndex + 3) topIndex = selectedIndex - 2;
                    lastNavMs = now;
                }
            }
        }

        // JR = SELECT / OPEN APP
        if (jrJustPressed) {
            if (selectedIndex == 0) currentApp = APP_HORN_SELECTOR;
            else if (selectedIndex == 1) currentApp = APP_SETTINGS;
            else if (selectedIndex == 2) currentApp = APP_SYS_INFO;
            else if (selectedIndex == 3) { resetStopwatch(); currentApp = APP_STOPWATCH; }
            else if (selectedIndex == 4) { resetTimer(); currentApp = APP_TIMER; }
            else if (selectedIndex == 5) currentApp = APP_JOYSTICK_TUNER;
            else if (selectedIndex == 6) currentApp = APP_QR_GALLERY;
            else if (selectedIndex == 7) currentApp = APP_RADIO_SCANNER;
            else if (selectedIndex == 8) { resetDino(); currentApp = APP_GAME_DINO; }
            else if (selectedIndex == 9) { resetFlappy(); currentApp = APP_GAME_FLAPPY; }
            else if (selectedIndex == 10) { resetShooter(); currentApp = APP_GAME_SHOOTER; }
            else if (selectedIndex == 11) { resetPong(); currentApp = APP_GAME_PONG; }
            return;
        }

        display.clearDisplay();

        const char* menuLabels[12] = {
            "Horn & Audio",
            "System Settings",
            "System Info",
            "Stopwatch",
            "Timer",
            "Joystick Tuner",
            "QR Gallery",
            "Radio Scanner",
            "Chrome Dino",
            "Flappy Bird",
            "Space Attack",
            "Cyber Pong"
        };

        for (int i = 0; i < 3; i++) {
            int itemIdx = topIndex + i;
            if (itemIdx >= 12) break;

            int rowY = 1 + (i * 21);

            if (itemIdx == selectedIndex) {
                display.fillRoundRect(2, rowY, 118, 19, 4, SSD1306_WHITE);
                drawMenuIcon(display, 6, rowY + 3, itemIdx, SSD1306_BLACK);

                display.setTextSize(1);
                display.setTextColor(SSD1306_BLACK);
                display.setCursor(24, rowY + 6);
                display.print(menuLabels[itemIdx]);
            } else {
                drawMenuIcon(display, 6, rowY + 3, itemIdx, SSD1306_WHITE);

                display.setTextSize(1);
                display.setTextColor(SSD1306_WHITE);
                display.setCursor(24, rowY + 6);
                display.print(menuLabels[itemIdx]);
            }
        }

        display.drawFastVLine(124, 2, 60, SSD1306_WHITE);

        int thumbY = 2 + (topIndex * 42) / 9;
        display.fillRoundRect(123, thumbY, 3, 18, 1, SSD1306_WHITE);

        display.display();
    }

    /**
     * @brief Tactical Horn & Audio Soundboard App
     */
    void renderHornSelector(Adafruit_SSD1306 &display, int16_t ly, bool jrPressed, bool p1Pressed) {
        uint32_t now = millis();
        if (now - lastNavMs > 160) {
            if (ly > 300 && selectedHornId > 0) {
                selectedHornId--;
                if (selectedHornId < hornTopIndex) hornTopIndex = selectedHornId;
                saveHornSetting();
                lastNavMs = now;
            } else if (ly < -300 && selectedHornId < 8) {
                selectedHornId++;
                if (selectedHornId >= hornTopIndex + 3) hornTopIndex = selectedHornId - 2;
                saveHornSetting();
                lastNavMs = now;
            }
        }

        // JR = FORWARD / PREVIEW SOUND ON CAR BUZZER
        if (jrPressed) {
            triggerOutboundHorn();
        }

        // P1 = SAVE CHOSEN HORN TO FLASH NVS
        if (p1Pressed) {
            saveHornSetting();
            triggerSavedPopup();
        }

        display.clearDisplay();
        display.setTextSize(1);
        display.setTextColor(SSD1306_WHITE);
        display.setCursor(18, 0); display.println(F("HORN SELECTOR"));
        display.drawFastHLine(0, 9, 128, SSD1306_WHITE);

        const char* hornNames[9] = {
            "1. Car Horn",
            "2. Heavy Truck",
            "3. 30s Time Bomb",
            "4. Fast Bomb (7s)",
            "5. Police Siren",
            "6. Reverse Beep",
            "7. Gas Alarm",
            "8. Sci-Fi Chirp",
            "9. SOS Morse"
        };

        bool isPlaying = hasOutboundSoundTrigger();

        for (int i = 0; i < 3; i++) {
            int idx = hornTopIndex + i;
            if (idx >= 9) break;
            int rowY = 12 + (i * 13);
            if (idx == selectedHornId) {
                display.fillRoundRect(2, rowY, 120, 12, 2, SSD1306_WHITE);
                display.setTextColor(SSD1306_BLACK);
                display.setCursor(6, rowY + 2);
                display.print(hornNames[idx]);
                if (isPlaying) display.print(F(" *"));
            } else {
                display.setTextColor(SSD1306_WHITE);
                display.setCursor(6, rowY + 2);
                display.print(hornNames[idx]);
            }
        }

        display.setTextColor(SSD1306_WHITE);
        display.setCursor(2, 53);
        display.print(F("JR:TEST  P1:SAVE  JL:BACK"));

        if (isPlaying) {
            for (int b = 0; b < 5; b++) {
                int barH = random(3, 9);
                display.drawFastVLine(110 + (b * 3), 61 - barH, barH, SSD1306_WHITE);
            }
        }

        drawSavedBadgeIfActive(display);
        display.display();
    }

    /**
     * @brief System Settings App (Includes Sport / Eco Drive Mode)
     */
    void renderSettings(Adafruit_SSD1306 &display, JoystickManager &joyMgr, BatteryManager &batMgr, int16_t ly, int16_t lx, bool jrJustPressed, bool p1JustPressed) {
        uint32_t now = millis();

        if (now - lastNavMs > 180) {
            if (ly > 300 && settingsIndex > 0) { settingsIndex--; lastNavMs = now; }
            else if (ly < -300 && settingsIndex < 4) { settingsIndex++; lastNavMs = now; }

            // JR = FORWARD / CYCLE SETTING OPTION
            if (abs(lx) > 400 || jrJustPressed) {
                if (settingsIndex == 0) {
                    lightMode = !lightMode;
                    lastNavMs = now;
                } else if (settingsIndex == 1) {
                    soundMuted = !soundMuted;
                    lastNavMs = now;
                } else if (settingsIndex == 2) {
                    driveMode = (driveMode + (lx > 0 || jrJustPressed ? 1 : 2)) % 3;
                    lastNavMs = now;
                } else if (settingsIndex == 3) {
                    uint8_t mode = (joyMgr.getCurveMode() + (lx > 0 || jrJustPressed ? 1 : 2)) % 3;
                    joyMgr.setCurveMode(mode);
                    lastNavMs = now;
                } else if (settingsIndex == 4) {
                    int dz = joyMgr.getDeadzone() + (lx > 0 || jrJustPressed ? 20 : -20);
                    if (dz > 300) dz = 60;
                    joyMgr.setDeadzone(dz);
                    lastNavMs = now;
                }
                saveSettings(joyMgr, batMgr);
            }
        }

        // P1 = SAVE ALL SETTINGS EXPLICITLY
        if (p1JustPressed) {
            saveSettings(joyMgr, batMgr);
            triggerSavedPopup();
        }

        display.clearDisplay();
        display.setTextSize(1);
        display.setTextColor(SSD1306_WHITE);

        display.setCursor(18, 0); display.println(F("SYSTEM SETTINGS"));
        display.drawFastHLine(0, 9, 128, SSD1306_WHITE);

        int startIdx = (settingsIndex >= 3) ? settingsIndex - 2 : 0;

        for (int i = 0; i < 3; i++) {
            int idx = startIdx + i;
            if (idx > 4) break;
            int rowY = 12 + (i * 13);

            if (idx == settingsIndex) {
                display.fillRoundRect(2, rowY, 120, 12, 2, SSD1306_WHITE);
                display.setTextColor(SSD1306_BLACK);
            } else {
                display.setTextColor(SSD1306_WHITE);
            }

            display.setCursor(4, rowY + 2);
            if (idx == 0) {
                display.print(F("Theme : ")); display.print(lightMode ? F("LIGHT") : F("DARK"));
            } else if (idx == 1) {
                display.print(F("Sound : ")); display.print(soundMuted ? F("MUTED") : F("ACTIVE"));
            } else if (idx == 2) {
                display.print(F("Drive : "));
                if (driveMode == 0) display.print(F("ECO (50%)"));
                else if (driveMode == 1) display.print(F("SPORT (MAX)"));
                else display.print(F("NORMAL (75%)"));
            } else if (idx == 3) {
                display.print(F("Curve : "));
                uint8_t cm = joyMgr.getCurveMode();
                if (cm == 0) display.print(F("LINEAR"));
                else if (cm == 1) display.print(F("SOFT EXPO"));
                else display.print(F("SPORT BOOST"));
            } else if (idx == 4) {
                display.print(F("DeadZN: ")); display.print(joyMgr.getDeadzone());
            }
        }

        display.setTextColor(SSD1306_WHITE);
        display.setCursor(2, 53);
        display.print(F("JR:NEXT  P1:SAVE  JL:BACK"));

        drawSavedBadgeIfActive(display);
        display.display();
    }

    /**
     * @brief System Info & Full Specs App
     */
    void renderSysInfo(Adafruit_SSD1306 &display, BatteryManager &batMgr, int16_t ly) {
        display.clearDisplay();
        display.setTextSize(1);
        display.setTextColor(SSD1306_WHITE);

        display.setCursor(16, 0); display.println(F("SYSTEM DIAGNOSTICS"));
        display.drawFastHLine(0, 9, 128, SSD1306_WHITE);

        display.setCursor(0, 14); display.print(F("MCU  : ESP32 D0WD V3"));
        display.setCursor(0, 24); display.print(F("Clock: 240MHz 2-Core"));
        display.setCursor(0, 34); display.print(F("SRAM : 512KB (")); display.print(ESP.getFreeHeap() / 1024); display.println(F("KB)"));
        display.setCursor(0, 44); display.print(F("Bat  : ")); display.print(batMgr.getVoltage(), 2); display.print(F("V (10sAvg)"));
        display.setCursor(0, 54); display.print(F("Radio: ESP-NOW 2.4G"));

        display.display();
    }

    /**
     * @brief Precision Stopwatch App
     */
    void renderStopwatch(Adafruit_SSD1306 &display, bool p2JustPressed) {
        uint32_t now = millis();

        if (p2JustPressed) {
            if (!stopwatchRunning) {
                stopwatchStartMs = now - stopwatchElapsedMs;
                stopwatchRunning = true;
            } else {
                if (lapCount < 3) {
                    lapTimes[lapCount++] = stopwatchElapsedMs;
                } else {
                    stopwatchRunning = false;
                }
            }
        }

        if (stopwatchRunning) {
            stopwatchElapsedMs = now - stopwatchStartMs;
        }

        int mins = stopwatchElapsedMs / 60000;
        int secs = (stopwatchElapsedMs % 60000) / 1000;
        int ms = (stopwatchElapsedMs % 1000) / 10;

        display.clearDisplay();
        display.setTextSize(1);
        display.setTextColor(SSD1306_WHITE);
        display.setCursor(32, 0); display.println(F("STOPWATCH"));
        display.drawFastHLine(0, 9, 128, SSD1306_WHITE);

        display.setTextSize(2);
        display.setCursor(14, 16);
        if (mins < 10) display.print(F("0"));
        display.print(mins); display.print(F(":"));
        if (secs < 10) display.print(F("0"));
        display.print(secs); display.print(F("."));
        if (ms < 10) display.print(F("0"));
        display.print(ms);

        display.setTextSize(1);
        for (int i = 0; i < lapCount; i++) {
            display.setCursor(4, 38 + (i * 8));
            display.print(F("Lap ")); display.print(i + 1); display.print(F(": "));
            display.print(lapTimes[i] / 1000.0f, 2); display.print(F("s"));
        }

        display.display();
    }

    /**
     * @brief Countdown Timer App
     */
    void renderTimer(Adafruit_SSD1306 &display, int16_t ly, int16_t ry, bool p2JustPressed) {
        uint32_t now = millis();

        if (!timerRunning && now - lastNavMs > 220) {
            if (ly > 400 && timerMins < 59) { timerMins++; lastNavMs = now; }
            else if (ly < -400 && timerMins > 0) { timerMins--; lastNavMs = now; }

            if (ry > 400 && timerSecs < 59) { timerSecs++; lastNavMs = now; }
            else if (ry < -400 && timerSecs > 0) { timerSecs--; lastNavMs = now; }

            timerDurationMs = ((timerMins * 60) + timerSecs) * 1000L;
        }

        if (p2JustPressed) {
            if (timerRunning) {
                timerRunning = false;
            } else {
                timerStartMs = now;
                timerRunning = true;
            }
        }

        uint32_t remainingMs = timerDurationMs;
        if (timerRunning) {
            uint32_t elapsed = now - timerStartMs;
            if (elapsed >= timerDurationMs) {
                remainingMs = 0;
                timerRunning = false;
            } else {
                remainingMs = timerDurationMs - elapsed;
            }
        }

        int mins = remainingMs / 60000;
        int secs = (remainingMs % 60000) / 1000;

        display.clearDisplay();
        display.setTextSize(1);
        display.setTextColor(SSD1306_WHITE);
        display.setCursor(44, 0); display.println(F("TIMER"));
        display.drawFastHLine(0, 9, 128, SSD1306_WHITE);

        display.setTextSize(3);
        display.setCursor(18, 22);
        if (mins < 10) display.print(F("0"));
        display.print(mins); display.print(F(":"));
        if (secs < 10) display.print(F("0"));
        display.print(secs);

        display.display();
    }

    /**
     * @brief Dual Crosshair Joystick Tuner
     */
    void renderJoystickTuner(Adafruit_SSD1306 &display, JoystickManager &joyMgr, int16_t lx, int16_t ly, int16_t rx, int16_t ry, bool p2JustPressed) {
        if (p2JustPressed) {
            joyMgr.setCurveMode((joyMgr.getCurveMode() + 1) % 3);
        }

        display.clearDisplay();
        display.setTextSize(1);
        display.setTextColor(SSD1306_WHITE);
        display.setCursor(20, 0); display.println(F("JOYSTICK TUNING"));
        display.drawFastHLine(0, 9, 128, SSD1306_WHITE);

        display.setCursor(0, 12); display.print(F("DZ:")); display.print(joyMgr.getDeadzone());
        display.setCursor(56, 12); display.print(F("Curve:"));
        uint8_t cm = joyMgr.getCurveMode();
        if (cm == 0) display.print(F("LIN"));
        else if (cm == 1) display.print(F("EXPO"));
        else display.print(F("BOOST"));

        // Left Crosshairs Box
        display.drawRect(10, 26, 36, 24, SSD1306_WHITE);
        int lcx = 28 + (lx / 80);
        int lcy = 38 - (ly / 120);
        lcx = constrain(lcx, 12, 44);
        lcy = constrain(lcy, 28, 48);
        display.fillRect(lcx - 1, lcy - 1, 3, 3, SSD1306_WHITE);
        display.setCursor(14, 52); display.print(F("L-JOY"));

        // Right Crosshairs Box
        display.drawRect(82, 26, 36, 24, SSD1306_WHITE);
        int rcx = 100 + (rx / 80);
        int rcy = 38 - (ry / 120);
        rcx = constrain(rcx, 84, 116);
        rcy = constrain(rcy, 28, 48);
        display.fillRect(rcx - 1, rcy - 1, 3, 3, SSD1306_WHITE);
        display.setCursor(86, 52); display.print(F("R-JOY"));

        display.display();
    }

    /**
     * @brief 6-Slot QR Code Gallery App
     */
    void renderQRGallery(Adafruit_SSD1306 &display, int16_t lx, int16_t ly, bool p2JustPressed, bool p1JustPressed) {
        if (qrViewActive) {
            display.clearDisplay();
            display.setTextSize(1);
            display.setTextColor(SSD1306_WHITE);

            const char* qrNames[6] = {"PROJECT HUB", "GITHUB REPO", "VIDEO DEMO", "TEAM WEBSITE", "WIFI CONNECT", "CONTACT CARD"};
            display.setCursor(0, 20); display.println(qrNames[selectedQrSlot]);
            display.setCursor(0, 36); display.println(F("SCAN QR"));

            display.drawBitmap(72, 14, qrCodeBitmap, 33, 33, SSD1306_WHITE);
            display.display();

            if (p1JustPressed || p2JustPressed) qrViewActive = false;
            return;
        }

        uint32_t now = millis();
        if (now - lastNavMs > 180) {
            if (lx > 500 && selectedQrSlot % 2 == 0) { selectedQrSlot++; lastNavMs = now; }
            else if (lx < -500 && selectedQrSlot % 2 == 1) { selectedQrSlot--; lastNavMs = now; }
            else if (ly > 500 && selectedQrSlot >= 2) { selectedQrSlot -= 2; lastNavMs = now; }
            else if (ly < -500 && selectedQrSlot < 4) { selectedQrSlot += 2; lastNavMs = now; }
        }

        if (p2JustPressed) {
            qrViewActive = true;
            return;
        }

        display.clearDisplay();
        display.setTextSize(1);
        display.setTextColor(SSD1306_WHITE);
        display.setCursor(32, 0); display.println(F("QR GALLERY"));
        display.drawFastHLine(0, 9, 128, SSD1306_WHITE);

        const char* slotLabels[6] = {"PROJECT", "GITHUB", "VIDEO", "WEBSITE", "WIFI", "CONTACT"};

        for (int i = 0; i < 6; i++) {
            int col = i % 2;
            int row = i / 2;
            int x = 4 + (col * 62);
            int y = 14 + (row * 16);

            if (i == selectedQrSlot) {
                display.fillRoundRect(x, y, 58, 14, 2, SSD1306_WHITE);
                display.setTextColor(SSD1306_BLACK);
            } else {
                display.drawRoundRect(x, y, 58, 14, 2, SSD1306_WHITE);
                display.setTextColor(SSD1306_WHITE);
            }

            display.setCursor(x + 4, y + 3);
            display.print(slotLabels[i]);
        }

        display.display();
    }

    /**
     * @brief Radio Signal & Channel Scanner
     */
    void renderRadioScanner(Adafruit_SSD1306 &display, int16_t lx, bool p2JustPressed) {
        uint32_t now = millis();
        if (abs(lx) > 500 && now - lastNavMs > 250) {
            if (lx > 500 && activeChannel < 13) activeChannel++;
            else if (lx < -500 && activeChannel > 0) activeChannel--;
            lastNavMs = now;
        }

        display.clearDisplay();
        display.setTextSize(1);
        display.setTextColor(SSD1306_WHITE);

        display.setCursor(18, 0); display.println(F("RADIO ANALYZER"));
        display.drawFastHLine(0, 9, 128, SSD1306_WHITE);

        display.setCursor(0, 14); display.print(F("Mode   : ESP-NOW 2.4G"));
        display.setCursor(0, 24); display.print(F("Channel: ")); 
        if (activeChannel == 0) display.print(F("AUTO (Ch 1)"));
        else { display.print(F("Ch ")); display.print(activeChannel); }

        display.setCursor(0, 36); display.print(F("Signal : -65 dBm [OK]"));

        for (int i = 0; i < 8; i++) {
            int h = (i + 1) * 2;
            display.fillRect(10 + (i * 5), 62 - h, 3, h, SSD1306_WHITE);
        }

        display.display();
    }

    /**
     * @brief Authentic Chrome Offline T-Rex Dino Game Engine with High-Score Flash Persistence
     */
    void updateDino(Adafruit_SSD1306 &display, JoystickManager &joyMgr, BatteryManager &batMgr, int16_t ly, bool p2JustPressed, bool lSwJustPressed) {
        if (dinoGameOver) {
            if (p2JustPressed || lSwJustPressed) resetDino();

            display.clearDisplay();
            display.setTextSize(2);
            display.setTextColor(SSD1306_WHITE);
            display.setCursor(12, 14); display.println(F("GAME OVER"));
            display.setTextSize(1);
            display.setCursor(16, 40); display.print(F("HI:")); display.print(dinoHiScore);
            display.setCursor(72, 40); display.print(F("Pts:")); display.print(dinoScore);
            display.display();
            return;
        }

        dinoDucking = (!dinoJumping && ly < -400);

        if ((p2JustPressed || lSwJustPressed) && !dinoJumping && !dinoDucking) {
            dinoVel = -6;
            dinoJumping = true;
        }

        if (dinoJumping) {
            dinoY += dinoVel;
            dinoVel += 1;
            if (dinoY >= 42) {
                dinoY = 42;
                dinoJumping = false;
            }
        }

        animTick++;
        if (animTick >= 4) {
            animTick = 0;
            dinoLegStep = (dinoLegStep + 1) % 2;
        }

        groundScrollX = (groundScrollX + 4) % 128;
        obstacleX -= 5;
        if (obstacleX < -16) {
            obstacleX = 128 + random(0, 30);
            obstacleType = random(0, 3);
            dinoScore += 10;
            if (dinoScore > dinoHiScore) {
                dinoHiScore = dinoScore;
                saveSettings(joyMgr, batMgr); // Save new high score to Flash NVS
            }
        }

        int dinoBoxX = 16, dinoBoxW = 12;
        int dinoBoxY = dinoDucking ? (dinoY + 6) : dinoY;
        int dinoBoxH = dinoDucking ? 10 : 16;

        int obsBoxX = obstacleX, obsBoxW = 8;
        int obsBoxY = (obstacleType == 2) ? 32 : (obstacleType == 1 ? 40 : 46);
        int obsBoxH = (obstacleType == 2) ? 8 : (obstacleType == 1 ? 18 : 12);

        if (dinoBoxX < obsBoxX + obsBoxW && dinoBoxX + dinoBoxW > obsBoxX &&
            dinoBoxY < obsBoxY + obsBoxH && dinoBoxY + dinoBoxH > obsBoxY) {
            dinoGameOver = true;
            if (dinoScore >= dinoHiScore) saveSettings(joyMgr, batMgr);
        }

        display.clearDisplay();
        display.setTextSize(1);
        display.setTextColor(SSD1306_WHITE);

        display.setCursor(2, 0); display.print(F("DINO  HI ")); display.print(dinoHiScore);
        display.setCursor(80, 0); display.print(F("Pts:")); display.print(dinoScore);
        display.drawFastHLine(0, 9, 128, SSD1306_WHITE);

        display.drawFastHLine(0, 58, 128, SSD1306_WHITE);
        display.drawPixel((30 - groundScrollX + 128) % 128, 60, SSD1306_WHITE);
        display.drawPixel((75 - groundScrollX + 128) % 128, 61, SSD1306_WHITE);
        display.drawPixel((110 - groundScrollX + 128) % 128, 60, SSD1306_WHITE);

        int dx = 16, dy = dinoY;
        if (dinoDucking) {
            display.fillRect(dx + 2, dy + 6, 14, 6, SSD1306_WHITE);
            display.drawPixel(dx + 13, dy + 7, SSD1306_BLACK);
            display.drawFastVLine(dx + 4, dy + 12, 4, SSD1306_WHITE);
            display.drawFastVLine(dx + 10, dy + 12, 4, SSD1306_WHITE);
        } else {
            display.fillRect(dx + 6, dy, 8, 5, SSD1306_WHITE);
            display.drawPixel(dx + 9, dy + 1, SSD1306_BLACK);
            display.fillRect(dx + 2, dy + 5, 9, 7, SSD1306_WHITE);
            display.fillRect(dx, dy + 6, 3, 4, SSD1306_WHITE);
            display.drawFastHLine(dx + 10, dy + 7, 3, SSD1306_WHITE);

            if (dinoJumping) {
                display.drawFastVLine(dx + 4, dy + 12, 4, SSD1306_WHITE);
                display.drawFastVLine(dx + 8, dy + 12, 4, SSD1306_WHITE);
            } else {
                if (dinoLegStep == 0) {
                    display.drawFastVLine(dx + 4, dy + 12, 4, SSD1306_WHITE);
                    display.drawLine(dx + 8, dy + 12, dx + 10, dy + 15, SSD1306_WHITE);
                } else {
                    display.drawLine(dx + 4, dy + 12, dx + 2, dy + 15, SSD1306_WHITE);
                    display.drawFastVLine(dx + 8, dy + 12, 4, SSD1306_WHITE);
                }
            }
        }

        if (obstacleType == 0) {
            display.fillRect(obstacleX, 46, 5, 12, SSD1306_WHITE);
            display.drawFastHLine(obstacleX - 2, 49, 3, SSD1306_WHITE);
            display.drawFastHLine(obstacleX + 4, 51, 3, SSD1306_WHITE);
        } else if (obstacleType == 1) {
            display.fillRect(obstacleX, 40, 5, 18, SSD1306_WHITE);
            display.fillRect(obstacleX + 6, 44, 4, 14, SSD1306_WHITE);
        } else if (obstacleType == 2) {
            int by = 32;
            display.fillTriangle(obstacleX, by, obstacleX + 8, by - 4, obstacleX + 12, by, SSD1306_WHITE);
            display.fillTriangle(obstacleX, by, obstacleX + 8, by + 4, obstacleX + 12, by, SSD1306_WHITE);
        }

        display.display();
        delay(25);
    }

    /**
     * @brief Cyber Flappy Bird Arcade Game with High-Score Persistence
     */
    void updateFlappy(Adafruit_SSD1306 &display, JoystickManager &joyMgr, BatteryManager &batMgr, bool lSwJustPressed) {
        if (flappyGameOver) {
            if (lSwJustPressed) resetFlappy();

            display.clearDisplay();
            display.setTextSize(2);
            display.setTextColor(SSD1306_WHITE);
            display.setCursor(12, 14); display.println(F("GAME OVER"));
            display.setTextSize(1);
            display.setCursor(16, 40); display.print(F("HI:")); display.print(flappyHiScore);
            display.setCursor(72, 40); display.print(F("Pts:")); display.print(flappyScore);
            display.display();
            return;
        }

        if (lSwJustPressed) {
            birdVel = -4;
        }

        birdVel += 1;
        birdY += birdVel;

        pipeX -= 3;
        if (pipeX < -12) {
            pipeX = 128;
            pipeGapY = random(16, 40);
            flappyScore += 10;
            if (flappyScore > flappyHiScore) {
                flappyHiScore = flappyScore;
                saveSettings(joyMgr, batMgr);
            }
        }

        if (birdY < 0 || birdY > 58) flappyGameOver = true;
        if (pipeX >= 16 && pipeX <= 28) {
            if (birdY < pipeGapY || birdY > pipeGapY + 20) {
                flappyGameOver = true;
                if (flappyScore >= flappyHiScore) saveSettings(joyMgr, batMgr);
            }
        }

        display.clearDisplay();
        display.setTextSize(1);
        display.setTextColor(SSD1306_WHITE);
        display.setCursor(2, 0); display.print(F("FLAPPY HI ")); display.print(flappyHiScore);
        display.setCursor(80, 0); display.print(F("Pts:")); display.print(flappyScore);
        display.drawFastHLine(0, 9, 128, SSD1306_WHITE);

        display.fillCircle(20, birdY, 3, SSD1306_WHITE);
        display.fillRect(pipeX, 10, 10, pipeGapY - 10, SSD1306_WHITE);
        display.fillRect(pipeX, pipeGapY + 22, 10, 64 - (pipeGapY + 22), SSD1306_WHITE);

        display.display();
        delay(35);
    }

    /**
     * @brief Space Defender Laser Shooter Game
     */
    void updateShooter(Adafruit_SSD1306 &display, int16_t lx, bool p2JustPressed) {
        if (shooterGameOver) {
            if (p2JustPressed) resetShooter();

            display.clearDisplay();
            display.setTextSize(2);
            display.setTextColor(SSD1306_WHITE);
            display.setCursor(12, 14); display.println(F("GAME OVER"));
            display.setTextSize(1);
            display.setCursor(24, 40); display.print(F("Score: ")); display.print(shooterScore);
            display.display();
            return;
        }

        if (lx > 400 && shipX < 116) shipX += 4;
        if (lx < -400 && shipX > 4) shipX -= 4;

        if (p2JustPressed && !bulletActive) {
            bulletActive = true;
            bulletX = shipX + 5;
            bulletY = 50;
        }

        if (bulletActive) {
            bulletY -= 6;
            if (bulletY < 10) bulletActive = false;
        }

        alienX += alienDir;
        if (alienX > 110 || alienX < 6) alienDir = -alienDir;

        if (bulletActive && abs(bulletX - (alienX + 6)) < 8 && abs(bulletY - alienY) < 6) {
            bulletActive = false;
            shooterScore += 20;
            alienX = random(10, 100);
            alienY = 15;
        }

        display.clearDisplay();
        display.setTextSize(1);
        display.setTextColor(SSD1306_WHITE);
        display.setCursor(2, 0); display.print(F("SPACE ATTACK"));
        display.setCursor(76, 0); display.print(F("Pts:")); display.print(shooterScore);
        display.drawFastHLine(0, 9, 128, SSD1306_WHITE);

        display.fillRect(alienX, alienY, 12, 6, SSD1306_WHITE);
        if (bulletActive) display.drawFastVLine(bulletX, bulletY, 4, SSD1306_WHITE);

        display.fillRect(shipX, 54, 12, 6, SSD1306_WHITE);
        display.fillRect(shipX + 4, 50, 4, 4, SSD1306_WHITE);

        display.display();
        delay(25);
    }

    /**
     * @brief Cyber Pong Arcade Game
     */
    void updatePong(Adafruit_SSD1306 &display, int16_t ly, int16_t ry) {
        pongP1Y = 24 - (ly / 50);
        pongP2Y = 24 - (ry / 50);
        pongP1Y = constrain(pongP1Y, 10, 48);
        pongP2Y = constrain(pongP2Y, 10, 48);

        pongBallX += pongVelX;
        pongBallY += pongVelY;

        if (pongBallY <= 10 || pongBallY >= 60) pongVelY = -pongVelY;

        if (pongBallX <= 6 && pongBallY >= pongP1Y && pongBallY <= pongP1Y + 14) {
            pongVelX = -pongVelX;
            pongBallX = 7;
        }

        if (pongBallX >= 121 && pongBallY >= pongP2Y && pongBallY <= pongP2Y + 14) {
            pongVelX = -pongVelX;
            pongBallX = 120;
        }

        if (pongBallX < 0) { scoreP2++; pongBallX = 64; pongBallY = 32; pongVelX = 4; }
        if (pongBallX > 128) { scoreP1++; pongBallX = 64; pongBallY = 32; pongVelX = -4; }

        display.clearDisplay();
        display.setTextSize(1);
        display.setTextColor(SSD1306_WHITE);
        display.setCursor(14, 0); display.print(F("P1: ")); display.print(scoreP1);
        display.setCursor(84, 0); display.print(F("P2: ")); display.print(scoreP2);
        display.drawFastHLine(0, 9, 128, SSD1306_WHITE);

        for (int y = 10; y < 64; y += 6) display.drawFastVLine(64, y, 3, SSD1306_WHITE);

        display.fillRect(2, pongP1Y, 3, 14, SSD1306_WHITE);
        display.fillRect(123, pongP2Y, 3, 14, SSD1306_WHITE);
        display.fillRect(pongBallX, pongBallY, 3, 3, SSD1306_WHITE);

        display.display();
        delay(18);
    }
};

#endif // PHONE_OS_MANAGER_H
