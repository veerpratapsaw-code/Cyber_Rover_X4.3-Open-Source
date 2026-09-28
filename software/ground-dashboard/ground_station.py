#!/usr/bin/env python3
"""
CYBERROVER X4.3 - TACTICAL GROUND STATION & SQLite DBMS SERVER
Author: Antigravity & CyberRover Team
Exhibition: Regional Level Science Exhibition, Ramgarh (Sept 2026)

Features:
  - Auto-discovers and connects to USB-TTL LoRa receiver (RYLR998 at 115200 baud).
  - Real-time packet parsing (+RCV / CR43 telemetry envelope).
  - SQLite DBMS persistent storage (mission_telemetry.db) with millisecond timestamps.
  - Built-in Flask HTTP & REST API server (serves dashboard UI & /api/sensors).
  - 1-Click CSV telemetry report generator for exhibition judges.
"""

import os
import sys
import time
import json
import sqlite3
import threading
from datetime import datetime
from flask import Flask, jsonify, request, send_file, send_from_directory, make_response
import serial
import serial.tools.list_ports

# -----------------------------------------------------------------------------
# CONFIGURATION
# -----------------------------------------------------------------------------
DEFAULT_BAUD = 115200
DEFAULT_PORT = None  # None = Auto-detect USB serial
DB_FILENAME = os.path.join(os.path.dirname(os.path.abspath(__file__)), "mission_telemetry.db")
STATIC_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__, static_folder=STATIC_DIR)

# -----------------------------------------------------------------------------
# GLOBAL TELEMETRY STATE (Thread-Safe)
# -----------------------------------------------------------------------------
state_lock = threading.Lock()

current_telemetry = {
    "mq4": 184,
    "mq7": 24,
    "mq135": 210,
    "dht_valid": True,
    "temp_c": 27.4,
    "humidity": 58.2,
    "dew_point_c": 18.2,
    "bmp_valid": True,
    "bmp_temp_c": 27.2,
    "pressure_hpa": 1011.8,
    "altitude_m": 348.0,
    "battery_voltage": 12.1,
    "battery_percent": 83,
    "gps_fix": True,
    "latitude": 23.6225057,
    "longitude": 85.5329254,
    "satellites": 12,
    "hdop": 0.9,
    "gps_altitude": 348.5,
    "speed_kmh": 0.0,
    "rssi": -72,
    "snr": 11,
    "packet_count": 0,
    "last_packet_time": None,
    "link_connected": False,
    "active_port": "None",
    "db_total_records": 0,
    "espConnected": True
}

active_serial = None
serial_thread_running = True

# -----------------------------------------------------------------------------
# DATABASE INITIALIZATION
# -----------------------------------------------------------------------------
def init_db():
    conn = sqlite3.connect(DB_FILENAME)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS mission_telemetry (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            packet_id INTEGER,
            battery_voltage REAL,
            battery_percent INTEGER,
            mq4_raw INTEGER,
            mq7_raw INTEGER,
            mq135_raw INTEGER,
            temp_c REAL,
            humidity REAL,
            dew_point_c REAL,
            pressure_hpa REAL,
            altitude_m REAL,
            gps_fix INTEGER,
            latitude REAL,
            longitude REAL,
            satellites INTEGER,
            hdop REAL,
            speed_kmh REAL,
            rssi INTEGER,
            snr INTEGER
        )
    """)
    conn.commit()
    cur.execute("SELECT COUNT(*) FROM mission_telemetry")
    count = cur.fetchone()[0]
    conn.close()
    print(f"[DBMS] SQLite database ready at: {DB_FILENAME} (Total records: {count})")
    with state_lock:
        current_telemetry["db_total_records"] = count

def insert_telemetry_to_db(data):
    try:
        conn = sqlite3.connect(DB_FILENAME, timeout=5.0)
        cur = conn.cursor()
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
        cur.execute("""
            INSERT INTO mission_telemetry (
                timestamp, packet_id, battery_voltage, battery_percent,
                mq4_raw, mq7_raw, mq135_raw, temp_c, humidity, dew_point_c,
                pressure_hpa, altitude_m, gps_fix, latitude, longitude,
                satellites, hdop, speed_kmh, rssi, snr
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            now_str,
            data.get("packet_count", 0),
            data.get("battery_voltage", 0.0),
            data.get("battery_percent", 0),
            data.get("mq4", 0),
            data.get("mq7", 0),
            data.get("mq135", 0),
            data.get("temp_c", 0.0),
            data.get("humidity", 0.0),
            data.get("dew_point_c", 0.0),
            data.get("pressure_hpa", 1013.25),
            data.get("altitude_m", 0.0),
            1 if data.get("gps_fix") else 0,
            data.get("latitude", 0.0),
            data.get("longitude", 0.0),
            data.get("satellites", 0),
            data.get("hdop", 99.9),
            data.get("speed_kmh", 0.0),
            data.get("rssi", -99),
            data.get("snr", 0)
        ))
        conn.commit()
        cur.execute("SELECT COUNT(*) FROM mission_telemetry")
        count = cur.fetchone()[0]
        conn.close()
        with state_lock:
            current_telemetry["db_total_records"] = count
    except Exception as e:
        print(f"[DBMS ERROR] Failed to log telemetry: {e}")

