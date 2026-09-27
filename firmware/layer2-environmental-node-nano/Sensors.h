/**
 * ============================================================================
 * PROJECT   : CYBERROVER X4.3 — LAYER 2 ENVIRONMENTAL & TELEMETRY NODE
 * FILE      : Sensors.h
 * MCU       : Arduino Nano (ATmega328P / 5V / 16MHz)
 * PURPOSE   : Unified non-blocking sensor acquisition engine with multi-sample
 *             ADC filtering for battery voltage and analog gas sensors.
 * ============================================================================
 */

#ifndef SENSORS_H
#define SENSORS_H

#include <Arduino.h>
#include <Wire.h>
#include <SoftwareSerial.h>
#include <DHT.h>
#include <TinyGPSPlus.h>
#include "Config.h"

// ============================================================================
// TELEMETRY DATA STRUCTURE
// ============================================================================

struct Layer2Telemetry {
  // Gas Sensors (Raw 10-bit ADC: 0..1023)
  uint16_t mq4Raw;
  uint16_t mq7Raw;
  uint16_t mq135Raw;
  bool     mq4Alert;
  bool     mq7Alert;
  bool     mq135Alert;

  // Battery Diagnostics (3S Li-ion / LiPo)
  uint16_t batteryRaw;
  float    batteryVoltage;
  uint8_t  batteryPercent;
  bool     batteryLow;

  // LoRa Signal Quality
  int16_t  loraRssi;

  // Climate (DHT11)
  float    temperature;    // °C (from DHT11)
  float    humidity;       // %  (from DHT11)
  bool     dhtValid;

  // Barometer & Altimetry (BMP280)
  float    bmpPressure;    // hPa (from BMP280)
  float    bmpTemperature; // °C  (from BMP280)
  float    bmpAltitude;    // meters MSL (from BMP280)
  bool     bmpValid;

  // Positioning & Navigation (u-blox NEO-6M)
  bool     gpsFix;
  double   latitude;
  double   longitude;
  uint8_t  satellites;
  float    hdop;
  float    gpsAltitude;    // meters MSL (from GPS)
  float    gpsSpeedKmH;    // km/h

  // Telemetry Sequence Counter
  uint32_t packetCount;
};

// ============================================================================
// NATIVE LIGHTWEIGHT BMP280 DRIVER (ZERO EXTERNAL LIBRARIES)
// ============================================================================
class NativeBMP280 {
private:
  uint8_t i2cAddr;
  int32_t t_fine;

  // Calibration Parameters (Bosch NVM)
  uint16_t dig_T1;
  int16_t  dig_T2, dig_T3;
  uint16_t dig_P1;
  int16_t  dig_P2, dig_P3, dig_P4, dig_P5, dig_P6, dig_P7, dig_P8, dig_P9;

  void writeReg(uint8_t reg, uint8_t val) {
    Wire.beginTransmission(i2cAddr);
    Wire.write(reg);
    Wire.write(val);
    Wire.endTransmission();
  }

  uint8_t readReg(uint8_t reg) {
    Wire.beginTransmission(i2cAddr);
    Wire.write(reg);
    Wire.endTransmission(false);
    Wire.requestFrom(i2cAddr, (uint8_t)1);
    return Wire.available() ? Wire.read() : 0;
  }

public:
  NativeBMP280() : i2cAddr(0x76), t_fine(0) {}

  bool begin() {
    i2cAddr = 0x76;
    uint8_t id = readReg(0xD0);
    if (id != 0x58 && id != 0x60) {
      i2cAddr = 0x77;
      id = readReg(0xD0);
      if (id != 0x58 && id != 0x60) {
        return false;
      }
    }

    Wire.beginTransmission(i2cAddr);
    Wire.write(0x88);
    Wire.endTransmission(false);
    Wire.requestFrom(i2cAddr, (uint8_t)24);

    if (Wire.available() < 24) return false;

    dig_T1 = Wire.read() | (Wire.read() << 8);
    dig_T2 = Wire.read() | (Wire.read() << 8);
    dig_T3 = Wire.read() | (Wire.read() << 8);
    dig_P1 = Wire.read() | (Wire.read() << 8);
    dig_P2 = Wire.read() | (Wire.read() << 8);
    dig_P3 = Wire.read() | (Wire.read() << 8);
    dig_P4 = Wire.read() | (Wire.read() << 8);
    dig_P5 = Wire.read() | (Wire.read() << 8);
    dig_P6 = Wire.read() | (Wire.read() << 8);
    dig_P7 = Wire.read() | (Wire.read() << 8);
    dig_P8 = Wire.read() | (Wire.read() << 8);
    dig_P9 = Wire.read() | (Wire.read() << 8);

    writeReg(0xF4, 0x57); // normal mode, temp x2, pressure x16
    writeReg(0xF5, 0x10); // filter x16, standby 125ms

    return true;
  }

