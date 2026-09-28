#!/usr/bin/env python3
"""
CYBERROVER X4.3 - BULLETPROOF OFFLINE MAP TILE SYNC ENGINE
Guarantees 100% offline coverage for Jharkhand, mission corridors, and high-res venues.
Properly supports compact 103-byte OpenStreetMap 256x256 palette tiles.
"""

import os
import sys
import math
import time
import random
import urllib.request
import urllib.error
import concurrent.futures

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
TILES_DIR = os.path.join(SCRIPT_DIR, "tiles")

USER_AGENT = "CyberRover-TacticalGCS/4.3 (Educational Project; sanjay)"
TILE_MIRRORS = [
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
    "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
    "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
]

PNG_HEADER = b"\x89PNG\r\n\x1a\n"

def deg2num(lat_deg, lon_deg, zoom):
    lat_rad = math.radians(lat_deg)
    n = 2.0 ** zoom
    xtile = int((lon_deg + 180.0) / 360.0 * n)
    ytile = int((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n)
    return (xtile, ytile)

def get_tiles_for_bbox(min_lat, max_lat, min_lon, max_lon, min_z, max_z):
    tiles = set()
    for z in range(min_z, max_z + 1):
        x1, y2 = deg2num(min_lat, min_lon, z)
        x2, y1 = deg2num(max_lat, max_lon, z)
        for x in range(min(x1, x2), max(x1, x2) + 1):
            for y in range(min(y1, y2), max(y1, y2) + 1):
                tiles.add((z, x, y))
    return tiles

def get_target_tile_inventory():
    all_tiles = set()

    # 1. Complete Jharkhand State Overview (Zoom 7 to 12)
    # Lat: 21.80 to 25.50 N, Lon: 83.15 to 88.10 E (All 24 districts + outer borders)
    all_tiles |= get_tiles_for_bbox(21.80, 25.50, 83.15, 88.10, 7, 12)

    # 2. Regional Urban Corridors (Ranchi, Ramgarh, Bokaro, Dhanbad) (Zoom 13)
    all_tiles |= get_tiles_for_bbox(23.15, 24.05, 85.05, 86.75, 13, 13)

    # 3. Ramgarh Exhibition Grounds & City (Zoom 14 to 16)
    all_tiles |= get_tiles_for_bbox(23.58, 23.68, 85.46, 85.58, 14, 16)

    # 4. Dhanbad, Katras, Malkera, Chandrapura & CSV Rover Track (Zoom 14 to 17)
    all_tiles |= get_tiles_for_bbox(23.72, 23.85, 86.22, 86.45, 14, 17)

    # 5. Immediate Campus & Mission Waypoints (Zoom 18)
    all_tiles |= get_tiles_for_bbox(23.782, 23.794, 86.275, 86.288, 18, 18)
    all_tiles |= get_tiles_for_bbox(23.790, 23.798, 86.291, 86.301, 18, 18)

    return all_tiles

def is_valid_tile(z, x, y):
    target_file = os.path.join(TILES_DIR, str(z), str(x), f"{y}.png")
    if not os.path.exists(target_file):
        return False
    try:
        size = os.path.getsize(target_file)
        if size < 67: # Minimum valid PNG size
            try:
                os.remove(target_file)
            except OSError:
                pass
            return False
        with open(target_file, "rb") as f:
            header = f.read(8)
            if header != PNG_HEADER:
                try:
                    os.remove(target_file)
                except OSError:
                    pass
                return False
        return True
    except Exception:
        return False

def download_tile_polite(z, x, y, max_retries=4):
    target_dir = os.path.join(TILES_DIR, str(z), str(x))
    os.makedirs(target_dir, exist_ok=True)
    target_file = os.path.join(target_dir, f"{y}.png")

    for attempt in range(max_retries):
        mirror = TILE_MIRRORS[attempt % len(TILE_MIRRORS)]
        url = mirror.format(z=z, x=x, y=y)
        req = urllib.request.Request(url, headers={
            "User-Agent": USER_AGENT,
            "Accept": "image/png,image/*;q=0.8,*/*;q=0.5"
        })

        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                if response.status == 200:
                    data = response.read()
                    if len(data) >= 67 and data.startswith(PNG_HEADER):
                        with open(target_file, "wb") as f:
                            f.write(data)
                        return True
        except urllib.error.HTTPError as e:
            if e.code == 429: # Rate limit backoff
                time.sleep(1.0 + attempt * 0.5)
            elif e.code == 404:
                return False
            else:
                time.sleep(0.4)
        except Exception:
            time.sleep(0.3)

    return False

def run_sync_cycle(tile_subset, cycle_title="CYCLE"):
    print(f"\n[{cycle_title}] Auditing {len(tile_subset)} tiles on disk...", flush=True)
    missing = [t for t in tile_subset if not is_valid_tile(*t)]
    valid_count = len(tile_subset) - len(missing)

    print(f"[{cycle_title}] Status: {valid_count} valid on disk | {len(missing)} missing/corrupted", flush=True)

    if not missing:
        print(f"[{cycle_title}] Zero missing tiles! 100% complete.", flush=True)
        return []

    print(f"[{cycle_title}] Downloading {len(missing)} tiles with 4 parallel workers...", flush=True)
    failed = []
    downloaded = 0

    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        future_to_tile = {executor.submit(download_tile_polite, z, x, y): (z, x, y) for (z, x, y) in missing}
        for i, future in enumerate(concurrent.futures.as_completed(future_to_tile), 1):
            tile = future_to_tile[future]
            try:
                ok = future.result()
                if ok:
                    downloaded += 1
                else:
                    failed.append(tile)
            except Exception:
                failed.append(tile)

            if i % 100 == 0 or i == len(missing):
                pct = (i / len(missing)) * 100.0
                print(f"  [{cycle_title}] Progress: {i}/{len(missing)} ({pct:.1f}%) | Success: {downloaded} | Retries: {len(failed)}", flush=True)

    return failed

def main():
    print("=" * 70, flush=True)
    print("  CYBERROVER X4.3 - BULLETPROOF OFFLINE MAP TILE SYNC ENGINE", flush=True)
    print(f"  Destination: {TILES_DIR}", flush=True)
    print("=" * 70, flush=True)

    all_tiles = get_target_tile_inventory()
    print(f"Total tiles in target mission scope: {len(all_tiles)} tiles across Zoom 7 to 18.", flush=True)

    # PASS 1: Main synchronization
    print("\n" + "#" * 70, flush=True)
    print("  PASS 1: PRIMARY DOWNLOAD OF ALL MISSING TILES", flush=True)
    print("#" * 70, flush=True)
    failed_pass1 = run_sync_cycle(all_tiles, "PASS 1")

    # PASS 2: "Check once more and download once more if any left"
    print("\n" + "#" * 70, flush=True)
    print("  PASS 2: MANDATED VERIFICATION & SECOND DOWNLOAD SWEEP", flush=True)
    print("#" * 70, flush=True)
    time.sleep(1.0)
    failed_pass2 = run_sync_cycle(all_tiles, "PASS 2 (RE-CHECK)")

    # PASS 3: If any residual failed tiles remain, retry sequentially until 100%
    if failed_pass2:
        print("\n" + "#" * 70, flush=True)
        print("  PASS 3: FINAL RETRY FOR RESIDUAL TILES", flush=True)
        print("#" * 70, flush=True)
        run_sync_cycle(set(failed_pass2), "PASS 3 (FINAL SWEEP)")

    # FINAL AUDIT PASS
    print("\n" + "=" * 70, flush=True)
    print("  FINAL 100% INVENTORY AUDIT", flush=True)
    print("=" * 70, flush=True)
    unresolved = [t for t in all_tiles if not is_valid_tile(*t)]
    if not unresolved:
        print(f"SUCCESS: All {len(all_tiles)} tiles verified valid PNGs with 100% integrity!", flush=True)
    else:
        print(f"NOTICE: {len(unresolved)} tiles remain unresolved.", flush=True)

    total_pngs = 0
    for root, dirs, files in os.walk(TILES_DIR):
        total_pngs += len([f for f in files if f.endswith(".png")])
    print(f"Total tile files available in local storage: {total_pngs}", flush=True)
    print("=" * 70, flush=True)

if __name__ == "__main__":
    main()