# -----------------------------------------------------------------------------
# TELEMETRY PACKET PARSER
# -----------------------------------------------------------------------------
def parse_telemetry_line(raw_line):
    line = raw_line.strip()
    if not line:
        return False

    rssi_val = -70
    snr_val = 30
    payload_str = ""

    # Check for RYLR998 packet: +RCV=<addr>,<len>,<data...>,<rssi>,<snr>
    if line.startswith("+RCV="):
        content = line[5:]
        parts = content.split(",")
        if len(parts) >= 5:
            try:
                rssi_val = int(parts[-2])
                snr_val = int(parts[-1])
            except:
                pass
            payload_str = ",".join(parts[2:-2])
    elif "CR43" in line:
        idx = line.find("CR43")
        payload_str = line[idx:]
    else:
        return False

    items = payload_str.split(",")
    if len(items) < 18 or items[0] != "CR43":
        return False

    try:
        pkt_num = int(items[1])
        batt_v = float(items[2])
        mq4 = int(items[3])
        mq7 = int(items[4])
        mq135 = int(items[5])
        dht_t = float(items[6])
        dht_h = float(items[7])
        bmp_t = float(items[8])
        press = float(items[9])
        alt = float(items[10])
        gps_fix = bool(int(items[11]))
        lat = float(items[12])
        lon = float(items[13])
        sats = int(items[14])
        hdop = float(items[15])
        gps_alt = float(items[16])
        spd = float(items[17])

        dht_valid = (dht_h > 0.0 or dht_t > 0.0)
        bmp_valid = (press > 300.0 and press < 1200.0)

        if dht_valid and bmp_valid:
            temp_avg = round((dht_t + bmp_t) * 0.5, 1)
        elif dht_valid:
            temp_avg = round(dht_t, 1)
        elif bmp_valid:
            temp_avg = round(bmp_t, 1)
        else:
            temp_avg = 25.0

        dew_point = round(temp_avg - ((100.0 - max(1.0, min(100.0, dht_h))) / 5.0), 1)
        batt_pct = int(round(max(0.0, min(100.0, ((batt_v - 9.60) / 3.00) * 100.0))))

        with state_lock:
            current_telemetry["packet_count"] = pkt_num
            current_telemetry["battery_voltage"] = batt_v
            current_telemetry["battery_percent"] = batt_pct
            current_telemetry["mq4"] = mq4
            current_telemetry["mq7"] = mq7
            current_telemetry["mq135"] = mq135
            current_telemetry["dht_valid"] = dht_valid
            current_telemetry["temp_c"] = temp_avg
            current_telemetry["humidity"] = dht_h
            current_telemetry["dew_point_c"] = dew_point
            current_telemetry["bmp_valid"] = bmp_valid
            current_telemetry["bmp_temp_c"] = bmp_t
            current_telemetry["pressure_hpa"] = press
            current_telemetry["altitude_m"] = alt
            current_telemetry["gps_fix"] = gps_fix
            current_telemetry["latitude"] = lat
            current_telemetry["longitude"] = lon
            current_telemetry["satellites"] = sats
            current_telemetry["hdop"] = hdop
            current_telemetry["gps_altitude"] = gps_alt
            current_telemetry["speed_kmh"] = spd
            current_telemetry["rssi"] = rssi_val
            current_telemetry["snr"] = snr_val
            current_telemetry["last_packet_time"] = time.time()
            current_telemetry["link_connected"] = True
            current_telemetry["espConnected"] = True

        insert_telemetry_to_db(current_telemetry)
        print(f"[LORA RX #{pkt_num}] Batt:{batt_v}V ({batt_pct}%) | Gas: CH4={mq4} CO={mq7} AQI={mq135} | {temp_avg}C {dht_h}% {press}hPa | RSSI:{rssi_val}dBm")
        return True
    except Exception as e:
        print(f"[PARSER WARNING] Failed to unpack tokens: {e}")
        return False

