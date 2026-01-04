#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Food Recommendation App - Server with Environment Variable Support
支持从环境变量读取API Key的HTTP服务器
"""

import http.server
import socketserver
import webbrowser
import os
import sys
import json
from urllib.parse import urlparse, parse_qs
import _thread as thread

# 设置Windows控制台编码
if sys.platform == 'win32':
    try:
        import codecs
        sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
        sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')
    except:
        pass

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class APIKeyHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enable CORS
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed_path = urlparse(self.path)

        # API endpoint to get API key from environment variable
        if parsed_path.path == '/api/env-api-key':
            api_key = os.environ.get('ZHIPU_API_KEY', '')
            if api_key:
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                response = json.dumps({'apiKey': api_key}, ensure_ascii=False)
                self.wfile.write(response.encode('utf-8'))
                print('[SUCCESS] API Key已从环境变量读取并发送给客户端')
            else:
                self.send_response(404)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                response = json.dumps({'error': 'ZHIPU_API_KEY环境变量未设置'}, ensure_ascii=False)
                self.wfile.write(response.encode('utf-8'))
                print('[WARNING] ZHIPU_API_KEY环境变量未设置')
        else:
            # Serve static files
            super().do_GET()

def start_server():
    os.chdir(DIRECTORY)

    # Check for API key in environment
    api_key = os.environ.get('ZHIPU_API_KEY', '')
    if api_key:
        print("=" * 60)
        print("  [OK] 检测到 ZHIPU_API_KEY 环境变量")
        print(f"  API Key: {api_key[:10]}...{api_key[-4:]}")
        print("=" * 60)
    else:
        print("=" * 60)
        print("  [WARNING] 未检测到 ZHIPU_API_KEY 环境变量")
        print("  应用启动后会在浏览器中提示输入API Key")
        print("=" * 60)
        print()
        print("设置环境变量的方法:")
        print("   Windows PowerShell:")
        print("   $env:ZHIPU_API_KEY=\"your-api-key-here\"")
        print()
        print("   Windows CMD:")
        print("   set ZHIPU_API_KEY=your-api-key-here")
        print()
        print("   Linux/Mac:")
        print("   export ZHIPU_API_KEY=\"your-api-key-here\"")
        print("=" * 60)

    with socketserver.TCPServer(("", PORT), APIKeyHandler) as httpd:
        print()
        print("[INFO] 服务器启动成功!")
        print("=" * 60)
        print("  养生饮食推荐应用 - Food Recommendation App")
        print("=" * 60)
        print()
        print(f"[INFO] 服务器地址: http://localhost:{PORT}")
        print(f"[INFO] 工作目录: {DIRECTORY}")
        print()
        print("按 Ctrl+C 停止服务器")
        print("=" * 60)
        print()

        # Auto-open browser
        try:
            webbrowser.open(f'http://localhost:{PORT}')
            print("[SUCCESS] 浏览器已自动打开")
        except:
            print("[WARNING] 无法自动打开浏览器")
            print(f"   请手动访问: http://localhost:{PORT}")

        print()
        print("[INFO] 服务器运行中...")
        print()

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n")
            print("=" * 60)
            print("[STOP] 服务器已停止")
            print("=" * 60)
            sys.exit(0)

if __name__ == "__main__":
    start_server()
