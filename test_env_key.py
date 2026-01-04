#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试环境变量API Key读取
"""

import os
import sys
import http.server
import socketserver
import json
from urllib.parse import urlparse

# 设置Windows控制台编码为UTF-8
if sys.platform == 'win32':
    try:
        import locale
        import codecs
        sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
        sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')
    except:
        pass

PORT = 8001

class TestAPIHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.path.dirname(os.path.abspath(__file__)), **kwargs)

    def end_headers(self):
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
            print(f"[CHECK] 检查环境变量 ZHIPU_API_KEY:")
            print(f"   存在: {bool(api_key)}")
            if api_key:
                print(f"   长度: {len(api_key)} 字符")
                print(f"   前10位: {api_key[:10]}...")
                print(f"   后4位: ...{api_key[-4:]}")

            if api_key:
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                response = json.dumps({
                    'apiKey': api_key,
                    'length': len(api_key),
                    'preview': f"{api_key[:10]}...{api_key[-4:]}"
                }, ensure_ascii=False)
                self.wfile.write(response.encode('utf-8'))
                print(f"[SUCCESS] 已发送API Key到客户端")
            else:
                self.send_response(404)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                response = json.dumps({
                    'error': 'ZHIPU_API_KEY环境变量未设置',
                    'hint': '请设置环境变量: set ZHIPU_API_KEY=your-key'
                }, ensure_ascii=False)
                self.wfile.write(response.encode('utf-8'))
                print(f"[ERROR] 环境变量未设置")
        else:
            # Serve static files
            super().do_GET()

def start_test_server():
    print("=" * 60)
    print("  环境变量API Key测试服务器")
    print("=" * 60)
    print()

    api_key = os.environ.get('ZHIPU_API_KEY', '')
    if api_key:
        print(f"[OK] 检测到环境变量 ZHIPU_API_KEY")
        print(f"   长度: {len(api_key)} 字符")
        print(f"   预览: {api_key[:10]}...{api_key[-4:]}")
    else:
        print(f"[WARNING] 未检测到环境变量 ZHIPU_API_KEY")
        print()
        print("如何设置环境变量:")
        print("   Windows PowerShell:")
        print('   $env:ZHIPU_API_KEY="your-api-key-here"')
        print()
        print("   Windows CMD:")
        print("   set ZHIPU_API_KEY=your-api-key-here")
        print()
        print("   Linux/Mac:")
        print('   export ZHIPU_API_KEY="your-api-key-here"')

    print()
    print("=" * 60)
    print(f"测试服务器: http://localhost:{PORT}")
    print(f"测试页面: http://localhost:{PORT}/test_env.html")
    print("=" * 60)
    print()
    print("按 Ctrl+C 停止服务器")
    print()

    with socketserver.TCPServer(("", PORT), TestAPIHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n服务器已停止")
            import sys
            sys.exit(0)

if __name__ == "__main__":
    start_test_server()
