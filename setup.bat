@echo off
title AetherOS (OpenDots) - One-Click Environment Setup
echo ================================================================================
echo    AetherOS (OpenDots) - Automated Windows Setup
echo ================================================================================
echo.

set "PATH=%LOCALAPPDATA%\Programs\Git\cmd;C:\Program Files\nodejs;%PATH%"

where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] Git not detected. Installing via winget...
    winget install --id Git.Git -e --accept-package-agreements --accept-source-agreements
) else (
    echo [*] Git is detected and working.
)

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] Node.js not detected. Installing via winget...
    winget install --id OpenJS.NodeJS.LTS -e --accept-package-agreements --accept-source-agreements
) else (
    echo [*] Node.js is detected and working.
)

echo.
echo ================================================================================
echo [*] Checking local Git repository...
if not exist "%~dp0.git" (
    echo [*] Initializing Git repository...
    cd /d "%~dp0"
    git init
    git add .
    git commit -m "feat: initial commit of AetherOS (OpenDots)"
    git branch -M main
    echo [*] Git initialized successfully on branch 'main'.
) else (
    echo [*] Git repository is already initialized.
)

echo.
echo ================================================================================
echo    Setup finished! 
echo    You can now open this folder in Cursor AI or run 'run-demo.bat'.
echo ================================================================================
pause
