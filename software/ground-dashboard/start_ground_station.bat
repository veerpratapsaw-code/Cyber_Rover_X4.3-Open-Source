@echo off
title CYBERROVER X4.3 TACTICAL GROUND STATION & SQLite DBMS
color 0A
echo ====================================================================
echo   LAUNCHING CYBERROVER X4.3 COMMAND COCKPIT & SQLite DBMS
echo ====================================================================
echo [1/2] Launching Python LoRa telemetry receiver and SQLite engine...
echo [2/2] Opening Mission Cockpit in Chrome...
echo.

start "" "http://localhost:5000"

if exist "C:\Users\sanjay\AppData\Local\Programs\Python\Python310\python.exe" (
    "C:\Users\sanjay\AppData\Local\Programs\Python\Python310\python.exe" "%~dp0ground_station.py"
) else (
    python "%~dp0ground_station.py"
)

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Ground station stopped unexpectedly.
    pause
)
