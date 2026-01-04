@echo off
chcp 65001 >nul 2>&1
cls
echo.
echo ========================================
echo    养生饮食推荐应用
echo ========================================
echo.
echo 正在启动...
echo.

cd /d "%~dp0"

REM 检查Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未安装Python
    echo 请先安装 Python 3.7 或更高版本
    echo.
    pause
    exit /b 1
)

REM 检查是否有环境变量
if defined ZHIPU_API_KEY (
    echo [提示] 检测到环境变量 ZHIPU_API_KEY
    echo     长度: %ZHIPU_API_KEY:~10%
    echo.
    echo 启动服务器（支持环境变量）...
    python server_with_env.py
) else (
    echo [提示] 未设置环境变量 ZHIPU_API_KEY
    echo.
    echo 启动服务器（首次使用需要在浏览器中输入API Key）...
    echo.
    echo 如需设置环境变量:
    echo   PowerShell: $env:ZHIPU_API_KEY="your-key"
    echo   CMD:       set ZHIPU_API_KEY=your-key
    echo.
    python start_server.py
)

pause