  bool readMetrics(float &temperature, float &pressure, float &altitude) {
    Wire.beginTransmission(i2cAddr);
    Wire.write(0xF7);
    Wire.endTransmission(false);
    Wire.requestFrom(i2cAddr, (uint8_t)6);

    if (Wire.available() < 6) return false;

    uint32_t p_raw = ((uint32_t)Wire.read() << 12) | ((uint32_t)Wire.read() << 4) | (Wire.read() >> 4);
    uint32_t t_raw = ((uint32_t)Wire.read() << 12) | ((uint32_t)Wire.read() << 4) | (Wire.read() >> 4);

    // Compensate Temperature
    int32_t var1 = ((((t_raw >> 3) - ((int32_t)dig_T1 << 1))) * ((int32_t)dig_T2)) >> 11;
    int32_t var2 = (((((t_raw >> 4) - ((int32_t)dig_T1)) * ((t_raw >> 4) - ((int32_t)dig_T1))) >> 12) * ((int32_t)dig_T3)) >> 14;
    t_fine = var1 + var2;
    int32_t T = (t_fine * 5 + 128) >> 8;
    temperature = (float)T / 100.0f;

    // Compensate Pressure
    int64_t p_var1 = ((int64_t)t_fine) - 128000;
    int64_t p_var2 = p_var1 * p_var1 * (int64_t)dig_P6;
    p_var2 = p_var2 + ((p_var1 * (int64_t)dig_P5) << 17);
    p_var2 = p_var2 + (((int64_t)dig_P4) << 35);
    p_var1 = ((p_var1 * p_var1 * (int64_t)dig_P3) >> 8) + ((p_var1 * (int64_t)dig_P2) << 12);
    p_var1 = (((((int64_t)1) << 47) + p_var1)) * ((int64_t)dig_P1) >> 33;

    if (p_var1 == 0) {
      pressure = 0.0f;
      altitude = 0.0f;
      return false;
    }

    int64_t p = 1048576 - p_raw;
    p = (((p << 31) - p_var2) * 3125) / p_var1;
    p_var1 = (((int64_t)dig_P9) * (p >> 13) * (p >> 13)) >> 25;
    p_var2 = (((int64_t)dig_P8) * p) >> 19;
    p = ((p + p_var1 + p_var2) >> 8) + (((int64_t)dig_P7) << 4);

    pressure = ((float)p / 256.0f) / 100.0f; // in hPa

    if (pressure > 300.0f && pressure < 1100.0f) {
      altitude = 44330.0f * (1.0f - pow(pressure / 1013.25f, 0.1903f));
    } else {
      altitude = 0.0f;
    }

    return true;
  }
};

// ============================================================================
// HARDWARE DRIVER INSTANCES
// ============================================================================

static DHT dhtSensor(PIN_DHT_DATA, DHT11);
static SoftwareSerial gpsSerial(PIN_GPS_RX, PIN_GPS_TX);
static TinyGPSPlus gpsCore;
static NativeBMP280 bmpSensor;

class SensorSuite {
private:
  // Helper to average multiple analog samples for noise rejection
  uint16_t averageAnalogRead(uint8_t pin, uint8_t samples = 8) {
    uint32_t sum = 0;
    for (uint8_t i = 0; i < samples; i++) {
      sum += analogRead(pin);
      delayMicroseconds(50);
    }
    return (uint16_t)(sum / samples);
  }

public:
  bool bmpInitialized;

  SensorSuite() : bmpInitialized(false) {}

