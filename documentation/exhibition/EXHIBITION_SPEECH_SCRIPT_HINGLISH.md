# 🎤 CYBERROVER X4.3 — EXHIBITION SPEECH SCRIPT (HINGLISH)
> **🕐 Duration:** 12–15 Minutes | **Event:** Regional Science & Technology Exhibition, Ramgarh  
> **Presenter:** Veer Pratap Saw | **Project:** CyberRover X4.3 Open-Source UGV

---

> [!TIP]
> ### 💡 How to Use This Script:
> * **Bold text** = Emphasis karo, thoda loud aur confident bolo
> * *Italic text* = Pointing / gesture karo rover ya screen ki taraf
> * `[PAUSE]` = 2-3 second ka pause lo, judges ko absorb karne do
> * `[DEMO]` = Live demonstration karo rover pe
> * `[POINT]` = Rover ke us specific part ko physically point karo
> * Har section ke end mein judges se **eye contact** karo

---

## 🔴 PART 1: OPENING & HOOK (1.5 min)

"Namaskar! Respected judges, teachers, aur mere saathiyon..."

Maan lijiye aap ek rescue team ke leader ho. Ramgarh ke kisi underground coal mine mein suddenly methane gas ka leak ho gaya hai. Andar jaana matlab — **seedha death trap**. Na aapko pata ki andar kitni gas hai, na pata ki oxygen level kaisa hai, na pata ki structure collapse hone wala hai ya nahi.

`[PAUSE]`

Aap kya karoge? Insaan ko bhejoge? **NAHI!**

`[PAUSE — pick up the rover and hold it up]`

Aap **YE** bhejoge — **CyberRover X4.3**.

`[PAUSE]`

Ye hai hamara project — **CyberRover X4.3** — ek *Modular Dual-Layer Autonomous Exploration and Environmental Scouting UGV* — yaani Unmanned Ground Vehicle.

Ye rover andar jayega, methane detect karega, carbon monoxide detect karega, air quality check karega, temperature-humidity naaapega, barometric pressure se altitude calculate karega, GPS se exact location batayega — aur ye saari information **1 kilometre se zyaada door** hamare laptop pe real-time aa jayegi — bina ek bhi insaan ko andar bheje.

`[PAUSE]`

Aur sabse important baat — ye koi toy nahi hai, ye koi simple Arduino car nahi hai. Isme **4 alag-alag microcontrollers** hain, **7 environment sensors** hain, long-range **LoRa radio** hai, aur ek puri **tactical ground station software** hai jo SQLite database mein har ek reading save karti hai.

Toh chaliye, main aapko detail mein dikhata hoon ki hamne ye kaise banaya.

---

## 🔵 PART 2: THE PROBLEM — WHY WE BUILT THIS (1.5 min)

"Judges sahab, pehle samajhte hain ki ye project kyun zaroori hai."

Hum Jharkhand mein rehte hain — India ka coal capital. Ramgarh, Dhanbad, Bokaro, Hazaribagh — yahan sab jagah coal mines hain. Aur India mein har saal coal mine accidents mein log marte hain — mostly methane gas explosions aur carbon monoxide poisoning ki wajah se.

`[PAUSE]`

Problem ye hai ki — jab koi mine mein gas leak hota hai, toh pata lagane ke liye insaano ko andar bhejte hain canary method se — jo khud lethal hai. Modern mines mein fixed sensors hote hain, lekin agar collapse hua toh woh sensors bhi destroy ho jaate hain.

Iske alawa — chemical plants mein pipeline leak, post-earthquake collapsed buildings mein survivors dhundhna — ye sab situations hain jahan human entry means human death.

`[PAUSE]`

**CyberRover X4.3 isi problem ka solution hai.**

Ek unmanned robot jo andar jaye, atmosphere scan kare, aur safely bahar se operator ko bata de ki:

* *"Andar methane 700 ADC se upar hai — EXPLOSIVE zone hai, mat jao!"*
* Ya *"Carbon monoxide 850 se upar hai — lethal hai, evacuation start karo!"*
* Ya *"Air quality normal hai, safe entry possible hai."*

---

## 🟢 PART 3: ARCHITECTURE — DUAL-LAYER DESIGN (2 min)

"Ab aate hain architecture pe — aur ye woh cheez hai jo hamara project sabse alag banati hai."

`[POINT to the rover — both layers]`

