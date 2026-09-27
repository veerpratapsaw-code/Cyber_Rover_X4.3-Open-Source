/**
 * ============================================================================
 * PROJECT   : CYBERROVER X — NODE 02: ROVER MASTER (ESP32-S3)
 * FILE      : CommsReceiver.h
 * PURPOSE   : 100 Hz Bidirectional ESP-NOW Radio Engine & CRC-8 Validator
 * MCU       : ESP32-S3
 * ============================================================================
 */

#ifndef S3_COMMS_RECEIVER_H
#define S3_COMMS_RECEIVER_H

#include <Arduino.h>
#include <WiFi.h>
#include <esp_now.h>
#include <esp_wifi.h>
#include "Config.h"
#include "CyberProtocol.h"
#include "UnoGateway.h"

class CommsReceiver {
private:
  CyberPacket         lastPacket;
  TelemetryPacket     telemetryPacket;
  uint32_t            rxPacketCount;
  uint32_t            crcErrorCount;
  uint32_t            lastPacketMs;
  int8_t              lastRssi;

  uint8_t             transmitterMac[6];
  bool                transmitterPaired;
  esp_now_peer_info_t txPeerInfo;

  static CommsReceiver* instance;
  UnoGateway*           unoLink;

  #if defined(ESP_IDF_VERSION_MAJOR) && (ESP_IDF_VERSION_MAJOR >= 5)
  static void onDataRecvStatic(const esp_now_recv_info_t *recv_info, const uint8_t *incomingData, int len) {
    if (instance) instance->handleIncoming(recv_info, nullptr, incomingData, len);
  }
  #else
  static void onDataRecvStatic(const uint8_t *mac_addr, const uint8_t *incomingData, int len) {
    if (instance) instance->handleIncoming(nullptr, mac_addr, incomingData, len);
  }
  #endif

  #if defined(ESP_IDF_VERSION_MAJOR) && (ESP_IDF_VERSION_MAJOR >= 5)
  void handleIncoming(const esp_now_recv_info_t *recv_info, const uint8_t *mac_addr, const uint8_t *incomingData, int len)
  #else
  void handleIncoming(const void *recv_info, const uint8_t *mac_addr, const uint8_t *incomingData, int len)
  #endif
  {
    if (len != sizeof(CyberPacket)) return;

    CyberPacket temp;
    memcpy(&temp, incomingData, sizeof(CyberPacket));

    uint8_t calcCrc = computeCRC8((const uint8_t *)&temp, sizeof(CyberPacket) - sizeof(uint8_t));
    if (calcCrc != temp.crc8) {
      crcErrorCount++;
      return;
    }

    #if defined(ESP_IDF_VERSION_MAJOR) && (ESP_IDF_VERSION_MAJOR >= 5)
    if (!transmitterPaired && recv_info) {
      memcpy(transmitterMac, recv_info->src_addr, 6);
      memset(&txPeerInfo, 0, sizeof(esp_now_peer_info_t));
      memcpy(txPeerInfo.peer_addr, transmitterMac, 6);
      txPeerInfo.channel = 0;
      txPeerInfo.encrypt = false;
      if (esp_now_add_peer(&txPeerInfo) == ESP_OK) {
        transmitterPaired = true;
        if (unoLink) unoLink->forwardSound(7, temp.mode); // Sci-Fi Arming Chirp
        Serial.println(F("[ESP-NOW] Paired successfully with Remote Transmitter!"));
      }
    }
    if (recv_info && recv_info->rx_ctrl && recv_info->rx_ctrl->rssi != 0) {
      lastRssi = recv_info->rx_ctrl->rssi;
    }
    #else
    if (!transmitterPaired && mac_addr) {
      memcpy(transmitterMac, mac_addr, 6);
      memset(&txPeerInfo, 0, sizeof(esp_now_peer_info_t));
      memcpy(txPeerInfo.peer_addr, transmitterMac, 6);
      txPeerInfo.channel = 0;
      txPeerInfo.encrypt = false;
      if (esp_now_add_peer(&txPeerInfo) == ESP_OK) {
        transmitterPaired = true;
        if (unoLink) unoLink->forwardSound(7, temp.mode);
        Serial.println(F("[ESP-NOW] Paired successfully with Remote Transmitter!"));
      }
    }
    #endif

    lastPacket = temp;
    rxPacketCount++;
    lastPacketMs = millis();

    // Instantly forward 100 Hz frame to Arduino Uno
    if (unoLink) unoLink->sendPacket(temp);
  }

public:
  CommsReceiver()
    : rxPacketCount(0), crcErrorCount(0), lastPacketMs(0), lastRssi(-55),
      transmitterPaired(false), unoLink(nullptr) {
    memset(&lastPacket, 0, sizeof(CyberPacket));
    memset(&telemetryPacket, 0, sizeof(TelemetryPacket));
    memset(transmitterMac, 0, sizeof(transmitterMac));
    instance = this;
  }

  void begin(UnoGateway &gateway) {
    unoLink = &gateway;

    WiFi.mode(WIFI_STA);
    WiFi.disconnect();
    WiFi.setTxPower(WIFI_POWER_19_5dBm);

    if (esp_now_init() != ESP_OK) {
      Serial.println(F("[ERROR] ESP-NOW Initialization Failed!"));
    } else {
      esp_now_register_recv_cb(onDataRecvStatic);
      Serial.println(F("[OK] ESP-NOW Initialized & Listening @ 100 Hz"));
    }
  }

  void sendTelemetry(uint8_t dL = 255, uint8_t dC = 255, uint8_t dR = 255) {
    if (!transmitterPaired) return;

    telemetryPacket.seq++;
    telemetryPacket.rssi = lastRssi;
    telemetryPacket.roverBatPct = 95;
    telemetryPacket.modeAck = lastPacket.mode;
    telemetryPacket.distLeft = dL;
    telemetryPacket.distCenter = dC;
    telemetryPacket.distRight = dR;

    telemetryPacket.crc8 = 0;
    telemetryPacket.crc8 = computeCRC8((const uint8_t *)&telemetryPacket, sizeof(TelemetryPacket) - sizeof(uint8_t));

    esp_now_send(transmitterMac, (uint8_t *)&telemetryPacket, sizeof(TelemetryPacket));
  }

  uint32_t getLastPacketMs() const { return lastPacketMs; }
  const CyberPacket& getLastPacket() const { return lastPacket; }
  int8_t getRssi() const { return lastRssi; }
  uint32_t getRxCount() const { return rxPacketCount; }
};

#endif // S3_COMMS_RECEIVER_H
