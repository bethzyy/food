@echo off
chcp 65001 >nul
echo ========================================
echo Food App - Clear Cache and Start
echo ========================================
echo.
echo Starting HTTP server...
echo Server URL: http://localhost:8002
echo.
echo ========================================
echo IMPORTANT:
echo ========================================
echo 1. Press Ctrl+Shift+R to force refresh
echo 2. Press F12 to open console if errors
echo 3. Input API Key on first use
echo 4. Get API Key: https://open.bigmodel.cn/
echo ========================================
echo.
echo Press any key to start...
pause >nul

cd /d "%~dp0"
start http://localhost:8002
python -m http.server 8002

echo.
echo Server stopped
pause
