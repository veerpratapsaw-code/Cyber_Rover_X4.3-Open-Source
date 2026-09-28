#!/usr/bin/env python3
"""
CYBERROVER X4.3 - OFFLINE MAP TILE DOWNLOADER
Downloads high-resolution OpenStreetMap raster tiles for:
  - Local Campus & Surroundings: Saraswati Shishu Mandir / Chandrapura (23.78741, 86.28111)
  - Telemetry CSV GPS Corridor: (23.79395, 86.29570)
  - Ramgarh Exhibition Ground & Town: (23.63, 85.52)
  - Dhanbad & Bokaro Corridors
  - Regional Highways: Zoom 9 to 13
Saves to: software/ground-dashboard/tiles/{z}/{x}/{y}.png
"""

import os
import math
import time
import urllib.request
import concurrent.futures

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
TILES_DIR = os.path.join(SCRIPT_DIR, "tiles")

USER_AGENT = "CyberRover/4.3 (Educational Project; sanjay)"
TILE_URL_TEMPLATE = "https://tile.openstreetmap.org/{z}/{x}/{y}.png"

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

def download_single_tile(z, x, y):
    target_dir = os.path.join(TILES_DIR, str(z), str(x))
    os.makedirs(target_dir, exist_ok=True)
    target_file = os.path.join(target_dir, f"{y}.png")

    if os.path.exists(target_file) and os.path.getsize(target_file) > 500:
        return (True, "cached")

    url = TILE_URL_TEMPLATE.format(z=z, x=x, y=y)
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})

    try:
        with urllib.request.urlopen(req, timeout=8) as response:
            if response.status == 200:
                data = response.read()
                with open(target_file, "wb") as f:
                    f.write(data)
                return (True, "downloaded")
    except Exception as e:
        return (False, str(e))
    return (False, "unknown")

def main():
    print("=" * 65)
    print("  CYBERROVER X4.3 - OFFLINE MAP TILE DOWNLOAD ENGINE")
    print(f"  Target Directory: {TILES_DIR}")
    print("=" * 65)

    all_tiles = set()

    # 1. Regional Overview (Ranchi, Ramgarh, Bokaro, Dhanbad corridor)
    print("[1/4] Calculating regional corridor (Zoom 9-12)...")
    all_tiles |= get_tiles_for_bbox(23.25, 23.92, 85.20, 86.55, 9, 12)

    # 2. Ramgarh Exhibition City & Venue
    print("[2/4] Calculating Ramgarh Exhibition City (Zoom 13-16)...")
    all_tiles |= get_tiles_for_bbox(23.59, 23.67, 85.47, 85.56, 13, 16)

    # 3. Local Campus & CSV Route: Saraswati Shishu Mandir & Chandrapura
    print("[3/4] Calculating Local Campus & CSV Area (Zoom 13-17)...")
    all_tiles |= get_tiles_for_bbox(23.775, 23.805, 86.265, 86.305, 13, 17)

    # 4. Immediate Campus Yard at Ultra-High Detail (Zoom 18)
    print("[4/4] Calculating Campus Grounds at Zoom 18...")
    all_tiles |= get_tiles_for_bbox(23.784, 23.791, 86.278, 86.285, 18, 18)

    total = len(all_tiles)
    print(f"\n[QUEUE] Total unique tiles to download: {total}")

    success_count = 0
    cached_count = 0
    failed_count = 0

    # Threaded polite downloader (max 4 workers to stay well below rate limit)
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        futures = {executor.submit(download_single_tile, z, x, y): (z, x, y) for (z, x, y) in all_tiles}
        for i, future in enumerate(concurrent.futures.as_completed(futures), 1):
            z, x, y = futures[future]
            try:
                ok, status = future.result()
                if ok:
                    if status == "cached":
                        cached_count += 1
                    else:
                        success_count += 1
                else:
                    failed_count += 1
            except Exception:
                failed_count += 1

            if i % 50 == 0 or i == total:
                print(f" Progress: {i}/{total} ({(i/total)*100:.1f}%) | Downloaded: {success_count}, Cached: {cached_count}, Failed: {failed_count}")

    print("\n" + "=" * 65)
    print("  DOWNLOAD COMPLETE!")
    print(f"  Successfully cached: {cached_count + success_count} tiles in {TILES_DIR}")
    print("=" * 65)

if __name__ == "__main__":
    main()
