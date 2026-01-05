#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
替换小年和除夕的图片为纯风景
"""

import requests
from pathlib import Path

images_dir = Path(__file__).parent / 'images' / 'festival_art'

# 小年和除夕的新图片（纯风景）
new_images = {
    '小年': 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1920&q=80',  # 冬日风景
    '除夕': 'https://images.unsplash.com/photo-1464863979621-258659412f1f?w=1920&q=80',  # 雪景
    '春节': 'https://images.unsplash.com/photo-1518182170546-0764ce7c6a6a?w=1920&q=80',  # 冬季风景
    '惊蛰': 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1920&q=80',  # 春天
    '七夕节': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920&q=80',  # 花朵
    '祭灶节': 'https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=1920&q=80'  # 房屋
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
        # 使用现有图片作为备份
        backup_files = {
            '小年': '立冬.jpg',
            '除夕': '大寒.jpg',
            '春节': '大寒.jpg',
            '惊蛰': '春分.jpg',
            '七夕节': '秋分.jpg',
            '祭灶节': '立春.jpg'
        }
        if name in backup_files:
            src = images_dir / backup_files[name]
            dst = images_dir / f"{name}.jpg"
            if src.exists():
                import shutil
                shutil.copy(src, dst)
                print(f"  [BACKUP] 使用备份: {backup_files[name]}")
                return True
        return False

print("=" * 60)
print("替换小年、除夕等图片为纯风景")
print("=" * 60)
print()

success = 0
for name, url in new_images.items():
    if download_image(name, url):
        success += 1
        print()

print("=" * 60)
print(f"替换完成: {success}/{len(new_images)}")
print("=" * 60)
