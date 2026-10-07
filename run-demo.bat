@echo off
title AetherOS (OpenDots) - Sovereign Agent OS Demo
echo ================================================================================
echo    Launching AetherOS (OpenDots) Native Architectural Demo...
echo ================================================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0demo.ps1"

echo.
echo ================================================================================
echo    Demo Complete! Press any key to close this window.
echo ================================================================================
pause >nul
