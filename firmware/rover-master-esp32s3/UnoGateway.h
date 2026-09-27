/**
 * ============================================================================
 * PROJECT   : CYBERROVER X — NODE 02: ROVER MASTER (ESP32-S3)
 * FILE      : UnoGateway.h
 * PURPOSE   : Hardware UART1 Gateway to Arduino Uno Motor & Sound Controller
 * MCU       : ESP32-S3
 * ============================================================================
 */

#ifndef S3_UNO_GATEWAY_H
#define S3_UNO_GATEWAY_H

#include <Arduino.h>
#include "Config.h"
#include "CyberProtocol.h"

class UnoGateway {
private:
  HardwareSerial serialLink;

public:
  UnoGateway()
    : serialLink(1) {}

  void begin() {
    serialLink.begin(UNO_UART_BAUD, SERIAL_8N1, UNO_RX_PIN, UNO_TX_PIN);
  }

  void sendPacket(const CyberPacket &packet) {
    serialLink.write(UART_SYNC_BYTE_1);
    serialLink.write(UART_SYNC_BYTE_2);
    serialLink.write((const uint8_t *)&packet, sizeof(CyberPacket));
  }

  void forwardSound(uint8_t soundId, uint8_t activeMode) {
    CyberPacket soundPacket;
    memset(&soundPacket, 0, sizeof(CyberPacket));
    soundPacket.buttons = BTN_BIT_PUSH1;
    soundPacket.rightY = (int8_t)soundId;
    soundPacket.mode = activeMode;
    soundPacket.crc8 = computeCRC8((const uint8_t *)&soundPacket, sizeof(CyberPacket) - sizeof(uint8_t));

    for (int i = 0; i < 3; i++) {
      sendPacket(soundPacket);
      delay(2);
    }
  }
};

#endif // S3_UNO_GATEWAY_H