  void begin() {
    pinMode(PIN_MQ4, INPUT);
    pinMode(PIN_MQ7, INPUT);
    pinMode(PIN_MQ135, INPUT);
    pinMode(PIN_BATTERY, INPUT);
    analogReference(DEFAULT);

    dhtSensor.begin();
    gpsSerial.begin(GPS_BAUD_RATE);

    Wire.begin();
    bmpInitialized = bmpSensor.begin();
  }

  void updateGPSStream() {
    while (gpsSerial.available() > 0) {
      gpsCore.encode(gpsSerial.read());
    }
  }

  void sampleAll(Layer2Telemetry &data) {
    // ------------------------------------------------------------------------
    // 1. Gas Readings (4x oversampled for noise immunity)
    // ------------------------------------------------------------------------
    data.mq4Raw   = averageAnalogRead(PIN_MQ4, 4);
    data.mq7Raw   = averageAnalogRead(PIN_MQ7, 4);
    data.mq135Raw = averageAnalogRead(PIN_MQ135, 4);

    data.mq4Alert   = (data.mq4Raw   >= MQ4_ALERT_THRESHOLD);
    data.mq7Alert   = (data.mq7Raw   >= MQ7_ALERT_THRESHOLD);
    data.mq135Alert = (data.mq135Raw >= MQ135_ALERT_THRESHOLD);

    // ------------------------------------------------------------------------
    // 2. Battery Voltage (16x oversampled to eliminate jitter)
    // ------------------------------------------------------------------------
    data.batteryRaw = averageAnalogRead(PIN_BATTERY, 16);
    float adcVolts  = (data.batteryRaw * ADC_REFERENCE_VOLTAGE) / 1023.0f;
    data.batteryVoltage = adcVolts * VOLTAGE_DIVIDER_RATIO * BATTERY_CALIBRATION_TRIM;

    // Fuel Gauge Percentage Calculation
    if (data.batteryVoltage >= BATTERY_FULL_VOLTAGE) {
      data.batteryPercent = 100;
    } else if (data.batteryVoltage <= BATTERY_CRIT_VOLTAGE) {
      data.batteryPercent = 0;
    } else {
      data.batteryPercent = (uint8_t)(((data.batteryVoltage - BATTERY_CRIT_VOLTAGE) /
                                       (BATTERY_FULL_VOLTAGE - BATTERY_CRIT_VOLTAGE)) * 100.0f);
    }
    data.batteryLow = (data.batteryVoltage <= BATTERY_WARN_VOLTAGE);

    // ------------------------------------------------------------------------
    // 3. DHT11 Climate Acquisition
    // ------------------------------------------------------------------------
    float h = dhtSensor.readHumidity();
    float t = dhtSensor.readTemperature();
    if (!isnan(h) && !isnan(t)) {
      data.humidity    = h;
      data.temperature = t;
      data.dhtValid    = true;
    } else {
      data.dhtValid    = false;
    }

    // ------------------------------------------------------------------------
    // 4. Native BMP280 Barometer & Altitude
    // ------------------------------------------------------------------------
    if (bmpInitialized) {
      data.bmpValid = bmpSensor.readMetrics(data.bmpTemperature, data.bmpPressure, data.bmpAltitude);
    } else {
      data.bmpValid = false;
      data.bmpPressure = 0.0f;
      data.bmpAltitude = 0.0f;
      data.bmpTemperature = 0.0f;
    }

    // ------------------------------------------------------------------------
    // 5. NEO-6M GPS Receiver
    // ------------------------------------------------------------------------
    data.gpsFix = gpsCore.location.isValid() && (gpsCore.location.age() < 5000);
    if (data.gpsFix) {
      data.latitude  = gpsCore.location.lat();
      data.longitude = gpsCore.location.lng();
    } else {
      data.latitude  = 0.0;
      data.longitude = 0.0;
    }

    data.satellites  = gpsCore.satellites.isValid() ? gpsCore.satellites.value() : 0;
    data.hdop        = gpsCore.hdop.isValid() ? gpsCore.hdop.hdop() : 99.9f;
    data.gpsAltitude = gpsCore.altitude.isValid() ? gpsCore.altitude.meters() : 0.0f;
    data.gpsSpeedKmH = gpsCore.speed.isValid() ? gpsCore.speed.kmph() : 0.0f;
  }
};

#endif // SENSORS_H
