/**
 * ============================================================================
 * @file BootAnimation.h
 * @brief Boot sequence for CYBERROVER X4 controller.
 *        Stage 1 (600ms min): Official Low-Poly Panther Bitmap Logo
 *        Stage 2: CYBERROVER X4 Screen with Left-to-Right Animated Loading Bar
 * ============================================================================
 */

#ifndef BOOT_ANIMATION_H
#define BOOT_ANIMATION_H

#include <Arduino.h>
#include <Adafruit_SSD1306.h>
#include "bitmaps.h"

void initBootAnimation(Adafruit_SSD1306 *displayPtr);
void showPantherLogo();
void animateCyberroverX4();
void runBootAnimation();

#endif // BOOT_ANIMATION_H
