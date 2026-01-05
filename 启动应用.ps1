# 养生饮食推荐应用 - 启动脚本
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "养生饮食推荐应用 - 启动中..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "服务器地址: http://localhost:8002" -ForegroundColor Yellow
Write-Host ""
Write-Host "重要提示:" -ForegroundColor Red
Write-Host "1. 浏览器打开后,请按 Ctrl+Shift+R 强制刷新" -ForegroundColor White
Write-Host "2. 首次使用需要输入API Key" -ForegroundColor White
Write-Host "3. 获取API Key: https://open.bigmodel.cn/" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "按任意键启动服务器..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# 启动服务器
Start-Process "http://localhost:8002"
python -m http.server 8002
