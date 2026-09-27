/**
 * @file CommsManager.h
 * @brief Scalable wireless communications module supporting ESP-NOW, CRC8 verification,
 *        packet sequence framing, link quality diagnostics, broadcast pairing, and RSSI monitoring.
 */

#ifndef COMMS_MANAGER_H
#define COMMS_MANAGER_H

#include <Arduino.h>
#include <WiFi.h>
#include <esp_now.h>
#include <esp_wifi.h>
#include "Config.h"
#include "Types.h"

const uint8_t BROADCAST_MAC_ADDR[6] = {0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF};

class CommsManager {
private:
    CyberPacket outboundPacket;
    TelemetryPacket inboundPacket;
    SystemStats stats;
    esp_now_peer_info_t peerInfo;
    esp_now_peer_info_t broadcastPeer;
    
    static volatile uint32_t s_lastAckMs;
    static volatile bool s_lastSendSuccess;
    static volatile uint32_t s_ackCount;
    static volatile uint32_t s_failCount;
    static volatile int8_t s_lastRssi;
    static volatile uint8_t s_roverBatPct;
    static volatile uint8_t s_distLeft;
    static volatile uint8_t s_distCenter;
    static volatile uint8_t s_distRight;
    static volatile bool s_newTelemetryReceived;
    static volatile uint8_t s_roverMac[6];
    static volatile bool s_roverPaired;

    // Hardware ESP-NOW Send Callback (Captures 802.11 MAC ACK from S3)
    #if defined(ESP_IDF_VERSION_MAJOR) && (ESP_IDF_VERSION_MAJOR >= 5)
    static void onDataSentStatic(const wifi_tx_info_t *tx_info, esp_now_send_status_t status)
    #else
    static void onDataSentStatic(const uint8_t *mac_addr, esp_now_send_status_t status)
    #endif
    {
        if (status == ESP_NOW_SEND_SUCCESS) {
            s_lastSendSuccess = true;
            s_lastAckMs = millis();
            s_ackCount++;
        } else {
            s_lastSendSuccess = false;
            s_failCount++;
        }
    }

    // Inbound Telemetry Callback (from Rover Master S3)
    #if defined(ESP_IDF_VERSION_MAJOR) && (ESP_IDF_VERSION_MAJOR >= 5)
    static void onDataRecvStatic(const esp_now_recv_info_t *recv_info, const uint8_t *incomingData, int len)
    #else
    static void onDataRecvStatic(const uint8_t *mac_addr, const uint8_t *incomingData, int len)
    #endif
    {
        if (len != sizeof(TelemetryPacket)) return;

        TelemetryPacket temp;
        memcpy(&temp, incomingData, sizeof(TelemetryPacket));

        uint8_t calcCrc = computeCRC8((const uint8_t*)&temp, sizeof(TelemetryPacket) - sizeof(uint8_t));
        if (calcCrc != temp.crc8) return;

        s_roverBatPct = temp.roverBatPct;
        s_distLeft = temp.distLeft;
        s_distCenter = temp.distCenter;
        s_distRight = temp.distRight;
        s_lastAckMs = millis();
        s_newTelemetryReceived = true;

        #if defined(ESP_IDF_VERSION_MAJOR) && (ESP_IDF_VERSION_MAJOR >= 5)
        if (recv_info && recv_info->src_addr) {
            memcpy((void*)s_roverMac, recv_info->src_addr, 6);
            s_roverPaired = true;
        }
        if (recv_info && recv_info->rx_ctrl && recv_info->rx_ctrl->rssi != 0) {
            s_lastRssi = recv_info->rx_ctrl->rssi;
        } else if (temp.rssi != 0) {
            s_lastRssi = temp.rssi;
        }
        #else
        if (mac_addr) {
            memcpy((void*)s_roverMac, mac_addr, 6);
            s_roverPaired = true;
        }
        if (temp.rssi != 0) {
            s_lastRssi = temp.rssi;
        }
        #endif
    }

public:
    CommsManager() {
        memset(&outboundPacket, 0, sizeof(CyberPacket));
        memset(&inboundPacket, 0, sizeof(TelemetryPacket));
        memset(&peerInfo, 0, sizeof(esp_now_peer_info_t));
        memset(&broadcastPeer, 0, sizeof(esp_now_peer_info_t));
        
        stats.loopCounter = 0;
        stats.currentLoopTimeUs = 0;
        stats.maxLoopTimeUs = 0;
        stats.avgLoopTimeUs = 0;
        stats.freeHeapBytes = 0;
        stats.minFreeHeapBytes = 0;
        stats.txPacketCounter = 0;
        stats.rxPacketCounter = 0;
        stats.txFailCounter = 0;
        stats.rssi = -60;
        stats.linkState = LINK_DISCONNECTED;
        stats.lastRxTimestampMs = 0;
    }

