/**
 * ============================================================================
 * PROJECT   : CYBERROVER X4.3 — LAYER 2 ENVIRONMENTAL & TELEMETRY NODE
 * FILE      : DisplayOLED.h
 * MCU       : Arduino Nano (ATmega328P / 5V / 16MHz)
 * PURPOSE   : Ultra-lightweight direct I2C OLED driver (SSD1306 & SH1106).
 *             Zero RAM buffer overhead (saves 1,024 bytes SRAM).
 *             Rotates screens every 10 seconds showing all sensor parameters.
 * ============================================================================
 */

#ifndef DISPLAY_OLED_H
#define DISPLAY_OLED_H

#include <Arduino.h>
#include <Wire.h>
#include <avr/pgmspace.h>
#include "Config.h"
#include "Sensors.h"

// Compact 5x7 ASCII font table
static const uint8_t FONT5x7[] PROGMEM = {
  0x00, 0x00, 0x00, 0x00, 0x00, // 32 ' '
  0x00, 0x00, 0x5F, 0x00, 0x00, // 33 '!'
  0x00, 0x07, 0x00, 0x07, 0x00, // 34 '"'
  0x14, 0x7F, 0x14, 0x7F, 0x14, // 35 '#'
  0x24, 0x2A, 0x7F, 0x2A, 0x12, // 36 '$'
  0x23, 0x13, 0x08, 0x64, 0x62, // 37 '%'
  0x36, 0x49, 0x55, 0x22, 0x50, // 38 '&'
  0x00, 0x05, 0x03, 0x00, 0x00, // 39 '''
  0x00, 0x1C, 0x22, 0x41, 0x00, // 40 '('
  0x00, 0x41, 0x22, 0x1C, 0x00, // 41 ')'
  0x14, 0x08, 0x3E, 0x08, 0x14, // 42 '*'
  0x08, 0x08, 0x3E, 0x08, 0x08, // 43 '+'
  0x00, 0x50, 0x30, 0x00, 0x00, // 44 ','
  0x08, 0x08, 0x08, 0x08, 0x08, // 45 '-'
  0x00, 0x60, 0x60, 0x00, 0x00, // 46 '.'
  0x20, 0x10, 0x08, 0x04, 0x02, // 47 '/'
  0x3E, 0x51, 0x49, 0x45, 0x3E, // 48 '0'
  0x00, 0x42, 0x7F, 0x40, 0x00, // 49 '1'
  0x42, 0x61, 0x51, 0x49, 0x46, // 50 '2'
  0x21, 0x41, 0x45, 0x4B, 0x31, // 51 '3'
  0x18, 0x14, 0x12, 0x7F, 0x10, // 52 '4'
  0x27, 0x45, 0x45, 0x45, 0x39, // 53 '5'
  0x3C, 0x4A, 0x49, 0x49, 0x30, // 54 '6'
  0x01, 0x71, 0x09, 0x05, 0x03, // 55 '7'
  0x36, 0x49, 0x49, 0x49, 0x36, // 56 '8'
  0x06, 0x49, 0x49, 0x29, 0x1E, // 57 '9'
  0x00, 0x36, 0x36, 0x00, 0x00, // 58 ':'
  0x00, 0x56, 0x36, 0x00, 0x00, // 59 ';'
  0x08, 0x14, 0x22, 0x41, 0x00, // 60 '<'
  0x14, 0x14, 0x14, 0x14, 0x14, // 61 '='
  0x00, 0x41, 0x22, 0x14, 0x08, // 62 '>'
  0x02, 0x01, 0x51, 0x09, 0x06, // 63 '?'
  0x32, 0x49, 0x79, 0x41, 0x3E, // 64 '@'
  0x7E, 0x11, 0x11, 0x11, 0x7E, // 65 'A'
  0x7F, 0x49, 0x49, 0x49, 0x36, // 66 'B'
  0x3E, 0x41, 0x41, 0x41, 0x22, // 67 'C'
  0x7F, 0x41, 0x41, 0x22, 0x1C, // 68 'D'
  0x7F, 0x49, 0x49, 0x49, 0x41, // 69 'E'
  0x7F, 0x09, 0x09, 0x09, 0x01, // 70 'F'
  0x3E, 0x41, 0x49, 0x49, 0x7A, // 71 'G'
  0x7F, 0x08, 0x08, 0x08, 0x7F, // 72 'H'
  0x00, 0x41, 0x7F, 0x41, 0x00, // 73 'I'
  0x20, 0x40, 0x41, 0x3F, 0x01, // 74 'J'
  0x7F, 0x08, 0x14, 0x22, 0x41, // 75 'K'
  0x7F, 0x40, 0x40, 0x40, 0x40, // 76 'L'
  0x7F, 0x02, 0x0C, 0x02, 0x7F, // 77 'M'
  0x7F, 0x04, 0x08, 0x10, 0x7F, // 78 'N'
  0x3E, 0x41, 0x41, 0x41, 0x3E, // 79 'O'
  0x7F, 0x09, 0x09, 0x09, 0x06, // 80 'P'
  0x3E, 0x41, 0x51, 0x21, 0x5E, // 81 'Q'
  0x7F, 0x09, 0x19, 0x29, 0x46, // 82 'R'
  0x46, 0x49, 0x49, 0x49, 0x31, // 83 'S'
  0x01, 0x01, 0x7F, 0x01, 0x01, // 84 'T'
  0x3F, 0x40, 0x40, 0x40, 0x3F, // 85 'U'
  0x1F, 0x20, 0x40, 0x20, 0x1F, // 86 'V'
  0x3F, 0x40, 0x38, 0x40, 0x3F, // 87 'W'
  0x63, 0x14, 0x08, 0x14, 0x63, // 88 'X'
  0x07, 0x08, 0x70, 0x08, 0x07, // 89 'Y'
  0x61, 0x51, 0x49, 0x45, 0x43, // 90 'Z'
  0x00, 0x7F, 0x41, 0x41, 0x00, // 91 '['
  0x02, 0x04, 0x08, 0x10, 0x20, // 92 '\'
  0x00, 0x41, 0x41, 0x7F, 0x00, // 93 ']'
  0x04, 0x02, 0x01, 0x02, 0x04, // 94 '^'
  0x40, 0x40, 0x40, 0x40, 0x40, // 95 '_'
  0x00, 0x01, 0x02, 0x04, 0x00, // 96 '`'
  0x20, 0x54, 0x54, 0x54, 0x78, // 97 'a'
  0x7F, 0x48, 0x44, 0x44, 0x38, // 98 'b'
  0x38, 0x44, 0x44, 0x44, 0x20, // 99 'c'
  0x38, 0x44, 0x44, 0x48, 0x7F, // 100 'd'
  0x38, 0x54, 0x54, 0x54, 0x18, // 101 'e'
  0x08, 0x7E, 0x09, 0x01, 0x02, // 102 'f'
  0x08, 0x14, 0x54, 0x54, 0x3C, // 103 'g'
  0x7F, 0x08, 0x04, 0x04, 0x78, // 104 'h'
  0x00, 0x44, 0x7D, 0x40, 0x00, // 105 'i'
  0x20, 0x40, 0x44, 0x3D, 0x00, // 106 'j'
  0x7F, 0x10, 0x28, 0x44, 0x00, // 107 'k'
  0x00, 0x41, 0x7F, 0x40, 0x00, // 108 'l'
  0x7C, 0x04, 0x18, 0x04, 0x78, // 109 'm'
  0x7C, 0x08, 0x04, 0x04, 0x78, // 110 'n'
  0x38, 0x44, 0x44, 0x44, 0x38, // 111 'o'
  0x7C, 0x14, 0x14, 0x14, 0x08, // 112 'p'
  0x08, 0x14, 0x14, 0x18, 0x7C, // 113 'q'
  0x7C, 0x08, 0x04, 0x04, 0x08, // 114 'r'
  0x48, 0x54, 0x54, 0x54, 0x20, // 115 's'
  0x04, 0x3F, 0x44, 0x40, 0x20, // 116 't'
  0x3C, 0x40, 0x40, 0x20, 0x7C, // 117 'u'
  0x1C, 0x20, 0x40, 0x20, 0x1C, // 118 'v'
  0x3C, 0x40, 0x30, 0x40, 0x3C, // 119 'w'
  0x44, 0x28, 0x10, 0x28, 0x44, // 120 'x'
  0x0C, 0x50, 0x50, 0x50, 0x3C, // 121 'y'
  0x44, 0x64, 0x54, 0x4C, 0x44, // 122 'z'
  0x00, 0x08, 0x36, 0x41, 0x00, // 123 '{'
  0x00, 0x00, 0x7F, 0x00, 0x00, // 124 '|'
  0x00, 0x41, 0x36, 0x08, 0x00, // 125 '}'
  0x08, 0x08, 0x2A, 0x1C, 0x08  // 126 '~'
};

