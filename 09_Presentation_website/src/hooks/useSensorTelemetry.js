import { useState, useEffect } from 'react';

export function useSensorTelemetry() {
  const [telemetry, setTelemetry] = useState({
    mq4Methane: 184, // ADC (MQ-4 Methane CH4)
    mq7CO: 24, // ADC (MQ-7 Carbon Monoxide)
    mq135AirQuality: 210, // ADC (MQ-135 Air Quality)
    temperature: 27.4, // °C (DHT11)
    humidity: 58.2, // % (DHT11)
    baroPressure: 1011.8, // hPa (BMP280)
    altitude: 348, // meters (Ramgarh, Jharkhand elevation)
    batteryVoltage: 11.95, // V (3S Li-Ion Divider)
    gpsLatitude: 23.6345, // °N (Ramgarh District, Jharkhand)
    gpsLongitude: 85.5123, // °E
    gpsAltitude: 348.5, // m
    gpsSatellites: 9,
    gpsFix: '3D DGPS LOCK',
    loraRssi: -76, // dBm (Reyax RYLR998)
    loraSnr: 9.8, // dB
    ultrasonicLeft: 142, // cm
    ultrasonicCenter: 85, // cm
    ultrasonicRight: 168, // cm
    panAngle: 0, // degrees
    tiltAngle: 0, // degrees
    opencvConf: 0.984,
    faceX: 320,
    faceY: 210,
    trackingDelta: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => {
        // Micro-jitter to simulate live hardware sensor ADC noise
        const jitter = (range) => (Math.random() - 0.5) * range;

        const nextMethane = Math.max(20, Math.min(300, Math.round(prev.mq4Methane + jitter(4))));

        return {
          ...prev,
          mq4Methane: nextMethane,
          mq7CO: Math.max(5, Math.min(80, Math.round(prev.mq7CO + jitter(1.5)))),
          mq135AirQuality: Math.max(120, Math.min(450, Math.round(prev.mq135AirQuality + jitter(6)))),
          temperature: Number((prev.temperature + jitter(0.2)).toFixed(1)),
          humidity: Number((prev.humidity + jitter(0.4)).toFixed(1)),
          batteryVoltage: Number((Math.max(11.1, Math.min(12.4, prev.batteryVoltage + jitter(0.02)))).toFixed(2)),
          ultrasonicLeft: Math.max(20, Math.min(250, Math.round(prev.ultrasonicLeft + jitter(6)))),
          ultrasonicCenter: Math.max(15, Math.min(250, Math.round(prev.ultrasonicCenter + jitter(8)))),
          ultrasonicRight: Math.max(20, Math.min(250, Math.round(prev.ultrasonicRight + jitter(6)))),
          opencvConf: Number((Math.max(0.92, Math.min(0.99, prev.opencvConf + jitter(0.01)))).toFixed(3)),
          faceX: Math.round(Math.max(280, Math.min(360, prev.faceX + jitter(8)))),
          faceY: Math.round(Math.max(180, Math.min(240, prev.faceY + jitter(6)))),
          trackingDelta: Math.round(jitter(12))
        };
      });
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  return telemetry;
}
