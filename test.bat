@echo off
title AetherOS (OpenDots) - Run Test Suite
echo ================================================================================
echo    Running AetherOS (OpenDots) Vitest Test Suite (All 11 Suites / 45 Tests)...
echo ================================================================================
echo.

set "PATH=%LOCALAPPDATA%\Programs\Git\cmd;C:\Program Files\nodejs;%PATH%"
call npx.cmd vitest run

echo.
echo ================================================================================
echo    Tests Execution Finished!
echo ================================================================================
pause