class CompactOLED {
private:
  uint8_t i2cAddr;
  bool isSH1106;
  uint8_t currentCol;
  uint8_t currentPage;

  void sendCommand(uint8_t cmd) {
    Wire.beginTransmission(i2cAddr);
    Wire.write(0x00);
    Wire.write(cmd);
    Wire.endTransmission();
  }

public:
  CompactOLED(uint8_t addr = 0x3C, bool sh1106 = false)
    : i2cAddr(addr), isSH1106(sh1106), currentCol(0), currentPage(0) {}

  bool begin() {
    Wire.beginTransmission(i2cAddr);
    if (Wire.endTransmission() != 0) {
      return false;
    }

    sendCommand(0xAE); // Display OFF
    sendCommand(0xD5); sendCommand(0x80);
    sendCommand(0xA8); sendCommand(0x3F);
    sendCommand(0xD3); sendCommand(0x00);
    sendCommand(0x40);
    sendCommand(0x8D); sendCommand(0x14); // Enable Charge Pump
    sendCommand(0x20); sendCommand(0x02); // Page addressing mode

#if OLED_FLIP_180
    sendCommand(0xA1); // Segment remap (flipped)
    sendCommand(0xC8); // COM scan direction (flipped)
#else
    sendCommand(0xA0); // Segment remap (normal upright)
    sendCommand(0xC0); // COM scan direction (normal upright)
#endif

    sendCommand(0xDA); sendCommand(0x12);
    sendCommand(0x81); sendCommand(0xCF);
    sendCommand(0xD9); sendCommand(0xF1);
    sendCommand(0xDB); sendCommand(0x40);
    sendCommand(0xA4);
    sendCommand(0xA6);
    sendCommand(0xAF); // Display ON

    clear();
    return true;
  }

