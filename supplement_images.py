#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
补充下载失败的节气和节日图片
"""

import requests
from pathlib import Path

images_dir = Path(__file__).parent / 'images' / 'festival_art'

missing_images = {
    '雨水': 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=80',
    '立冬': 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1920&q=80',
    '大雪': 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?w=1920&q=80',
    '小寒': 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=1920&q=80',
    '端午节': 'https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=1920&q=80',
    '中秋节': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
    '腊八节': 'https://images.unsplash.com/photo-1483664852095-d6cc6870705d?w=1920&q=80'
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
print("补充下载失败的图片")
print("=" * 60)
print()

success = 0
for name, url in missing_images.items():
    if download_image(name, url):
        success += 1

print()
print("=" * 60)
print(f"补充完成: {success}/{len(missing_images)}")
print("=" * 60)
