@echo off
echo ========================================
echo  Food Recommendation App
echo  with Environment Variable Support
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

REM Check for API Key in environment
if not defined ZHIPU_API_KEY (
    echo [WARNING] ZHIPU_API_KEY environment variable not set
    echo.
    echo You can set it now:
    echo   set ZHIPU_API_KEY=your-api-key-here
    echo.
    echo Or enter it in the browser when prompted
    echo.
)

echo [INFO] Starting server with environment variable support...
echo.

cd /d "%~dp0"
python server_with_env.py

pause
