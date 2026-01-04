@echo off
echo ========================================
echo    Food Recommendation App
echo ========================================
echo.

REM Check Python installation
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found
    echo Please install Python 3.7+
    echo.
    pause
    exit /b 1
)

echo [INFO] Starting HTTP server...
echo.
echo Server URL: http://localhost:8000
echo Open the above URL in your browser
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

cd /d "%~dp0"
python -m http.server 8000

pause