  void setCursor(uint8_t col, uint8_t page) {
    currentCol = col;
    currentPage = page & 0x07;
    uint8_t offsetCol = isSH1106 ? (col + 2) : col;

    sendCommand(0xB0 + currentPage);
    sendCommand(0x00 | (offsetCol & 0x0F));
    sendCommand(0x10 | ((offsetCol >> 4) & 0x0F));
  }

  void clear() {
    for (uint8_t page = 0; page < 8; page++) {
      clearPage(page);
    }
  }

  // Clear 128 columns cleanly in 8 safe 16-byte chunks (no trailing empty I2C packets!)
  void clearPage(uint8_t page) {
    setCursor(0, page);
    for (uint8_t chunk = 0; chunk < 8; chunk++) {
      Wire.beginTransmission(i2cAddr);
      Wire.write(0x40);
      for (uint8_t i = 0; i < 16; i++) {
        Wire.write(0x00);
      }
      Wire.endTransmission();
    }
    currentCol = 0;
  }

  void writeChar(char c) {
    if (c < 32 || c > 126) c = ' ';
    uint16_t offset = (c - 32) * 5;

    Wire.beginTransmission(i2cAddr);
    Wire.write(0x40);
    for (uint8_t i = 0; i < 5; i++) {
      Wire.write(pgm_read_byte(&FONT5x7[offset + i]));
    }
    Wire.write(0x00);
    Wire.endTransmission();
    currentCol += 6;
  }

  void printStr(const char *str) {
    while (*str) writeChar(*str++);
  }

  void printProgmem(const __FlashStringHelper *ifsh) {
    PGM_P p = reinterpret_cast<PGM_P>(ifsh);
    while (1) {
      unsigned char c = pgm_read_byte(p++);
      if (c == 0) break;
      writeChar(c);
    }
  }

  void printNum(int32_t n) {
    char buf[12];
    ltoa(n, buf, 10);
    printStr(buf);
  }

  void printFloat(float val, uint8_t decimals = 1) {
    char buf[12];
    dtostrf(val, 4, decimals, buf);
    printStr(buf);
  }

