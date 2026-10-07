@echo off
title AetherOS (OpenDots) - Sovereign Node Daemon
echo ================================================================================
echo    Starting AetherOS (OpenDots) Sovereign Node Daemon...
echo ================================================================================
echo.

set "PATH=%LOCALAPPDATA%\Programs\Git\cmd;C:\Program Files\nodejs;%PATH%"
node packages\cli\bin\aether.js start 4099

pause
