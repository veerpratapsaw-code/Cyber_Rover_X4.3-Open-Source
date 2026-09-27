/**
 * @file InputManager.h
 * @brief Non-blocking digital input debouncer, edge detector, and state packager
 *        for Push Button 1 (GPIO13), Push Button 2 (GPIO12), Toggle 1 (GPIO27), and Toggle 2 (GPIO14).
 *        Configurable logic inversion for push buttons and toggle switches.
 */

#ifndef INPUT_MANAGER_H
#define INPUT_MANAGER_H

#include <Arduino.h>
#include "Config.h"
#include "Types.h"

class InputManager {
private:
    InputButton btnPush1;
    InputButton btnPush2;
    InputButton btnToggle1;
    InputButton btnToggle2;

    void initButton(InputButton &btn, uint8_t pin, bool invertLogic) {
        btn.pin = pin;
        pinMode(pin, INPUT_PULLUP);

        // Read physical pin initial state according to invert flag
        bool pinLow = (digitalRead(pin) == LOW);
        bool isPressed = invertLogic ? !pinLow : pinLow;

        btn.debouncedState = isPressed;
        btn.rawState = isPressed;
        btn.lastDebouncedState = isPressed;
        btn.justPressed = false;
        btn.justReleased = false;
        btn.lastDebounceMs = millis();
        btn.pressStartMs = 0;
    }

    void updateButton(InputButton &btn, bool invertLogic) {
        // Read raw input with optional inversion support
        bool pinLow = (digitalRead(btn.pin) == LOW);
        bool currentRaw = invertLogic ? !pinLow : pinLow;
        uint32_t now = millis();

        // Reset single-frame edge triggers
        btn.justPressed = false;
        btn.justReleased = false;

        // Check if raw pin state changed
        if (currentRaw != btn.rawState) {
            btn.lastDebounceMs = now;
            btn.rawState = currentRaw;
        }

        // Apply non-blocking software debounce timer
        if ((now - btn.lastDebounceMs) >= BUTTON_DEBOUNCE_MS) {
            if (currentRaw != btn.debouncedState) {
                btn.debouncedState = currentRaw;

                if (btn.debouncedState) {
                    btn.justPressed = true;
                    btn.pressStartMs = now;
                } else {
                    btn.justReleased = true;
                }
            }
        }
    }

public:
    InputManager() {}

    void begin() {
        initButton(btnPush1, PIN_PUSH_1, INVERT_PUSH_BUTTONS);
        initButton(btnPush2, PIN_PUSH_2, INVERT_PUSH_BUTTONS);
        initButton(btnToggle1, PIN_TOGGLE_1, INVERT_TOGGLE_SWITCHES);
        initButton(btnToggle2, PIN_TOGGLE_2, INVERT_TOGGLE_SWITCHES);
    }

    /**
     * @brief Periodic non-blocking button update loop.
     */
    void update() {
        updateButton(btnPush1, INVERT_PUSH_BUTTONS);
        updateButton(btnPush2, INVERT_PUSH_BUTTONS);
        updateButton(btnToggle1, INVERT_TOGGLE_SWITCHES);
        updateButton(btnToggle2, INVERT_TOGGLE_SWITCHES);
    }

    /**
     * @brief Packs all digital buttons and switches into a 16-bit bitmask.
     */
    uint16_t getButtonsMask(bool jsLeftSw = false, bool jsRightSw = false) const {
        uint16_t mask = 0;
        if (btnPush1.debouncedState)   mask |= BTN_BIT_PUSH1;
        if (btnPush2.debouncedState)   mask |= BTN_BIT_PUSH2;
        if (btnToggle1.debouncedState) mask |= BTN_BIT_TOGGLE1;
        if (btnToggle2.debouncedState) mask |= BTN_BIT_TOGGLE2;
        if (jsLeftSw)                  mask |= BTN_BIT_JOY_L_SW;
        if (jsRightSw)                 mask |= BTN_BIT_JOY_R_SW;
        return mask;
    }

    // Individual State Getters (Pressed = true, Released = false)
    inline bool isPush1Pressed() const { return btnPush1.debouncedState; }
    inline bool isPush2Pressed() const { return btnPush2.debouncedState; }
    inline bool isPush1JustPressed() const { return btnPush1.justPressed; }
    inline bool isPush2JustPressed() const { return btnPush2.justPressed; }

    inline bool isToggle1Active() const { return btnToggle1.debouncedState; }
    inline bool isToggle2Active() const { return btnToggle2.debouncedState; }

    inline bool anyButtonJustPressed(bool jsLJust = false, bool jsRJust = false) const {
        return btnPush1.justPressed || btnPush2.justPressed || 
               btnToggle1.justPressed || btnToggle2.justPressed ||
               jsLJust || jsRJust;
    }
};

#endif // INPUT_MANAGER_H
