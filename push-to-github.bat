@echo off
title AetherOS (OpenDots) - Push to GitHub
echo ================================================================================
echo    AetherOS (OpenDots) - One-Click GitHub Publisher
echo ================================================================================
echo.

set "PATH=%LOCALAPPDATA%\Programs\Git\cmd;C:\Program Files\nodejs;%PATH%"

where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] Git not found. Please run setup.bat first.
    pause
    exit /b 1
)

echo [*] Current Git status:
git status -s
echo.

set DEFAULT_URL=https://github.com/surajse/Aether-OS.git
echo Target Repository: %DEFAULT_URL%
set /p REPO_URL="Press ENTER to push to %DEFAULT_URL% (or enter a different URL): "

if "%REPO_URL%"=="" set REPO_URL=%DEFAULT_URL%

echo.
echo [*] Setting remote origin to: %REPO_URL%
git remote remove origin 2>nul
git remote add origin %REPO_URL%
git branch -M main

echo [*] Pushing branch 'main' to GitHub...
echo (If a browser window or login prompt appears, sign in to authorize Git)
echo.

git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ================================================================================
    echo    SUCCESS! Your code is now live on GitHub!
    echo ================================================================================
) else (
    echo.
    echo ================================================================================
    echo    [!] Push failed. Check your URL, internet connection, or GitHub permissions.
    echo ================================================================================
)

pause
