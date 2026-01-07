@echo off
chcp 65001 > nul
echo ============================================================
echo 饮食推荐应用 - 启动后端+前端
echo ============================================================
echo.
echo [步骤1] 启动Python后端API服务器...
echo.

start /B python api_server.py

timeout /t 3 /nobreak > nul

echo.
echo [步骤2] 启动前端HTTP服务器...
echo.

REM 检查端口是否被占用
netstat -ano | findstr :8000 > nul
if %errorlevel% == 0 (
    echo 端口8000已被占用，尝试使用端口8001
    set PORT=8001
) else (
    set PORT=8000
)

echo 使用端口: %PORT%
start http://localhost:%PORT%/index.html

python -m http.server %PORT%

pause
