#!/usr/bin/env python3
"""安装后端依赖"""

import subprocess
import sys

def install(package):
    """安装Python包"""
    try:
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])
        print(f"✓ {package} 安装成功")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ {package} 安装失败: {e}")
        return False

def main():
    print("=" * 60)
    print("安装后端依赖包")
    print("=" * 60)

    packages = ['flask', 'flask-cors', 'anthropic']

    for package in packages:
        print(f"\n正在安装 {package}...")
        install(package)

    print("\n" + "=" * 60)
    print("依赖安装完成！")
    print("=" * 60)
    print("\n现在可以启动后端服务:")
    print("  python api_server.py")
    print("\n或使用启动脚本:")
    print("  start_with_backend.bat")

if __name__ == '__main__':
    main()
