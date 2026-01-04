@echo off
chcp 65001 >nul 2>&1
cls

echo.
echo ========================================
echo    养生饮食推荐应用
echo    一键启动（支持环境变量）
echo ========================================
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

REM 检查环境变量
if defined ZHIPU_API_KEY (
    echo [信息] 环境变量已设置
    echo     长度: %ZHIPU_API_KEY:~10%
    echo.
    echo [信息] 正在启动支持环境变量的服务器...
    echo.
    echo ========================================
    echo.
) else (
    echo [警告] 未检测到环境变量 ZHIPU_API_KEY
    echo.
    echo [提示] 首次使用需要在浏览器中输入API Key
    echo [提示] 后续会自动保存，无需重复输入
    echo.
    echo [可选] 设置环境变量后可自动读取:
    echo   PowerShell: $env:ZHIPU_API_KEY="你的key"
    echo   CMD:       set ZHIPU_API_KEY=你的key
    echo.
    echo ========================================
    echo.
)

REM 停止可能占用8000端口的进程
echo [信息] 检查端口占用...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000" ^| findstr "LISTENING"') do (
    echo [信息] 发现占用8000端口的进程: %%a
    echo [信息] 正在终止进程...
    taskkill /F /PID %%a >nul 2>&1
    if errorlevel 1 (
        echo [警告] 无法终止进程 %%a
    ) else (
        echo [成功] 进程 %%a 已终止
    )
)
echo.

REM 使用正确的服务器
python server_with_env.py

pause