Zyaadatar student robots mein ek hi Arduino hota hai — uspe motors bhi lage hain, sensors bhi, display bhi. Problem ye hai ki jab DC motors rotate karte hain, toh woh 20 se 40 Ampere current draw karte hain. Itna heavy current **electromagnetic interference (EMI)** paida karta hai jo sensitive gas sensors ke readings corrupt kar deta hai. Aur voltage brownouts se microcontroller reset ho jaata hai.

`[PAUSE]`

Hamne isko solve kiya — **Segregated Dual-Tier Architecture** se.

`[POINT to Layer 1 — bottom deck]`

### Layer 1 — Chassis aur Mobility Deck:
* Sabse neeche hai — **3S Lithium-Ion battery pack** — 11.1 Volt nominal, 12.6 Volt fully charged
* **High-efficiency 5V Buck Converter** — jo poore system ko stable 5V power deta hai
* **ESP32-S3** — ye hai hamara Rover Master brain — isko handheld controller se ESP-NOW protocol pe 100 Hz speed se commands milte hain
* **Arduino Uno** — ye motor controller hai — iske paas hain **2 BTS7960 43-Ampere H-Bridge motor drivers** — jo 4 high-torque DC motors chalate hain
* Aur **3 ultrasonic sensors** — Left, Center, Right — jo obstacle detection karte hain

`[POINT to Layer 2 — upper deck]`

### Layer 2 — Environmental Sensing aur Telemetry Deck:
* Ye completely physically separated hai from motors
* Iska apna **Arduino Nano Master Controller** hai
* Iske paas hain:
  * **MQ-4** — Methane gas sensor
  * **MQ-7** — Carbon Monoxide sensor
  * **MQ-135** — Air Quality / Ammonia / Benzene sensor
  * **DHT11** — Temperature aur Humidity
  * **BMP280** — High-precision barometric pressure sensor — isse altitude bhi milta hai
  * **u-blox NEO-6M GPS** — latitude, longitude, satellite count, speed — sab milta hai
  * **1.3 inch OLED display** — angled binnacle mein mounted — operator bina jhuke dekh sake
  * Aur sabse important — **Reyax RYLR998 LoRa Radio Transceiver** — 868/915 MHz pe — **1 kilometre se zyaada** tak signal jaata hai!

`[PAUSE]`

Toh dekha aapne — motors aur sensors, dono ka apna alag system hai. Motors ki EMI kabhi bhi sensor readings ko affect nahi kar sakti. Yahi hai hamari key innovation.

---

## 🟡 PART 4: POWER GRID — SMART ENGINEERING (1.5 min)

"Power distribution bhi humne bahut carefully design ki hai."

`[POINT to the power area]`

System mein do voltage rails hain:

1. **5V Primary Rail** — ye high-current buck converter se aati hai:
   * Arduino Nano ko power deti hai
   * Teen MQ gas sensors ko power deti hai — har ek approximately **150 milliAmpere** khata hai kyunki unke andar heating coil hai
   * DHT11 ko deti hai
   * ESP32-S3 ko bhi deti hai

2. **3.3V Secondary Rail** — ye ESP32-S3 ke onboard LDO regulator se aati hai:
   * **RYLR998 LoRa Transceiver** ko deti hai — jo transmit karte waqt **120 milliAmpere peak** leta hai
   * **NEO-6M GPS** ko deti hai
   * **BMP280 barometer** ko deti hai
   * **1.3 inch OLED display** ko deti hai

`[PAUSE]`

Ab ek **critical safety rule** batata hoon:

Arduino Nano ka apna 3.3V pin sirf 30 se 50 milliAmpere de sakta hai. Agar hum Nano ke 3.3V pin se LoRa module ko power dete toh — jab bhi LoRa transmit karta, Nano brownout ho jaata ya jal jaata! Isliye hum ESP32-S3 ke strong regulator se 3.3V laa rahe hain.

Aur saari grounds — battery, Nano, ESP32, sensors — sab ek **unified star-ground topology** mein connected hain — taaki ground loops na bane aur gas sensor readings clean rahen.

Aur haan — **battery monitoring** bhi hai! Pin A3 pe ek 0 to 25 Volt precision voltage divider laga hai — 30K aur 7.5K Ohm resistors — jo real-time mein battery voltage naapta hai. Software mein **16x oversampling** aur ek precision **trim factor of 0.852** lagaya hai — jo calibrated digital multimeter ke readings ke saath exactly match karta hai at 12.10 Volts.

---

## 🔴 PART 5: FIRMWARE DEEP-DIVE (2.5 min)