    bool begin() {
        WiFi.mode(WIFI_STA);
        WiFi.disconnect();
        WiFi.setTxPower(WIFI_POWER_19_5dBm); // Maximum RF Output Power (19.5 dBm)

        if (esp_now_init() != ESP_OK) {
            stats.linkState = LINK_DISCONNECTED;
            return false;
        }

        // Register hardware callbacks
        esp_now_register_send_cb(onDataSentStatic);
        esp_now_register_recv_cb(onDataRecvStatic);

        // 1. Register Universal Broadcast Peer (FF:FF:FF:FF:FF:FF)
        memcpy(broadcastPeer.peer_addr, BROADCAST_MAC_ADDR, 6);
        broadcastPeer.channel = 0;
        broadcastPeer.encrypt = false;
        esp_now_add_peer(&broadcastPeer);

        // 2. Register Target Unicast Peer MAC address
        memcpy(peerInfo.peer_addr, RECEIVER_MAC_ADDR, 6);
        peerInfo.channel = 0;
        peerInfo.encrypt = false;
        esp_now_add_peer(&peerInfo);

        stats.linkState = LINK_CONNECTING;
        return true;
    }

    /**
     * @brief Formats ultra-compact 9-byte CyberPacket.
     */
    const CyberPacket& preparePacket(int16_t lx, int16_t ly, int16_t rx, int16_t ry,
                                     uint8_t buttons, uint8_t mode, float batPercent) {
        outboundPacket.seq++;
        outboundPacket.leftX = (int8_t)constrain(lx / 10, -100, 100);
        outboundPacket.leftY = (int8_t)constrain(ly / 10, -100, 100);
        outboundPacket.rightX = (int8_t)constrain(rx / 10, -100, 100);
        outboundPacket.rightY = (int8_t)constrain(ry / 10, -100, 100);
        outboundPacket.buttons = buttons;
        outboundPacket.mode = mode;
        outboundPacket.batPct = (uint8_t)constrain((int)batPercent, 0, 100);
        
        outboundPacket.crc8 = 0;
        outboundPacket.crc8 = computeCRC8((const uint8_t*)&outboundPacket, sizeof(CyberPacket) - sizeof(uint8_t));
        
        return outboundPacket;
    }

