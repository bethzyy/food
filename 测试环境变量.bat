@echo off
echo ========================================
echo  测试环境变量API Key
echo ========================================
echo.

REM 检查环境变量
if defined ZHIPU_API_KEY (
    echo [OK] 检测到环境变量 ZHIPU_API_KEY
    echo     长度: %ZHIPU_API_KEY:~10%
    echo.
) else (
    echo [WARNING] 未检测到环境变量 ZHIPU_API_KEY
    echo.
    echo 请先设置环境变量:
    echo.
    echo Windows PowerShell:
    echo   $env:ZHIPU_API_KEY="your-api-key-here"
    echo.
    echo Windows CMD:
    echo   set ZHIPU_API_KEY=your-api-key-here
    echo.
    pause
    exit /b 0
)

echo 启动测试服务器...
echo.

cd /d "%~dp0"
python test_env_key.py

pause
