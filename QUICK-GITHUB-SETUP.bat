@echo off
echo ========================================
echo   GitHub Upload Setup Script
echo ========================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not installed!
    echo Please download Git from: https://git-scm.com/
    pause
    exit /b 1
)

echo [1/5] Checking Git status...
git status >nul 2>&1
if errorlevel 1 (
    echo Initializing Git repository...
    git init
) else (
    echo Git repository already initialized.
)

echo.
echo [2/5] Adding all files...
git add .

echo.
echo [3/5] Checking what will be committed...
git status

echo.
echo [4/5] Creating commit...
git commit -m "Initial commit: Image Converter Pro - Web App, Desktop App, and Chrome Extension"

echo.
echo ========================================
echo   Next Steps:
echo ========================================
echo.
echo 1. Go to https://github.com
echo 2. Create a new repository
echo 3. Copy the repository URL
echo 4. Run these commands:
echo.
echo    git remote add origin YOUR_REPO_URL
echo    git branch -M main
echo    git push -u origin main
echo.
echo ========================================
echo.
pause