"Ab baat karte hain firmware ki — yaani woh code jo microcontrollers ke andar chal raha hai."

### Node 1 — Handheld Remote Controller
`[POINT to the controller if present]`

Ye ESP32 DevKit V1 pe chalta hai — dual-core processor at 240 MHz.

Humne isme **FreeRTOS** use kiya hai — yaani Real-Time Operating System — jismein:
* **Core 0** pe OLED display render hota hai — 30-40 Hz pe — kyunki I2C slow hai, toh display rendering ko alag core pe daala taaki radio lag na ho
* **Core 1** pe 100 Hz real-time control loop chalta hai — har 10 millisecond pe joystick sample hota hai, packet banata hai, aur ESP-NOW se send hota hai

Joysticks mein **auto-calibration** hai — boot ke time center position note karta hai — taaki physical drift kabhi issue na bane.

Fail-safe bhi hai — **Park Mode switch** — emergency brake — agar controller ka signal 400 millisecond ke liye na mile toh rover apne aap ruk jaata hai.

---

### Node 2 — Rover Master (ESP32-S3)
Ye rover pe baitha hai — ESP-NOW packets receive karta hai, **CRC-8 checksum** verify karta hai, aur validated command ko UART pe Arduino Uno ko forward karta hai at **38400 baud**.

**400 millisecond watchdog failsafe** — agar koi packet nahi aata 400ms mein — FULL STOP command. Safety is non-negotiable.

Ek **WS2812 RGB LED** bhi hai — Green matlab link healthy, Amber matlab degradation, Red matlab failsafe active.

---

### Node 3 — Motor Controller (Arduino Uno)
Ye actual muscle hai rover ka:
* **Dual BTS7960 43-Ampere H-Bridges** control karta hai
* **50 Hz S-Curve acceleration ramping** — yaani motor kabhi 0 se 255 PWM pe jump nahi karta — smoothly accelerate hota hai — isse gearbox teeth protect hote hain aur 20A current spike nahi aata
* **Round-Robin Ultrasonic Radar** — Left, Center, Right sensors ko alternating time-slots mein fire karta hai taaki ek sensor ka echo doosre ko confuse na kare

**Autonomous Navigation bhi hai!**
1. **Manual Mode** — joystick se seedha control
2. **Semi-Auto** — joystick se chalao lekin agar 25cm ke andar obstacle aaye toh automatically brake lag jaata hai
3. **Full Auto** — rover khud chalta hai — **Finite State Machine** — Forward, then Steer Left/Right, then Reverse Escape, then Spin Escape — aur phir aage badhta hai

Aur ek **Non-Blocking Piezo Sound Engine** bhi hai — sirens, sci-fi chirps, horn — sab bina `delay()` function use kiye — pure millis-based frequency tables se.

---

### Node 4 — Layer 2 Environmental Node (Arduino Nano)
`[POINT to the Nano on upper deck]`

Ye sabse critical node hai — isse main thoda detail mein batata hoon:

Iska main loop **100% non-blocking** hai — koi `delay()` nahi hai — kyunki agar GPS serial buffer overflow ho gaya toh satellite data lost ho jayega.

Loop ka structure:
* **Har iteration pe** — GPS NMEA characters padhe jaate hain — SoftwareSerial se — kyunki 64-byte buffer bohot chhota hai
* **Har iteration pe** — LoRa incoming bytes parse hote hain
* **Har 500 millisecond** — saare sensors sample hote hain — MQ-4, MQ-7, MQ-135, DHT11, BMP280, Battery
* **Har 250 millisecond** — OLED display refresh hota hai — 3 pages mein rotate karta hai har 10 second:
  * **Climate Deck** — Temperature, Humidity, Pressure, Altitude
  * **Gas Deck** — Methane, CO, Air Quality — with filled pixel bar meters
  * **GPS Deck** — Latitude, Longitude, Satellites, Fix status
* **Har 1.5 second** — LoRa pe CSV telemetry packet broadcast hota hai:

```
CR43,<packet_number>,<voltage>,<mq4>,<mq7>,<mq135>,<dht_temp>,<dht_humidity>,<bmp_temp>,<pressure>,<altitude>,<gps_fix>,<latitude>,<longitude>,<satellites>,<hdop>,<gps_altitude>,<speed>
```

**18 data fields ek packet mein!** Aur ye 1 kilometre se zyaada distance pe jaata hai — deewaaron ke through, rubble ke through — kyunki LoRa sub-GHz frequency pe kaam karta hai — 868 ya 915 MHz — jo 2.4 GHz Wi-Fi se bohot superior hai penetration mein.

