@echo off
title Loki Gateway - Telegram & Network Live Monitor
color 0B
echo ========================================================
echo   LOKI GATEWAY - TELEGRAM MESSAGES & NETWORK STREAM
echo   Press Ctrl+C to exit monitor anytime
echo ========================================================
echo.

powershell -NoProfile -Command "Get-Content -Path \"$env:LOCALAPPDATA\loki\logs\gateway.log\" -Wait -Tail 30"
pause