  void clearLineEnd() {
    if (currentCol >= 128) return;
    uint8_t remaining = 128 - currentCol;
    Wire.beginTransmission(i2cAddr);
    Wire.write(0x40);
    uint8_t inPacket = 0;
    for (uint8_t i = 0; i < remaining; i++) {
      Wire.write(0x00);
      inPacket++;
      if (inPacket >= 24 && i < remaining - 1) {
        Wire.endTransmission();
        Wire.beginTransmission(i2cAddr);
        Wire.write(0x40);
        inPacket = 0;
      }
    }
    Wire.endTransmission();
  }

  // ==========================================================================
  // PROCEDURAL ZERO-RAM ROBOEYES ENGINE (FLUXGARAGE AESTHETIC)
  // Cleanly centered on 128x64 display with safe 16-byte I2C chunking
  // ==========================================================================
  void drawEyeFrame(int8_t xShift, int8_t eyeHeight, bool happyMood) {
    if (eyeHeight < 2) eyeHeight = 2;
    if (eyeHeight > 30) eyeHeight = 30;

    const int16_t xCenterL = 40 + xShift;
    const int16_t xCenterR = 88 + xShift;
    const int16_t halfWidth = 16; // 32 pixels wide eye
    const int16_t halfHeight = eyeHeight / 2;
    const int16_t radius = (halfHeight < 6) ? halfHeight : 6;

    const int16_t xLeftL = xCenterL - halfWidth;
    const int16_t xRightL = xCenterL + halfWidth - 1;
    const int16_t xLeftR = xCenterR - halfWidth;
    const int16_t xRightR = xCenterR + halfWidth - 1;

    const int16_t yTop = 32 - halfHeight;
    const int16_t yBottom = 32 + halfHeight - 1;

    for (uint8_t page = 0; page < 8; page++) {
      int16_t pageY0 = page * 8;
      int16_t pageY1 = pageY0 + 7;

      if (pageY1 < yTop || pageY0 > yBottom) {
        clearPage(page);
        continue;
      }

      setCursor(0, page);

      // Render 128 columns in 8 safe 16-byte I2C transactions
      for (uint8_t chunk = 0; chunk < 8; chunk++) {
        Wire.beginTransmission(i2cAddr);
        Wire.write(0x40);
        uint8_t startX = chunk * 16;

        for (uint8_t i = 0; i < 16; i++) {
          uint8_t x = startX + i;
          uint8_t colByte = 0x00;
          bool inEye = false;
          int16_t dx = 0;

          if (x >= xLeftL && x <= xRightL) {
            dx = abs((int16_t)x - xCenterL);
            inEye = true;
          } else if (x >= xLeftR && x <= xRightR) {
            dx = abs((int16_t)x - xCenterR);
            inEye = true;
          }

          if (inEye) {
            for (uint8_t bit = 0; bit < 8; bit++) {
              int16_t y = pageY0 + bit;
              if (y < yTop || y > yBottom) continue;

              int16_t dy = abs(y - 32);

              // Happy mood: upward curve from bottom eyelid
              if (happyMood && (y >= 28)) {
                int16_t cutHeight = 2 + ((dx * dx) / 36);
                if ((y - 28) > cutHeight) continue;
              }

              // Rounded rectangle check
              if (dx <= (halfWidth - radius) || dy <= (halfHeight - radius)) {
                colByte |= (1 << bit);
              } else {
                int16_t cdx = dx - (halfWidth - radius);
                int16_t cdy = dy - (halfHeight - radius);
                if ((cdx * cdx + cdy * cdy) <= (radius * radius)) {
                  colByte |= (1 << bit);
                }
              }
            }
          }

          Wire.write(colByte);
        }
        Wire.endTransmission();
      }
    }
  }

