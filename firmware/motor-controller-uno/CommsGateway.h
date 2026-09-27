/**
 * ============================================================================
 * PROJECT   : CYBERROVER X — NODE 03: MOTOR CONTROLLER & SOUND BRAIN
 * FILE      : CommsGateway.h
 * PURPOSE   : Serial Gateway to ESP32-S3 (Frame Sync 0xAA 0x55 & CRC-8)
 * MCU       : Arduino Uno (ATmega328P)
 * ============================================================================
 */

#ifndef UNO_COMMS_GATEWAY_H
#define UNO_COMMS_GATEWAY_H

#include <Arduino.h>
#include <SoftwareSerial.h>
#include "Config.h"
#include "CyberProtocol.h"
#include "SoundEngine.h"

enum RxSyncState {
  SYNC_WAIT_BYTE1,
  SYNC_WAIT_BYTE2,
  SYNC_READ_PAYLOAD
};

class CommsGateway {
private:
  SoftwareSerial serialLink;
  RxSyncState    rxState;
  uint8_t        rawBuffer[sizeof(CyberPacket)];
  uint8_t        bufIndex;

  CyberPacket    lastPacket;
  uint8_t        currentMode;
  bool           emergencyStop;
  unsigned long  lastValidPacketMs;

public:
  CommsGateway()
    : serialLink(ESP_RX_PIN, ESP_TX_PIN),
      rxState(SYNC_WAIT_BYTE1), bufIndex(0),
      currentMode(MODE_MANUAL), emergencyStop(false),
      lastValidPacketMs(0) {
    memset(&lastPacket, 0, sizeof(CyberPacket));
  }

  void begin() {
    serialLink.begin(UART_BAUD_S3_TO_UNO);
  }

  // Aggressively kill ALL SoftwareSerial interrupt activity.
  // stopListening() only clears the pin mask — we also disable the
  // entire PCINT2 group and clear any pending flag so Timer 1 PWM
  // on Pins 9/10 runs 100% clean with zero interrupt jitter.
  void pauseListening() {
    serialLink.stopListening();
    PCICR  &= ~(1 << PCIE2);   // Disable PCINT2 group entirely (Port D pins 0-7)
    PCIFR  |=  (1 << PCIF2);   // Clear any pending PCINT2 flag (write 1 to clear)
  }

  void resumeListening() {
    PCICR |= (1 << PCIE2);     // Re-enable PCINT2 group
    serialLink.listen();        // Re-enable Pin 2 mask bit
  }

  bool update(SoundEngine &sound) {
    bool newPacketReceived = false;

    while (serialLink.available() > 0) {
      uint8_t b = serialLink.read();

      switch (rxState) {
        case SYNC_WAIT_BYTE1:
          if (b == UART_SYNC_BYTE_1) rxState = SYNC_WAIT_BYTE2;
          break;

        case SYNC_WAIT_BYTE2:
          if (b == UART_SYNC_BYTE_2) {
            rxState = SYNC_READ_PAYLOAD;
            bufIndex = 0;
          } else {
            rxState = SYNC_WAIT_BYTE1;
          }
          break;

        case SYNC_READ_PAYLOAD:
          rawBuffer[bufIndex++] = b;
          if (bufIndex >= sizeof(CyberPacket)) {
            rxState = SYNC_WAIT_BYTE1;

            CyberPacket temp;
            memcpy(&temp, rawBuffer, sizeof(CyberPacket));

            uint8_t calcCrc = computeCRC8((const uint8_t *)&temp, sizeof(CyberPacket) - sizeof(uint8_t));
            if (calcCrc == temp.crc8) {
              lastPacket = temp;
              lastValidPacketMs = millis();
              currentMode = temp.mode;
              newPacketReceived = true;

              // Remote Mute Switch (Toggle 2)
              sound.setMuted((temp.buttons & BTN_BIT_TOGGLE2) != 0);

              // Emergency Brake (Joy R Switch)
              emergencyStop = (temp.buttons & BTN_BIT_JOY_R_SW) != 0;

              // Tactical Sound Trigger (Push Button 1)
              if (temp.buttons & BTN_BIT_PUSH1) {
                sound.triggerById(temp.rightY);
              }
            }
          }
          break;
      }
    }
    return newPacketReceived;
  }

  bool isTimedOut() const {
    return (millis() - lastValidPacketMs > UART_TIMEOUT_MS);
  }

  const CyberPacket& getPacket() const { return lastPacket; }
  uint8_t getMode() const { return currentMode; }
  bool isEmergencyStop() const { return emergencyStop; }
  unsigned long getLastPacketAge() const { return millis() - lastValidPacketMs; }
};

#endif // UNO_COMMS_GATEWAY_H