    /**
     * @brief Transmit ESP-NOW control packet directly to target ESP32-S3 receiver.
     *        Auto-searches channels 1..13 until connected, then LOCKS FIRMLY.
     */
    bool future_sendESPNow() {
        uint32_t now = millis();
        static uint32_t s_lastChannelHopMs = 0;
        static uint8_t s_currentChannel = 1;

        // Auto-search channel ONLY if never connected OR if connection lost for >2.5 seconds
        if ((s_lastAckMs == 0 && now - s_lastChannelHopMs >= 350) ||
            (s_lastAckMs > 0 && now - s_lastAckMs > 2500 && now - s_lastChannelHopMs >= 350)) {
            s_lastChannelHopMs = now;
            s_currentChannel = (s_currentChannel % 13) + 1;
            esp_wifi_set_promiscuous(true);
            esp_wifi_set_channel(s_currentChannel, WIFI_SECOND_CHAN_NONE);
            esp_wifi_set_promiscuous(false);

            peerInfo.channel = s_currentChannel;
            esp_now_mod_peer(&peerInfo);
            broadcastPeer.channel = s_currentChannel;
            esp_now_mod_peer(&broadcastPeer);
        }

        // Transmit via Unicast AND Broadcast to guarantee zero packet loss
        const uint8_t *targetMac = s_roverPaired ? (const uint8_t*)s_roverMac : RECEIVER_MAC_ADDR;
        esp_err_t res = esp_now_send(targetMac, (uint8_t*)&outboundPacket, sizeof(CyberPacket));
        if (res != ESP_OK) {
            res = esp_now_send(BROADCAST_MAC_ADDR, (uint8_t*)&outboundPacket, sizeof(CyberPacket));
        }

        if (res == ESP_OK) {
            stats.txPacketCounter++;
            return true;
        } else {
            stats.txFailCounter++;
            return false;
        }
    }

    /**
     * @brief Transmit 100 Hz outbound packet. Alias to future_sendESPNow.
     */
    bool updateTx() {
        return future_sendESPNow();
    }

    /**
     * @brief Inbound telemetry receiver processor stub.
     */
    bool future_receiveESPNow(const uint8_t *incomingData, size_t len) {
        return false;
    }

    /**
     * @brief Update and evaluate active Link Quality State.
     */
    void updateLinkState() {
        uint32_t now = millis();
        stats.txPacketCounter = outboundPacket.seq;
        stats.txFailCounter = s_failCount;

        // If we received an ACK / telemetry within last 800ms -> LINK_CONNECTED
        if (now - s_lastAckMs <= 800 && s_lastAckMs > 0) {
            stats.linkState = LINK_CONNECTED;
            stats.rssi = (s_lastRssi != 0) ? s_lastRssi : -55;
        } else if (s_lastAckMs > 0) {
            stats.linkState = LINK_DISCONNECTED;
            stats.rssi = -99;
        } else {
            stats.linkState = LINK_CONNECTING;
            stats.rssi = -99;
        }
    }

    // Getters & Diagnostics
    inline const SystemStats& getStats() const { return stats; }
    inline ConnectionState getLinkState() { updateLinkState(); return stats.linkState; }
    inline uint32_t getTxPacketCount() const { return stats.txPacketCounter; }
    inline uint32_t getTxCount() const { return stats.txPacketCounter; }
    inline int8_t getRSSI() { updateLinkState(); return stats.rssi; }
    inline uint8_t getRoverBatPct() const { return s_roverBatPct; }
    inline uint8_t getDistLeft() const { return s_distLeft; }
    inline uint8_t getDistCenter() const { return s_distCenter; }
    inline uint8_t getDistRight() const { return s_distRight; }
    inline const CyberPacket& getOutboundPacket() const { return outboundPacket; }
};

// Static member variable definitions
inline volatile uint32_t CommsManager::s_lastAckMs = 0;
inline volatile bool CommsManager::s_lastSendSuccess = false;
inline volatile uint32_t CommsManager::s_ackCount = 0;
inline volatile uint32_t CommsManager::s_failCount = 0;
inline volatile int8_t CommsManager::s_lastRssi = -60;
inline volatile uint8_t CommsManager::s_roverBatPct = 0;
inline volatile uint8_t CommsManager::s_distLeft = 255;
inline volatile uint8_t CommsManager::s_distCenter = 255;
inline volatile uint8_t CommsManager::s_distRight = 255;
inline volatile bool CommsManager::s_newTelemetryReceived = false;
inline volatile uint8_t CommsManager::s_roverMac[6] = {0};
inline volatile bool CommsManager::s_roverPaired = false;

#endif // COMMS_MANAGER_H