  // Pure visual boot animation sequence (Zero text, 100% robotic personality)
  void playRoboEyesBoot() {
    clear();
    delay(100);

    // 1. Wake up: eyelids open smoothly from 2px slit to 30px rounded eyes
    const uint8_t wakeH[] = { 2, 6, 12, 20, 26, 30 };
    for (uint8_t i = 0; i < 6; i++) {
      drawEyeFrame(0, wakeH[i], false);
      delay(40);
    }
    delay(200);

    // 2. Natural blink: collapse to 2px, spring open to 30px
    drawEyeFrame(0, 14, false); delay(25);
    drawEyeFrame(0, 2,  false); delay(35);
    drawEyeFrame(0, 16, false); delay(25);
    drawEyeFrame(0, 30, false); delay(200);

    // 3. Curious glance to the left
    const int8_t glanceL[] = { -3, -6, -9 };
    for (uint8_t i = 0; i < 3; i++) {
      drawEyeFrame(glanceL[i], 30, false);
      delay(35);
    }
    delay(300);

    // 4. Smooth sweep across to the right
    const int8_t glanceR[] = { -5, 0, 5, 9 };
    for (uint8_t i = 0; i < 4; i++) {
      drawEyeFrame(glanceR[i], 30, false);
      delay(35);
    }
    delay(300);

    // 5. Return to center
    const int8_t centerR[] = { 5, 0 };
    for (uint8_t i = 0; i < 2; i++) {
      drawEyeFrame(centerR[i], 30, false);
      delay(35);
    }
    delay(150);

    // 6. Friendly happy arc expression
    drawEyeFrame(0, 30, true);
    delay(450);

    // 7. Clean wipe to black
    clear();
    delay(50);
  }

  // ==========================================================================
  // HARDWARE VECTOR DRAWING PRIMITIVES (NO UGLY TEXT CHARACTERS)
  // ==========================================================================

  // Universal Top Status Bar: Battery Voltage at left, Graphical Battery Level Bar at right
  void drawTopBar(float batteryVoltage) {
    uint8_t barBuf[128];
    // Baseline horizontal divider line across the entire row at bit 7
    for (uint8_t i = 0; i < 128; i++) barBuf[i] = 0x80;

    // 1. Pack Voltage text at left starting at col 4 (e.g. "BAT: 11.7V")
    char rawVolt[8];
    dtostrf(batteryVoltage, 4, 1, rawVolt);
    char *vPtr = rawVolt;
    while (*vPtr == ' ') vPtr++; // Trim leading space

    char voltStr[14];
    strcpy(voltStr, "BAT: ");
    strcat(voltStr, vPtr);
    strcat(voltStr, "V");

    uint8_t col = 4;
    for (uint8_t i = 0; voltStr[i] != '\0' && col < 80; i++) {
      char c = voltStr[i];
      uint16_t offset = (c - 32) * 5;
      for (uint8_t b = 0; b < 5; b++) {
        barBuf[col++] |= pgm_read_byte(&FONT5x7[offset + b]);
      }
      col++; // 1px space
    }

    // 2. Graphical Battery Icon at columns 92..120 (fills from 9.6V [0%] to 12.6V [100%])
    float vClamped = batteryVoltage;
    if (vClamped < 9.60f) vClamped = 9.60f;
    if (vClamped > 12.60f) vClamped = 12.60f;

    const uint8_t boxLeft = 92;
    const uint8_t boxRight = 120;
    const uint8_t innerWidth = boxRight - boxLeft - 1; // 27 inner pixels (cols 93 to 119)
    uint8_t fillPixels = (uint8_t)(((vClamped - 9.60f) / 3.00f) * innerWidth + 0.5f);
    if (fillPixels > innerWidth) fillPixels = innerWidth;

    // Outline: Left border (col 92), Right border (col 120)
    barBuf[boxLeft] = 0xFF;
    barBuf[boxRight] = 0xFF;

    // Interior columns (cols 93 to 119):
    // Filled: 0xBD (solid level bar bits 2..5 + top bit 0 & bottom bit 7)
    // Empty:  0x81 (hollow box top bit 0 & bottom bit 7)
    for (uint8_t i = 0; i < innerWidth; i++) {
      uint8_t x = boxLeft + 1 + i;
      if (i < fillPixels) {
        barBuf[x] |= 0xBD;
      } else {
        barBuf[x] |= 0x81;
      }
    }

    // Battery positive terminal nub at col 121, 122 (rows 2..5)
    barBuf[121] |= 0x3C;
    barBuf[122] |= 0x3C;

    // Send complete 128-byte line in 8 safe 16-byte chunks
    setCursor(0, 0);
    for (uint8_t chunk = 0; chunk < 8; chunk++) {
      Wire.beginTransmission(i2cAddr);
      Wire.write(0x40);
      for (uint8_t i = 0; i < 16; i++) {
        Wire.write(barBuf[chunk * 16 + i]);
      }
      Wire.endTransmission();
    }
  }