# -----------------------------------------------------------------------------
# SERIAL WORKER THREAD
# -----------------------------------------------------------------------------
def find_available_ports():
    ports = serial.tools.list_ports.comports()
    return [{"port": p.device, "description": p.description} for p in ports]

def serial_worker():
    global active_serial, serial_thread_running
    print("[SERIAL] LoRa listener background thread started.")

    while serial_thread_running:
        port_to_use = None
        with state_lock:
            port_to_use = current_telemetry.get("active_port")

        if not port_to_use or port_to_use == "None":
            all_ports = serial.tools.list_ports.comports()
            for p in all_ports:
                desc = p.description.lower()
                if "bluetooth" not in desc:
                    port_to_use = p.device
                    break

        if not port_to_use:
            with state_lock:
                current_telemetry["link_connected"] = False
                current_telemetry["active_port"] = "Searching..."
            time.sleep(1.0)
            continue

        try:
            print(f"[SERIAL] Connecting to {port_to_use} @ {DEFAULT_BAUD} baud...")
            ser = serial.Serial(port_to_use, DEFAULT_BAUD, timeout=1.0)
            active_serial = ser
            with state_lock:
                current_telemetry["active_port"] = port_to_use
                current_telemetry["link_connected"] = True
            print(f"[SERIAL OK] Connected successfully to {port_to_use}")

            while serial_thread_running and ser.is_open:
                line_bytes = ser.readline()
                if line_bytes:
                    try:
                        line = line_bytes.decode("utf-8", errors="replace").strip()
                        if line:
                            parse_telemetry_line(line)
                    except Exception as ex:
                        pass
                else:
                    with state_lock:
                        lpt = current_telemetry.get("last_packet_time")
                        if lpt and (time.time() - lpt > 5.0):
                            current_telemetry["link_connected"] = False

        except serial.SerialException as se:
            print(f"[SERIAL RETRY] Port {port_to_use} error: {se}. Retrying in 2s...")
            with state_lock:
                current_telemetry["link_connected"] = False
            time.sleep(2.0)
        except Exception as e:
            print(f"[SERIAL UNEXPECTED] Error: {e}")
            time.sleep(2.0)
        finally:
            if active_serial and active_serial.is_open:
                try:
                    active_serial.close()
                except:
                    pass
            active_serial = None

# -----------------------------------------------------------------------------
# FLASK WEB & API ROUTES
# -----------------------------------------------------------------------------
@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
    return response

@app.route("/")
def index():
    return send_from_directory(STATIC_DIR, "index.html")

@app.route("/<path:filename>")
def serve_static(filename):
    return send_from_directory(STATIC_DIR, filename)

@app.route("/api/sensors")
def get_sensors():
    with state_lock:
        return jsonify(current_telemetry)

@app.route("/api/status")
def get_status():
    with state_lock:
        return jsonify({
            "link_connected": current_telemetry["link_connected"],
            "active_port": current_telemetry["active_port"],
            "packet_count": current_telemetry["packet_count"],
            "rssi": current_telemetry["rssi"],
            "snr": current_telemetry["snr"],
            "db_records": current_telemetry["db_total_records"]
        })

