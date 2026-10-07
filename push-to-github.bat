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

set /p REPO_URL="Enter your GitHub Repository URL (e.g. https://github.com/username/open-dots.git): "

if "%REPO_URL%"=="" (
    echo [!] No URL entered. Aborted.
    pause
    exit /b 1
)

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