  // Vector Progress Bar Meter: Draws clean outline rectangle with solid pixel fill
  void drawBarGauge(uint8_t colStart, uint8_t page, uint8_t barWidth, uint16_t val, uint16_t maxVal) {
    setCursor(colStart, page);
    if (val > maxVal) val = maxVal;
    uint8_t innerWidth = (barWidth > 2) ? (barWidth - 2) : 0;
    uint8_t fillWidth = (innerWidth > 0) ? (uint8_t)(((uint32_t)val * innerWidth) / maxVal) : 0;

    uint8_t inPacket = 0;
    Wire.beginTransmission(i2cAddr);
    Wire.write(0x40);

    // Left vertical border (bits 1..6)
    Wire.write(0x7E);
    inPacket++;

    // Meter body
    for (uint8_t i = 0; i < innerWidth; i++) {
      if (inPacket >= 20) {
        Wire.endTransmission();
        Wire.beginTransmission(i2cAddr);
        Wire.write(0x40);
        inPacket = 0;
      }
      Wire.write((i < fillWidth) ? 0x7E : 0x42);
      inPacket++;
    }

    if (inPacket >= 20) {
      Wire.endTransmission();
      Wire.beginTransmission(i2cAddr);
      Wire.write(0x40);
      inPacket = 0;
    }
    // Right vertical border (bits 1..6)
    Wire.write(0x7E);
    Wire.endTransmission();
    currentCol = colStart + barWidth;
  }
};

// ============================================================================
// OPERATOR INSTRUMENT BINNACLE & CARD MANAGER (SPACIOUS & UNCLUTTERED)
// ============================================================================
class DisplayHUD {
private:
  CompactOLED oled;
  uint8_t currentPage;
  unsigned long lastPageSwitch;
  bool ready;

  // CARD 0: Minimalist Climate Deck (Spacious Layout)
  void renderClimatePage(const Layer2Telemetry &data) {
    oled.drawTopBar(data.batteryVoltage);
    oled.clearPage(1); // Breathing space

    // Unified average temperature
    float avgTemp = 0.0f;
    if (data.dhtValid && data.bmpValid) {
      avgTemp = (data.temperature + data.bmpTemperature) * 0.5f;
    } else if (data.dhtValid) {
      avgTemp = data.temperature;
    } else if (data.bmpValid) {
      avgTemp = data.bmpTemperature;
    }

    // Row 1 (Page 2): Temperature
    oled.setCursor(6, 2);
    oled.printProgmem(F("TEMP : "));
    if (data.dhtValid || data.bmpValid) {
      oled.printFloat(avgTemp, 1);
      oled.printProgmem(F(" C"));
    } else {
      oled.printProgmem(F("--.- C"));
    }
    oled.clearLineEnd();

    oled.clearPage(3); // Breathing space

    // Row 2 (Page 4): Humidity
    oled.setCursor(6, 4);
    oled.printProgmem(F("HUM  : "));
    if (data.dhtValid) {
      oled.printFloat(data.humidity, 0);
      oled.printProgmem(F(" %"));
    } else {
      oled.printProgmem(F("-- %"));
    }
    oled.clearLineEnd();

    oled.clearPage(5); // Breathing space

    // Row 3 (Page 6 & 7): Pressure & Altitude
    oled.setCursor(6, 6);
    oled.printProgmem(F("BARO : "));
    if (data.bmpValid) {
      oled.printFloat(data.bmpPressure, 1);
      oled.printProgmem(F(" hPa"));
    } else {
      oled.printProgmem(F("---- hPa"));
    }
    oled.clearLineEnd();

    oled.setCursor(6, 7);
    oled.printProgmem(F("ALT  : "));
    if (data.bmpValid) {
      if (data.bmpAltitude >= 0.0f) oled.printProgmem(F("+"));
      oled.printFloat(data.bmpAltitude, 0);
      oled.printProgmem(F(" m"));
    } else {
      oled.printProgmem(F("--- m"));
    }
    oled.clearLineEnd();
  }