@app.route("/api/ports")
def get_ports():
    return jsonify(find_available_ports())

@app.route("/api/connect", methods=["POST"])
def connect_port():
    req = request.get_json(silent=True) or {}
    chosen = req.get("port")
    if chosen:
        with state_lock:
            current_telemetry["active_port"] = chosen
        global active_serial
        if active_serial and active_serial.is_open:
            active_serial.close()
        return jsonify({"status": "switching", "target_port": chosen})
    return jsonify({"error": "No port provided"}), 400

@app.route("/api/db/dates")
def get_db_dates():
    try:
        conn = sqlite3.connect(DB_FILENAME)
        cur = conn.cursor()
        cur.execute("SELECT DISTINCT substr(timestamp, 1, 10) FROM mission_telemetry ORDER BY 1 DESC")
        dates = [r[0] for r in cur.fetchall() if r[0]]
        cur.execute("SELECT COUNT(*) FROM mission_telemetry")
        total = cur.fetchone()[0]
        conn.close()
        return jsonify({"dates": dates, "total": total})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/db/recent")
def get_recent_db():
    limit = request.args.get("limit", 100, type=int)
    date_filter = request.args.get("date", "all")
    try:
        conn = sqlite3.connect(DB_FILENAME)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        if date_filter and date_filter != "all":
            if limit and limit > 0:
                cur.execute("SELECT * FROM mission_telemetry WHERE timestamp LIKE ? ORDER BY id DESC LIMIT ?", (f"{date_filter}%", limit))
            else:
                cur.execute("SELECT * FROM mission_telemetry WHERE timestamp LIKE ? ORDER BY id DESC", (f"{date_filter}%",))
        else:
            if limit and limit > 0:
                cur.execute("SELECT * FROM mission_telemetry ORDER BY id DESC LIMIT ?", (limit,))
            else:
                cur.execute("SELECT * FROM mission_telemetry ORDER BY id DESC")
        rows = [dict(r) for r in cur.fetchall()]
        conn.close()
        return jsonify(rows)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/db/export")
def export_csv():
    try:
        import io
        import csv

        date_filter = request.args.get("date", "all")
        conn = sqlite3.connect(DB_FILENAME)
        cur = conn.cursor()
        if date_filter and date_filter != "all":
            cur.execute("SELECT * FROM mission_telemetry WHERE timestamp LIKE ? ORDER BY id ASC", (f"{date_filter}%",))
        else:
            cur.execute("SELECT * FROM mission_telemetry ORDER BY id ASC")
        rows = cur.fetchall()
        col_names = [desc[0] for desc in cur.description]
        conn.close()

        si = io.StringIO()
        cw = csv.writer(si)
        cw.writerow(["# CYBERROVER X4.3 - OFFICIAL TELEMETRY MISSION LOG"])
        cw.writerow([f"# Exported on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"])
        cw.writerow([f"# Date Filter: {date_filter}"])
        cw.writerow([f"# Total Mission Records: {len(rows)}"])
        cw.writerow([])
        cw.writerow(col_names)
        cw.writerows(rows)

        output = make_response(si.getvalue())
        now_ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        prefix = f"cyberrover_mission_{date_filter}_{now_ts}" if date_filter != "all" else f"cyberrover_mission_{now_ts}"
        output.headers["Content-Disposition"] = f"attachment; filename={prefix}.csv"
        output.headers["Content-type"] = "text/csv"
        return output
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -----------------------------------------------------------------------------
# MAIN ENTRY POINT
# -----------------------------------------------------------------------------
if __name__ == "__main__":
    init_db()
    t = threading.Thread(target=serial_worker, daemon=True)
    t.start()
    port = 5000
    print("=" * 70)
    print("  CYBERROVER X4.3 - TACTICAL GROUND STATION & SQLite DBMS SERVER")
    print(f"  Access Dashboard at: http://localhost:{port}")
    print(f"  SQLite Telemetry DB: {DB_FILENAME}")
    print("=" * 70)
    app.run(host="0.0.0.0", port=port, debug=False, use_reloader=False)
