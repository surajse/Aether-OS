@echo off
title AetherOS (OpenDots) - Build All Packages
echo ================================================================================
echo    Building AetherOS (OpenDots) Monorepo Packages...
echo ================================================================================
echo.

set "PATH=%LOCALAPPDATA%\Programs\Git\cmd;C:\Program Files\nodejs;%PATH%"
call npx.cmd --yes pnpm -r run build

echo.
echo ================================================================================
echo    Build Completed Successfully!
echo ================================================================================
pause