  // CARD 1: Gas Array Deck (Spacious Horizontal Gauges)
  void renderGasPage(const Layer2Telemetry &data) {
    oled.drawTopBar(data.batteryVoltage);
    oled.clearPage(1); // Breathing space

    // MQ-4 Methane / CNG (Page 2)
    oled.setCursor(6, 2);
    oled.printProgmem(F("CH4"));
    oled.drawBarGauge(32, 2, 48, data.mq4Raw, 800);
    oled.setCursor(88, 2);
    oled.printNum(data.mq4Raw);
    oled.clearLineEnd();

    oled.clearPage(3); // Breathing space

    // MQ-7 Carbon Monoxide (Page 4)
    oled.setCursor(6, 4);
    oled.printProgmem(F("CO "));
    oled.drawBarGauge(32, 4, 48, data.mq7Raw, 800);
    oled.setCursor(88, 4);
    oled.printNum(data.mq7Raw);
    oled.clearLineEnd();

    oled.clearPage(5); // Breathing space

    // MQ-135 Air Quality (Page 6)
    oled.setCursor(6, 6);
    oled.printProgmem(F("AQI"));
    oled.drawBarGauge(32, 6, 48, data.mq135Raw, 800);
    oled.setCursor(88, 6);
    oled.printNum(data.mq135Raw);
    oled.clearLineEnd();

    oled.clearPage(7); // Breathing space
  }

  // CARD 2: GPS Navigation Deck (Clean & Legible)
  void renderNavPage(const Layer2Telemetry &data) {
    oled.drawTopBar(data.batteryVoltage);
    oled.clearPage(1); // Breathing space

    // Page 2: Lock Status and Satellite Count
    oled.setCursor(6, 2);
    if (data.gpsFix) {
      oled.printProgmem(F("GPS: 3D FIX"));
    } else {
      oled.printProgmem(F("GPS: SEARCHING"));
    }
    oled.setCursor(80, 2);
    oled.printProgmem(F("["));
    if (data.satellites < 10) oled.printProgmem(F("0"));
    oled.printNum(data.satellites);
    oled.printProgmem(F(" SAT]"));
    oled.clearLineEnd();

    oled.clearPage(3); // Breathing space

    // Page 4: Latitude
    oled.setCursor(6, 4);
    oled.printProgmem(F("LAT: "));
    if (data.gpsFix) {
      oled.printFloat(data.latitude, 5);
      oled.printProgmem(F(" N"));
    } else {
      oled.printProgmem(F("ACQUIRING..."));
    }
    oled.clearLineEnd();

    // Page 5: Longitude
    oled.setCursor(6, 5);
    oled.printProgmem(F("LON: "));
    if (data.gpsFix) {
      oled.printFloat(data.longitude, 5);
      oled.printProgmem(F(" E"));
    } else {
      oled.printProgmem(F("ACQUIRING..."));
    }
    oled.clearLineEnd();

    oled.clearPage(6); // Breathing space

    // Page 7: Altitude & HDOP
    oled.setCursor(6, 7);
    oled.printProgmem(F("ALT: "));
    if (data.gpsFix) {
      oled.printFloat(data.gpsAltitude, 0);
      oled.printProgmem(F("m"));
    } else {
      oled.printProgmem(F("--m"));
    }

    oled.setCursor(72, 7);
    oled.printProgmem(F("HDOP: "));
    if (data.gpsFix) {
      oled.printFloat(data.hdop, 1);
    } else {
      oled.printProgmem(F("--.-"));
    }
    oled.clearLineEnd();
  }

public:
  DisplayHUD()
    : oled(OLED_I2C_ADDRESS, OLED_IS_SH1106),
      currentPage(0),
      lastPageSwitch(0),
      ready(false) {}

  void begin() {
    ready = oled.begin();
    if (ready) {
      oled.playRoboEyesBoot();
    }
  }

  void update(const Layer2Telemetry &data) {
    if (!ready) return;

    if (millis() - lastPageSwitch >= OLED_PAGE_INTERVAL_MS) {
      lastPageSwitch = millis();
      currentPage = (currentPage + 1) % 3;
    }

    switch (currentPage) {
      case 0: renderClimatePage(data); break;
      case 1: renderGasPage(data);     break;
      case 2: renderNavPage(data);     break;
      default: currentPage = 0; renderClimatePage(data); break;
    }
  }
};

#endif // DISPLAY_OLED_H
