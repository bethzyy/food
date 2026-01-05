#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
替换包含人物的图片为纯风景图片
"""

import requests
from pathlib import Path

images_dir = Path(__file__).parent / 'images' / 'festival_art'

# 需要替换的图片（可能包含人物）
replace_images = {
    '惊蛰': 'https://images.unsplash.com/photo-1464863979621-258659412f1f?w=1920&q=80',  # 纯自然风景
    '芒种': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80',  # 麦田风景
    '七夕节': 'https://images.unsplash.com/photo-1418044535499-ce2a1bb4e72d?w=1920&q=80',  # 星空
    '春节': 'https://images.unsplash.com/photo-1483347752404-cbf69f21f402?w=1920&q=80',  # 冬日风景
    '祭灶节': 'https://images.unsplash.com/photo-1500937386694-2d9d7167dc5d?w=1920&q=80'  # 灶台风景
}

def download_image(name, url):
    """下载单个图片"""
    try:
        print(f"[DOWNLOAD] {name}...")

        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }

        response = requests.get(url, timeout=30, stream=True, headers=headers)
        response.raise_for_status()

        filename = f"{name}.jpg"
        filepath = images_dir / filename

        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)

        print(f"  [OK] {filename}")
        return True

    except Exception as e:
        print(f"  [FAIL] {name} - {str(e)}")
        return False

print("=" * 60)
print("替换包含人物的图片为纯风景")
print("=" * 60)
print()

success = 0
for name, url in replace_images.items():
    if download_image(name, url):
        success += 1
        print()

print("=" * 60)
print(f"替换完成: {success}/{len(replace_images)}")
print("=" * 60)
