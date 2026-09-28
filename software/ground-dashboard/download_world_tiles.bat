@echo off
title CYBERROVER X4.3 - GLOBAL WORLD MAP DOWNLOADER (ZOOM 0 TO 7)
color 0B
echo ====================================================================
echo   CYBERROVER X4.3 - GLOBAL PLANET EARTH TILE SYNC (ZOOM 0 TO 7)
echo   Total Coverage: All Continents and Oceans (21,845 Tiles)
echo ====================================================================
echo.

if exist "C:\Users\sanjay\AppData\Local\Programs\Python\Python310\python.exe" (
    "C:\Users\sanjay\AppData\Local\Programs\Python\Python310\python.exe" "%~dp0download_world_tiles.py"
) else (
    py -3 "%~dp0download_world_tiles.py"
)

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Tile downloader stopped or encountered an issue.
    pause
) else (
    echo.
    echo [SUCCESS] World map sync complete!
    pause
)
