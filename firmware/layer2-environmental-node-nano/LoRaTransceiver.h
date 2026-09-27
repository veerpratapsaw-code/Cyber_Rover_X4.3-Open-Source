/**
 * ============================================================================
 * PROJECT   : CYBERROVER X4.3 — LAYER 2 ENVIRONMENTAL & TELEMETRY NODE
 * FILE      : LoRaTransceiver.h
 * MCU       : Arduino Nano (ATmega328P / 5V / 16MHz)
 * PURPOSE   : Reyax RYLR998 LoRa AT driver for long-range environmental telemetry.
 *             Formats compact CSV packets and dispatches AT+SEND commands over UART.
 *
 * HARDWARE  : RYLR998 TXD -> Nano D0 (RX), direct wire (3.3V OK for Nano)
 *             Nano D1 (TX) -> 1kΩ/2kΩ divider -> RYLR998 RXD (drops 5V to 3.3V)
 *             RYLR998 VDD -> ESP32-S3 3.3V rail (NOT Nano 3.3V!)
 *
 * NOTE      : When ENABLE_LORA_TRANSMISSION is true, the Hardware Serial port
 *             (D0/D1) is exclusively used for LoRa communication. USB Serial
 *             Monitor will NOT work. Set ENABLE_LORA_TRANSMISSION to false and
 *             disconnect the D0 jumper to re-enable Serial Monitor debugging.
 * ============================================================================
 */

#ifndef LORA_TRANSCEIVER_H
#define LORA_TRANSCEIVER_H

#include <Arduino.h>
#include "Config.h"
#include "Sensors.h"

class LoRaTransceiver {
private:
  unsigned long lastTransmission;
  char payloadBuffer[90];

  // Drain any pending bytes from the RYLR998 response (e.g., "+OK\r\n")
  void flushIncoming(uint16_t waitMs = 150) {
    unsigned long start = millis();
    while (millis() - start < waitMs) {
      while (Serial.available()) {
        Serial.read();
      }
    }
  }

public:
  LoRaTransceiver() : lastTransmission(0) {}

  void begin() {
#if ENABLE_LORA_TRANSMISSION
    // Hardware Serial is now dedicated to the RYLR998 LoRa module.
    // All AT commands go over D0/D1 at 115200 baud.

    delay(300); // Wait for RYLR998 power-on self-init

    // Step 1: Check module is alive
    Serial.print(F("AT\r\n"));
    flushIncoming(200);

    // Step 2: Set this rover's LoRa address to 2
    Serial.print(F("AT+ADDRESS=2\r\n"));
    flushIncoming(200);

    // Step 3: Set network group to 6 (must match receiver)
    Serial.print(F("AT+NETWORKID=6\r\n"));
    flushIncoming(200);

    // Step 4: Set RF parameters for best range:
    //   Spreading Factor = 9, Bandwidth = 125kHz (7),
    //   Coding Rate = 1 (4/5), Preamble = 12
    Serial.print(F("AT+PARAMETER=9,7,1,12\r\n"));
    flushIncoming(200);
#endif
  }

  // Parse incoming bytes for +RCV packets (extracts RSSI dBm)
  void updateReceiver(Layer2Telemetry &data) {
#if ENABLE_LORA_TRANSMISSION
    static char rcvBuf[45];
    static uint8_t rcvIdx = 0;

    while (Serial.available() > 0) {
      char c = Serial.read();
      if (c == '\n' || c == '\r') {
        if (rcvIdx > 5) {
          rcvBuf[rcvIdx] = '\0';
          // Check for +RCV=<addr>,<len>,<data>,<RSSI>,<SNR>
          if (strncmp(rcvBuf, "+RCV=", 5) == 0) {
            char *p = strchr(rcvBuf + 5, ','); // after addr
            if (p) {
              p = strchr(p + 1, ','); // after len
              if (p) {
                p = strchr(p + 1, ','); // after data
                if (p) {
                  int rssiVal = atoi(p + 1);
                  if (rssiVal < 0 && rssiVal > -140) {
                    data.loraRssi = rssiVal;
                  }
                }
              }
            }
          }
        }
        rcvIdx = 0;
      } else if (rcvIdx < sizeof(rcvBuf) - 1) {
        rcvBuf[rcvIdx++] = c;
      }
    }
#endif
  }