`[PAUSE]`

**Boot animation bhi hai!** — Jab rover start hota hai toh OLED pe procedural **RoboEyes animation** dikhti hai — animated eyes jo blink karti hain, left-right glance karti hain, aur phir wake up hoti hain — zero RAM mein, pure vector graphics se — kyunki Nano ke paas sirf 2KB SRAM hai.

---

## 🟣 PART 6: GROUND STATION SOFTWARE (2 min)

"Ab dekhte hain ki operator ke laptop pe kya chal raha hai."

`[DEMO — open laptop and show the dashboard]`

### Python Backend — `ground_station.py`
Backend Python, Flask, pySerial aur SQLite3 se bana hai.

* **Auto-Discovery** — jab ground station start hoti hai, ye automatically saare COM ports scan karti hai, Bluetooth ports skip karti hai, aur USB-TTL LoRa receiver se auto-connect ho jaati hai at 115200 baud.
* Jab bhi LoRa receiver se `+RCV=` packet aata hai — backend use parse karti hai — RSSI aur SNR extract karti hai — saare 18 tokens unpack karti hai — battery percentage calculate karti hai — aur SQLite database mein millisecond-precision timestamp ke saath save karti hai.

`[POINT to the database stats on screen]`

* **Mission Telemetry Database** — har ek packet saved hai — id, timestamp, packet_id, battery_voltage, mq4_raw, mq7_raw, mq135_raw, temp_c, humidity, dew_point, pressure_hpa, altitude_m, gps_fix, latitude, longitude, satellites, speed_kmh, rssi, snr — **20 columns!**
* Aur **1-Click CSV Export** — judges aap chahein toh abhi download kar sakte hain ek complete mission telemetry report — official stamped CSV file — jismein header mein project name, date, total records — sab printed hai.

### Tactical Web Cockpit — Frontend
`[DEMO — show the dashboard UI features]`

Frontend pure **Vanilla HTML5, CSS3, aur JavaScript** se bana hai — koi framework nahi — raw code.

Features dekhiye:
1. **60 FPS Real-Time Oscilloscope** — HTML5 Canvas pe — 6 channels simultaneously plot hote hain:
   * **Orange** — Methane CH4
   * **Red** — Carbon Monoxide CO
   * **Amber** — Air Quality
   * **White** — G-Force Shock Impact
   * **Green** — Chassis Roll Angle
   * **Cyan** — Chassis Pitch Angle
   * Ye Bézier spline curves hain — smooth mathematical curves — pulsing cursor dots ke saath — military-grade visualization.

2. **Phone HD Camera Feed & Live Metrics** — smartphone mount kiya hai rover pe — MJPEG live streaming — **live latency display (~42ms)** — **hardware FPS counter (30 FPS)** — aur **Auto-Torch** feature — jab ambient light 25 lux se neeche jaata hai toh automatically phone ka flash ON ho jaata hai — mine jaise dark environments ke liye!

3. **3D Artificial Horizon aur Inclinometer** — phone ke gravity sensor se — pitch aur roll angles real-time calculate hote hain — aircraft-style horizon line ke saath — aur **Rollover Hazard warning** agar 40 degree se zyaada tilt ho.

4. **GPS Map** — Leaflet.js based offline tactical map — rover ka position real-time update hota hai (`23.6225057° N, 85.5329254° E`) — breadcrumb trail banta hai — glowing orange beacon pulse — Jharkhand ka state boundary bhi drawn hai.

5. **Gas Danger Hierarchy** — har gas ka:
   * Green badge — SAFE / NORMAL
   * Amber badge — ELEVATED WARNING
   * Red pulsing badge — EXPLOSIVE DANGER ya TOXIC DANGER

6. **Keyboard Hotkeys** — `T` for Torch, `A` for Auto-Torch, `F` for Flip Camera, `S` for Snapshot, `C` for Camera Switch, `P`/`M` for Zoom In/Out, `Z` for Zero Calibrate — single key press se sab control — bina mouse touch kiye.

---

## 🟠 PART 7: HARDWARE ENGINEERING DETAILS (1 min)

"Hardware mounting bhi humne carefully engineer kiya hai."

`[POINT to specific parts on the rover]`

