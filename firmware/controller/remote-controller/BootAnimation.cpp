/**
 * ============================================================================
 * @file BootAnimation.cpp
 * @brief Boot animation controller for SSD1306 OLED.
 *        - Stage 1: Low-Poly Panther Bitmap Logo (Minimum 600ms hold)
 *        - Stage 2: CYBERROVER X4 Screen with Left-to-Right Animated Progress Bar
 * ============================================================================
 */

#include <Arduino.h>
#include <Adafruit_SSD1306.h>
#include "BootAnimation.h"
#include "bitmaps.h"

static Adafruit_SSD1306 *s_display = NULL;

void initBootAnimation(Adafruit_SSD1306 *displayPtr) {
    s_display = displayPtr;
}

/**
 * @brief STAGE 1: Shows official Low-Poly Panther Logo (epd_bitmap_3) for minimum 600ms.
 */
void showPantherLogo() {
    if (!s_display) return;
    s_display->clearDisplay();
    s_display->drawBitmap(0, 0, bitmap_panther_logo, 128, 64, SSD1306_WHITE);
    s_display->display();
}

/**
 * @brief STAGE 2: Shows "CYBERROVER X4" title with a bottom loading bar completing from left to right.
 */
void animateCyberroverX4() {
    if (!s_display) return;

    const uint32_t fillDurationMs = 400; // Smooth 400ms progress bar animation
    uint32_t startMs = millis();

    while (true) {
        uint32_t elapsed = millis() - startMs;
        if (elapsed > fillDurationMs) elapsed = fillDurationMs;

        s_display->clearDisplay();

        // 1. Sleek Outer Border Frame
        s_display->drawRect(0, 0, 128, 64, SSD1306_WHITE);

        // 2. Main Title Header: "CYBERROVER"
        s_display->setTextSize(2);
        s_display->setTextColor(SSD1306_WHITE);
        s_display->setCursor(4, 6);
        s_display->print(F("CYBERROVER"));

        // 3. Highlighted Inverted "X4" Model Badge
        s_display->fillRect(46, 26, 36, 16, SSD1306_WHITE);
        s_display->setTextSize(2);
        s_display->setTextColor(SSD1306_BLACK);
        s_display->setCursor(52, 27);
        s_display->print(F("X4"));

        // 4. Outer Progress Bar Frame at Bottom (Y=48)
        s_display->drawRect(8, 48, 112, 9, SSD1306_WHITE);

        // 5. Calculate & Draw Progress Fill from Left to Right (0 to 108 px)
        int fillWidth = (int)((elapsed * 108) / fillDurationMs);
        if (fillWidth > 108) fillWidth = 108;
        if (fillWidth > 0) {
            s_display->fillRect(10, 50, fillWidth, 5, SSD1306_WHITE);
        }

        s_display->display();

        if (elapsed >= fillDurationMs) break;
        delay(15); // ~60 FPS smooth progress fill
    }

    delay(100); // Brief 100ms hold at 100% completion before transitioning to UI
}

/**
 * @brief MASTER BOOT SEQUENCE RUNNER
 */
void runBootAnimation() {
    if (!s_display) return;

    // 1. Display Panther Bitmap Logo for minimum 600ms
    showPantherLogo();
    delay(600);

    // 2. Display "CYBERROVER X4" title with left-to-right animated loading bar
    animateCyberroverX4();

    // 3. Transitions directly into the main telemetry UI!
}
