#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
下载所有节气和传统节日背景图到本地
"""

import requests
import json
import os
from pathlib import Path

# 读取配置文件
config_file = Path(__file__).parent / 'images' / 'background_images.json'
with open(config_file, 'r', encoding='utf-8') as f:
    config = json.load(f)

# 创建保存目录
images_dir = Path(__file__).parent / 'images' / 'art'
images_dir.mkdir(exist_ok=True)

def download_image(name, url, category):
    """下载单个图片"""
    try:
        print(f"[DOWNLOAD] {name}...")

        # 添加User-Agent
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }

        # 发送请求
        response = requests.get(url, timeout=30, stream=True, headers=headers)
        response.raise_for_status()

        # 确定文件扩展名
        content_type = response.headers.get('content-type', '')
        if 'jpeg' in content_type or 'jpg' in content_type:
            ext = '.jpg'
        elif 'png' in content_type:
            ext = '.png'
        else:
            ext = '.jpg'  # 默认

        # 保存文件
        filename = f"{name}{ext}"
        filepath = images_dir / filename

        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)

        print(f"  [OK] {filename}")
        return filename

    except Exception as e:
        print(f"  [FAIL] {name} - {str(e)}")
        return None

def main():
    print("=" * 60)
    print("开始下载节气和传统节日背景图")
    print("=" * 60)
    print()

    # 下载节气图片
    print("【24节气】")
    solar_terms = {}
    for name, url in config['solar_terms'].items():
        filename = download_image(name, url, 'solar_terms')
        if filename:
            solar_terms[name] = filename
    print()

    # 下载传统节日图片
    print("【传统节日】")
    festivals = {}
    for name, url in config['festivals'].items():
        filename = download_image(name, url, 'festivals')
        if filename:
            festivals[name] = filename
    print()

    # 保存本地路径映射
    local_mapping = {
        'solar_terms': solar_terms,
        'festivals': festivals
    }

    mapping_file = Path(__file__).parent / 'images' / 'background_images_local.json'
    with open(mapping_file, 'w', encoding='utf-8') as f:
        json.dump(local_mapping, f, ensure_ascii=False, indent=2)

    print("=" * 60)
    print(f"下载完成!")
    print(f"节气: {len(solar_terms)}/24")
    print(f"节日: {len(festivals)}/14")
    print(f"保存位置: {images_dir}")
    print(f"本地映射: {mapping_file}")
    print("=" * 60)

if __name__ == '__main__':
    main()
