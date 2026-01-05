@echo off
chcp 65001 >nul
echo ========================================
echo 养生饮食推荐应用 - 清除缓存并启动
echo ========================================
echo.
echo 正在启动HTTP服务器...
echo 服务器地址: http://localhost:8002
echo.
echo ========================================
echo ⚠️  重要提示:
echo ========================================
echo 1. 浏览器打开后,请按 Ctrl+Shift+R 强制刷新
echo 2. 如果还有错误,按 F12 打开控制台查看
echo 3. 首次使用需要输入API Key
echo 4. 获取API Key: https://open.bigmodel.cn/
echo ========================================
echo.
echo 按任意键启动服务器并打开浏览器...
pause >nul

cd /d "%~dp0"
start http://localhost:8002
python -m http.server 8002

echo.
echo 服务器已停止
pause