  // Construct and transmit telemetry packet via RYLR998 AT+SEND command
  bool transmit(Layer2Telemetry &data) {
#if ENABLE_LORA_TRANSMISSION
    if (millis() - lastTransmission < LORA_TRANSMIT_INTERVAL_MS) {
      return false;
    }
    lastTransmission = millis();
    data.packetCount++;

    // -----------------------------------------------------------------------
    // PAYLOAD FORMAT (CSV):
    // CR43,<pkt>,<volt>,<mq4>,<mq7>,<mq135>,<dhtT>,<dhtH>,<bmpT>,<pres>,<alt>,<fix>,<lat>,<lon>,<sat>,<hdop>,<gpsAlt>,<spd>
    // -----------------------------------------------------------------------

    char voltBuf[7];
    char dhtTBuf[7];
    char dhtHBuf[6];
    char bmpTBuf[7];
    char presBuf[10];
    char altBuf[8];
    char hdopBuf[6];
    char gpsAltBuf[8];
    char spdBuf[6];

    dtostrf(data.batteryVoltage, 4, 1, voltBuf);
    dtostrf(data.temperature, 4, 1, dhtTBuf);
    dtostrf(data.humidity, 3, 0, dhtHBuf);
    dtostrf(data.bmpTemperature, 4, 1, bmpTBuf);
    dtostrf(data.bmpPressure, 6, 1, presBuf);
    dtostrf(data.bmpAltitude, 4, 1, altBuf);
    dtostrf(data.hdop, 3, 1, hdopBuf);
    dtostrf(data.gpsAltitude, 4, 1, gpsAltBuf);
    dtostrf(data.gpsSpeedKmH, 3, 1, spdBuf);

    char latBuf[12];
    char lonBuf[12];
    if (data.gpsFix) {
      dtostrf(data.latitude, 8, 5, latBuf);
      dtostrf(data.longitude, 8, 5, lonBuf);
    } else {
      strcpy_P(latBuf, PSTR("0.0"));
      strcpy_P(lonBuf, PSTR("0.0"));
    }

    // Build the CSV payload string
    snprintf_P(payloadBuffer, sizeof(payloadBuffer),
      PSTR("CR43,%lu,%s,%u,%u,%u,%s,%s,%s,%s,%s,%d,%s,%s,%u,%s,%s,%s"),
      data.packetCount,
      voltBuf,
      data.mq4Raw,
      data.mq7Raw,
      data.mq135Raw,
      dhtTBuf,
      dhtHBuf,
      bmpTBuf,
      presBuf,
      altBuf,
      data.gpsFix ? 1 : 0,
      latBuf,
      lonBuf,
      data.satellites,
      hdopBuf,
      gpsAltBuf,
      spdBuf
    );

    uint8_t payloadLen = strlen(payloadBuffer);

    // Send AT+SEND=<address>,<length>,<data>\r\n
    Serial.print(F("AT+SEND="));
    Serial.print(LORA_TARGET_ADDRESS);
    Serial.print(F(","));
    Serial.print(payloadLen);
    Serial.print(F(","));
    Serial.print(payloadBuffer);
    Serial.print(F("\r\n"));

    // Brief pause to let the RYLR998 process the command
    // before we send any more data (non-blocking would require
    // state machine complexity that doesn't fit in ATmega328P RAM)
    delay(50);

    // Drain the "+OK\r\n" response
    while (Serial.available()) {
      Serial.read();
    }

    return true;
#else
    // LoRa disabled: Increment counter silently for the HUD/Console
    if (millis() - lastTransmission >= LORA_TRANSMIT_INTERVAL_MS) {
      lastTransmission = millis();
      data.packetCount++;
    }

    return true;
#endif
  }
};

#endif // LORA_TRANSCEIVER_H
