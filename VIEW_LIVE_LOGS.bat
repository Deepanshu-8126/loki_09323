@echo off
title Loki Agent - Live Terminal Telemetry Monitor
color 0A
echo ========================================================
echo   LOKI AGENT - LIVE REAL-TIME TERMINAL LOG STREAM
echo   Press Ctrl+C to exit monitor anytime
echo ========================================================
echo.

powershell -NoProfile -Command "Get-Content -Path \"$env:LOCALAPPDATA\loki\logs\agent.log\" -Wait -Tail 30"
pause
