@echo off
title ⚡ Loki Live Project & Git Sync Monitor
color 0A
cls
echo ========================================================
echo   ⚡ LOKI LIVE PROJECT MONITOR - REAL-TIME SYNC
echo ========================================================
echo.
echo [1] Monitoring GitHub Repo for newly generated files...
echo [2] Auto-pulling updates every 15 seconds...
echo.
echo Press Ctrl+C anytime to stop.
echo ========================================================
echo.

:loop
git pull --quiet 2>nul
echo --------------------------------------------------------
echo 🕒 Last Sync Time: %TIME%
echo 📁 Current Project Files in Repository:
git log -1 --pretty=format:"   ✨ Latest Commit: %%s (%%cr)" 2>nul
echo.
echo.
echo 📂 Modified / New Files:
git status -s
echo --------------------------------------------------------
timeout /t 15 /nobreak >nul
goto loop
