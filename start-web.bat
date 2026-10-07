@echo off
title AetherOS (OpenDots) - Calm HUD Web Canvas
echo ================================================================================
echo    Starting AetherOS Calm HUD Web Canvas on http://localhost:3000...
echo ================================================================================
echo.

set "PATH=C:\Program Files\nodejs;%LOCALAPPDATA%\Programs\Git\cmd;%PATH%"
cd /d "%~dp0packages\web"
call npx next start -p 3000
pause
