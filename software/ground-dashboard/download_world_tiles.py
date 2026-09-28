#!/usr/bin/env python3
"""
CYBERROVER X4.3 - GLOBAL WORLD TILE DOWNLOADER (Zoom 0 to 7)
Downloads the complete globe of Earth across all continents and oceans for Zoom 0 through 7.
Total tiles: 21,845 tiles.
"""

import os
import sys
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

def is_valid_tile(z, x, y):
    target_file = os.path.join(TILES_DIR, str(z), str(x), f"{y}.png")
    if not os.path.exists(target_file):
        return False
    try:
        size = os.path.getsize(target_file)
        if size < 67:
            return False
        with open(target_file, "rb") as f:
            if f.read(8) != PNG_HEADER:
                return False
        return True
    except Exception:
        return False

def download_tile(z, x, y, max_retries=4):
    target_dir = os.path.join(TILES_DIR, str(z), str(x))
    os.makedirs(target_dir, exist_ok=True)
    target_file = os.path.join(target_dir, f"{y}.png")

    if is_valid_tile(z, x, y):
        return True

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
            if e.code == 429:
                time.sleep(1.0 + attempt * 0.5)
            elif e.code == 404:
                return False
            else:
                time.sleep(0.3)
        except Exception:
            time.sleep(0.3)

    return False

def main():
    print("=" * 70, flush=True)
    print("  CYBERROVER X4.3 - GLOBAL PLANET EARTH TILE SYNC (ZOOM 0 TO 7)", flush=True)
    print(f"  Storage Directory: {TILES_DIR}", flush=True)
    print("=" * 70, flush=True)

    world_tiles = []
    for z in range(8): # 0, 1, 2, 3, 4, 5, 6, 7
        n = 2 ** z
        for x in range(n):
            for y in range(n):
                world_tiles.append((z, x, y))

    total = len(world_tiles)
    print(f"Calculated entire globe: {total} tiles (Zoom 0 through 7).", flush=True)

    # Filter out what's already valid on disk
    missing = [t for t in world_tiles if not is_valid_tile(*t)]
    cached_count = total - len(missing)
    print(f"Already on disk: {cached_count} | To download: {len(missing)}", flush=True)

    if not missing:
        print("All Zoom 0-7 tiles for the entire world are already downloaded and 100% valid!", flush=True)
    else:
        success = 0
        failed = 0
        start_time = time.time()

        # 5 polite parallel threads across 4 mirrors
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            future_to_tile = {executor.submit(download_tile, z, x, y): (z, x, y) for (z, x, y) in missing}
            for i, future in enumerate(concurrent.futures.as_completed(future_to_tile), 1):
                ok = future.result()
                if ok:
                    success += 1
                else:
                    failed += 1

                if i % 250 == 0 or i == len(missing):
                    elapsed = time.time() - start_time
                    rate = i / elapsed if elapsed > 0 else 0
                    pct = (i / len(missing)) * 100.0
                    print(f"  Progress: {i}/{len(missing)} ({pct:.1f}%) | Success: {success} | Failed: {failed} | Speed: {rate:.1f} tiles/s", flush=True)

    # Calculate exact storage size on disk for Zoom 0 to 7
    total_bytes = 0
    total_count = 0
    for z in range(8):
        z_dir = os.path.join(TILES_DIR, str(z))
        if os.path.exists(z_dir):
            for root, dirs, files in os.walk(z_dir):
                for f in files:
                    if f.endswith(".png"):
                        total_count += 1
                        total_bytes += os.path.getsize(os.path.join(root, f))

    mb = total_bytes / (1024 * 1024)
    print("\n" + "=" * 70, flush=True)
    print("  WORLD MAP TILE SYNC COMPLETE!", flush=True)
    print(f"  Total World Tiles (Zoom 0-7): {total_count} files", flush=True)
    print(f"  Total Disk Storage: {mb:.2f} MB ({total_bytes:,} bytes)", flush=True)
    print("=" * 70, flush=True)

if __name__ == "__main__":
    main()