Upper deck ko **4 functional zones** mein divide kiya hai:
* **Zone A — Front** — Gas sensors — MQ-4, MQ-7, MQ-135 — sensing mesh bahar ki taraf — atmosphere sample kar sakein. DHT11 alag rakha hai — kyunki MQ sensors ke andar 150°C heating coil hoti hai — agar DHT11 paas hota toh false temperature readings aate.
* **Zone B — Center** — ESP32-S3 aur Arduino Nano — computing aur power logic
* **Zone C — Rear Upper** — GPS antenna zenith pointing — yaani aasmaan ki taraf — best satellite reception ke liye. Aur LoRa antenna bhi yahan hai.
* **Zone D — Rear Facing** — 1.3" OLED display ek angled binnacle pod mein — 30 to 45 degree tilt — operator bina jhuke dekh sake

`[POINT to standoffs]`

**Koi breadboard nahi hai!** Sab kuch **M3 nylon standoffs** pe mounted hai — 5 se 10mm clearance — vibration dampening — easy servicing — aur koi hot glue nahi!

**Cable routing bhi separated hai** — power cables, motor PWM cables, sensor I2C cables, aur RF antenna cables — sab alag-alag physical channels mein — taaki motor EMI kabhi sensor data corrupt na kare.

---

## 🔵 PART 8: WHAT MAKES US DIFFERENT — COMPARISON (1 min)

"Ab main aapko batata hoon ki yeh conventional student robots se kaise alag hai."

| Feature | Normal Student Robot | Hamara CyberRover X4.3 |
| :--- | :--- | :--- |
| **Architecture** | Ek Arduino pe sab kuch | **4 Microcontrollers** — Segregated Dual-Tier |
| **Communication** | Bluetooth/Wi-Fi — 30 metre max | **LoRa 868 MHz — 1+ Kilometre range** |
| **Display** | 16x2 LCD — flat mounted | **1.3" OLED** — animated RoboEyes — angled binnacle |
| **Ground Station** | Arduino Serial Monitor | **Full Tactical Cockpit** — 60 FPS oscilloscope — SQLite DBMS — CSV Export |
| **Battery Monitoring**| Koi nahi | **Precision voltage divider** — 16x oversampling — 0.852 trim calibration |
| **Safety** | Manual stop only | **400ms watchdog failsafe** — auto-brake — gas danger alerts |
| **Autonomous Mode** | Nahi | **Full FSM** — Forward/Steer/Reverse/Spin Escape |
| **Data Logging** | Koi nahi | **SQLite database** — 20-column schema — millisecond timestamps |

---

## 🟢 PART 9: REAL-WORLD APPLICATIONS (1 min)

"Ye rover kis-kis situation mein use ho sakta hai?"

1. **Underground Coal Mine Safety — Ramgarh, Dhanbad ke coalfields mein:**
   * Methane buildup detect karna before explosive threshold
   * Carbon monoxide detect karna from smoldering coal seams
   * GPS se exact location record karna — rescue teams ko batana ki danger kahan hai

2. **Chemical Plant Inspection:**
   * Pipelines aur storage tanks inspect karna bina human entry ke
   * Ammonia, benzene, VOCs detect karna MQ-135 se

3. **Post-Earthquake Urban Search & Rescue:**
   * Collapsed buildings mein jaana
   * Phone camera se optical reconnaissance — survivors locate karna
   * GPS aur barometric altitude se 3D safe ingress pathways record karna
   * LoRa se data bahar bhejta rehna — jahan Wi-Fi ya mobile network nahi hai

4. **Military & Disaster Reconnaissance — future scope:**
   * Thermal imaging camera payload integration
   * LIDAR-based autonomous SLAM mapping
   * Multi-rover swarm mesh networking

---

## 🔴 PART 10: LIVE DEMONSTRATION (1.5 min)

"Ab aapko live demo dikhata hoon!"

`[DEMO — Turn on the rover]`

* Dekho — OLED pe **RoboEyes animation** aa rahi hai — ye boot ho raha hai
* Ab **Climate Deck** dikh raha hai — Temperature, Humidity, Pressure, Altitude — sab real-time
* **Gas Deck** — MQ-4, MQ-7, MQ-135 — dekhiye bar meters fill ho rahe hain
* **GPS Deck** — satellites search ho rahe hain

`[DEMO — Show ground station on laptop]`

* Laptop pe dekho — LoRa packets aa rahe hain — oscilloscope pe real-time curves dikh rahi hain
* Database mein records badhte ja rahe hain — har 1.5 second pe ek new record
* Gas readings green hain — safe hai — ab agar main lighter gas ya alcohol laata hoon MQ sensor ke paas...

