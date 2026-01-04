#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
养生饮食推荐应用 - 统一服务器
自动支持环境变量和手动输入API Key
"""

import http.server
import socketserver
import webbrowser
import os
import sys
import json
from urllib.parse import urlparse

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

class UnifiedHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
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
                print(f"[API] 已提供API Key (长度: {len(api_key)})")
            else:
                self.send_response(404)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                response = json.dumps({
                    'error': 'ZHIPU_API_KEY环境变量未设置',
                    'hint': '首次使用会在浏览器中提示输入API Key'
                }, ensure_ascii=False)
                self.wfile.write(response.encode('utf-8'))
                print("[API] 环境变量未设置，将使用浏览器输入")
        # API endpoint to get prompt file content
        elif parsed_path.path == '/api/get-prompt':
            prompt_path = os.path.join(DIRECTORY, 'prompts', 'food_recommendation_prompt.txt')
            if os.path.exists(prompt_path):
                with open(prompt_path, 'r', encoding='utf-8') as f:
                    prompt_content = f.read()
                self.send_response(200)
                self.send_header('Content-Type', 'text/plain; charset=utf-8')
                self.end_headers()
                self.wfile.write(prompt_content.encode('utf-8'))
                print("[API] 已提供prompt文件内容")
            else:
                self.send_response(404)
                self.end_headers()
                self.wfile.write(b'Prompt file not found')
        else:
            # Serve static files
            super().do_GET()

    def log_message(self, format, *args):
        # 简化日志输出
        if args[0] not in ['GET /', 'GET /style.css', 'GET /app.js', 'GET /favicon.ico']:
            print(f"[LOG] {args[0]}")

def main():
    os.chdir(DIRECTORY)

    # Check for API key
    api_key = os.environ.get('ZHIPU_API_KEY', '')

    print("=" * 60)
    print("  养生饮食推荐应用 - Food Recommendation App")
    print("=" * 60)
    print()

    if api_key:
        print("[OK] 环境变量 ZHIPU_API_KEY 已设置")
        print(f"     长度: {len(api_key)} 字符")
        print(f"     预览: {api_key[:10]}...{api_key[-4:]}")
        print()
        print("[INFO] 应用将自动从环境变量读取API Key")
    else:
        print("[INFO] 未检测到环境变量 ZHIPU_API_KEY")
        print()
        print("[INFO] 首次使用时会在浏览器中提示输入API Key")
        print("[INFO] 输入后会自动保存，无需重复输入")
        print()
        print("[OPTIONAL] 设置环境变量可自动读取:")
        print("   PowerShell: $env:ZHIPU_API_KEY=\"your-key\"")
        print("   CMD:       set ZHIPU_API_KEY=your-key")

    print()
    print("=" * 60)
    print(f"  服务器地址: http://localhost:{PORT}")
    print(f"  工作目录: {DIRECTORY}")
    print("=" * 60)
    print()
    print("按 Ctrl+C 停止服务器")
    print()

    # Allow port reuse
    socketserver.TCPServer.allow_reuse_address = True

    with socketserver.TCPServer(("", PORT), UnifiedHTTPRequestHandler) as httpd:
        # Auto-open browser
        try:
            webbrowser.open(f'http://localhost:{PORT}')
            print("[OK] 浏览器已自动打开")
        except:
            print("[INFO] 无法自动打开浏览器")
            print(f"       请手动访问: http://localhost:{PORT}")

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
    main()
