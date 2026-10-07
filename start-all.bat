@echo off
title AetherOS (OpenDots) - Full Stack Launcher
echo ================================================================================
echo    Starting AetherOS Full Stack (Daemon :4099 + Web Canvas :3000)...
echo ================================================================================
echo.

start "AetherOS Daemon (:4099)" cmd /k "%~dp0start-node.bat"
start "AetherOS Web Canvas (:3000)" cmd /k "%~dp0start-web.bat"

echo.
echo [AetherOS] Both services launching in parallel:
echo   - Web Dashboard:  http://localhost:3000
echo   - Backend Daemon: http://localhost:4099
echo.
timeout /t 3 >nul
start http://localhost:3000