`[DEMO — bring a lighter or hand sanitizer near MQ sensors]`

* **Dekho! ADC value badh gayi! Status ELEVATED ho gaya! Aur agar aur badhe toh RED DANGER ho jayega!**
* Aur dekhiye — ek click mein **CSV report download** — ye judges ke liye official mission log hai!

---

## 🟣 PART 11: CLOSING STATEMENT (1 min)

"Toh judges sahab — summary mein..."

**CyberRover X4.3 sirf ek school project nahi hai — ye ek enterprise-grade exploration platform hai:**
* **4 Microcontrollers** working in harmony
* **7 Environmental Sensors** for atmospheric hazard detection
* **LoRa long-range radio** — 1+ kilometre range through walls and rubble
* **GPS navigation** with satellite tracking
* **SQLite Database** logging every single reading with millisecond precision
* **60 FPS Tactical Cockpit** with oscilloscope, artificial horizon, and live video
* **Autonomous driving** with obstacle avoidance
* **Complete open-source** — MIT License — koi bhi student isko build kar sakta hai

`[PAUSE]`

Ye project prove karta hai ki advanced search-and-rescue robotics — jo normally lakhs rupees ki commercial systems mein milta hai — woh modular open-source architecture se, affordable components se, aur solid engineering thinking se build ho sakta hai.

`[PAUSE]`

Hamara vision hai ki ek din, jab koi mine mein gas leak hoga — toh insaan nahi, CyberRover andar jayega. Jab koi building collapse hogi — toh firefighter nahi, pehle CyberRover jayega scout karne. Aur ek din — hamare Jharkhand ke coal mines mein har jagah aise rovers patrol karenge — aur koi bhi miner kabhi unnecessary risk mein nahi hoga.

`[PAUSE — Make eye contact with judges]`

Judges sahab — yahi hai **CyberRover X4.3** — Thank you!

🙏

---

> [!IMPORTANT]
> ### 📋 QUICK REFERENCE CARD — Rakhna Haath Mein
> *Agar koi specific question aaye toh ye numbers yaad rakhna:*
>
> | Metric | Value |
> | :--- | :--- |
> | **Total Microcontrollers** | 4 (ESP32, ESP32-S3, Uno, Nano) |
> | **Total Sensors** | 7 (MQ-4, MQ-7, MQ-135, DHT11, BMP280, GPS, Voltage) |
> | **Battery** | 3S Li-ion, 11.1V nominal, 12.6V max |
> | **LoRa Range** | 1+ km (868/915 MHz) |
> | **LoRa Baud Rate** | 115200 |
> | **Telemetry Interval** | Every 1.5 seconds |
> | **Packet Fields** | 18 CSV tokens |
> | **Database Columns** | 20 (with timestamp & RSSI) |
> | **Motor Drivers** | 2x BTS7960, 43A each |
> | **Control Link** | ESP-NOW, 100 Hz, CRC-8 verified |
> | **Failsafe Timeout** | 400 ms |
> | **Oscilloscope FPS** | 60 FPS, 6 channels |
> | **OLED Pages** | 3 pages, 10-sec rotation |
> | **ADC Oversampling** | 16x for battery |
> | **Trim Factor** | 0.852 (calibrated at 12.10V) |
> | **Danger: MQ-4** | ≥ 700 ADC |
> | **Danger: MQ-7** | ≥ 850 ADC |
> | **Danger: MQ-135** | ≥ 700 ADC |
> | **Auto-Torch ON** | < 25 lux |
> | **Auto-Torch OFF** | > 65 lux |
> | **Rollover Warning** | > 40° tilt |

---

> [!TIP]
> ### 🎯 TIPS FOR WINNING
> 1. **Confidence** — Har line confident bolo, eye contact rakho.
> 2. **Demo ke waqt** — Judges ko interactive banao — *"Aap ye button dabake dekhiye"*.
> 3. **Technical terms naturally bolo** — CRC-8, LoRa, SQLite, FreeRTOS — judges impress hote hain.
> 4. **Emotionally connect karo** — Jharkhand ke miners ki story batao — ye project log bachane ke liye hai.
> 5. **Agar time kam ho** — Part 7 (Hardware Engineering) aur Part 8 (Comparison table) short karo.
> 6. **Agar time zyaada ho** — Part 5 (Firmware) mein aur detail add karo.
> 7. **Question ka jawab na aaye** — Bolo *"Ye hamari future roadmap mein hai"* — phir future features batao.
