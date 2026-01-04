#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Food Recommendation App - HTTP Server Starter
启动养生饮食推荐应用服务器
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enable CORS
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def start_server():
    os.chdir(DIRECTORY)

    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print("=" * 50)
        print("  养生饮食推荐应用 - Food Recommendation App")
        print("=" * 50)
        print()
        print(f"Server running at: http://localhost:{PORT}")
        print(f"Directory: {DIRECTORY}")
        print()
        print("Press Ctrl+C to stop the server")
        print("=" * 50)
        print()

        # Auto-open browser
        try:
            webbrowser.open(f'http://localhost:{PORT}')
            print("Browser opened automatically!")
        except:
            print("Could not open browser automatically")
            print(f"Please open: http://localhost:{PORT}")

        print()
        print("Server started...")
        print()

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n")
            print("=" * 50)
            print("Server stopped.")
            print("=" * 50)
            sys.exit(0)

if __name__ == "__main__":
    start_server()
