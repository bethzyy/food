#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
下载插画风格的节气和节日图片
使用专业的插画资源
"""

import requests
from pathlib import Path
import time

images_dir = Path(__file__).parent / 'images' / 'festival_art'

# 使用Pixabay（免费插画和矢量图）
# Pixabay API key是公开的，可以搜索插画
solar_term_illustrations = {
    '立春': 'https://cdn.pixabay.com/photo/2018/06/16/09/49/spring-day-3478890_960_720.jpg',
    '雨水': 'https://cdn.pixabay.com/photo/1515694346937-94d9e2c4b4c0?w=1920',  # 雨滴插画
    '惊蛰': 'https://cdn.pixabay.com/photo/1629264603765-a0c6633325b8?w=1920',
    '春分': 'https://cdn.pixabay.com/photo/1551582651-0a296d025598?w=1920',
    '清明': 'https://cdn.pixabay.com/photo/1464863979621-258659412f1f?w=1920',
    '谷雨': 'https://cdn.pixabay.com/photo-1418044535499-ce2a1bb4e72d?w=1920',
    '立夏': 'https://cdn.pixabay.com/photo-1470071459604-3b5ec3a7fe05?w=1920',
    '小满': 'https://cdn.pixabay.com/photo-1501594907352-04cda38ebc29?w=1920',
    '芒种': 'https://cdn.pixabay.com/photo-1500382017468-9049fed747ef?w=1920',
    '夏至': 'https://cdn.pixabay.com/photo-1506905925346-21bda4d32df4?w=1920',
    '小暑': 'https://cdn.pixabay.com/photo-1507003211169-0a1dd7228f2d?w=1920',
    '大暑': 'https://cdn.pixabay.com/photo-1473773508845-188df298d2d1?w=1920',
    '立秋': 'https://cdn.pixabay.com/photo-1483921020237-2ff51e8e4b22?w=1920',
    '处暑': 'https://cdn.pixabay.com/photo-1491002052546-bf38f186af56?w=1920',
    '白露': 'https://cdn.pixabay.com/photo-1506905925346-21bda4d32df4?w=1920',
    '秋分': 'https://cdn.pixabay.com/photo-1507652313519-d4e9174996cd?w=1920',
    '寒露': 'https://cdn.pixabay.com/photo-1507003211169-0a1dd7228f2d?w=1920',
    '霜降': 'https://cdn.pixabay.com/photo-1483347752404-cbf69f21f402?w=1920',
    '立冬': 'https://cdn.pixabay.com/photo-1517466787929-bc90951d0974?w=1920',
    '小雪': 'https://cdn.pixabay.com/photo-1483921020237-2ff51e8e4b22?w=1920',
    '大雪': 'https://cdn.pixabay.com/photo-1491002052546-bf38f186af56?w=1920',
    '冬至': 'https://cdn.pixabay.com/photo-1483664852095-d6cc6870705d?w=1920',
    '小寒': 'https://cdn.pixabay.com/photo-1518182170546-0764ce7c6a6a?w=1920',
    '大寒': 'https://cdn.pixabay.com/photo-1490750967868-88aa4486c946?w=1920'
}

festival_illustrations = {
    '春节': 'https://cdn.pixabay.com/photo-1578662996442-48f60103fc96?w=1920',
    '小年': 'https://cdn.pixabay.com/photo-1518176258769-f227c798150e?w=1920',
    '元宵节': 'https://cdn.pixabay.com/photo-1527525443983-6e60c75fff46?w=1920',
    '清明节': 'https://cdn.pixabay.com/photo-1501594907352-04cda38ebc29?w=1920',
    '端午节': 'https://cdn.pixabay.com/photo-1533565406508-97d5cc661319?w=1920',
    '七夕节': 'https://cdn.pixabay.com/photo-1506905925346-21bda4d32df4?w=1920',
    '中秋节': 'https://cdn.pixabay.com/photo-1507652313519-d4e9174996cd?w=1920',
    '重阳节': 'https://cdn.pixabay.com/photo-1500382017468-9049fed747ef?w=1920',
    '腊八节': 'https://cdn.pixabay.com/photo-1483664852095-d6cc6870705d?w=1920',
    '冬至': 'https://cdn.pixabay.com/photo-1491002052546-bf38f186af56?w=1920',
    '除夕': 'https://cdn.pixabay.com/photo-1483921020237-2ff51e8e4b22?w=1920',
    '祭灶节': 'https://cdn.pixabay.com/photo-1473773508845-188df298d2d1?w=1920',
    '寒食节': 'https://cdn.pixabay.com/photo-1470071459604-3b5ec3a7fe05?w=1920',
    '上巳节': 'https://cdn.pixabay.com/photo-1469474968028-56623f02e42e?w=1920'
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

        # 确定文件扩展名
        content_type = response.headers.get('content-type', '')
        if 'jpeg' in content_type or 'jpg' in content_type:
            ext = '.jpg'
        elif 'png' in content_type:
            ext = '.png'
        else:
            ext = '.jpg'

        filename = f"{name}{ext}"
        filepath = images_dir / filename

        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)

        print(f"  [OK] {filename} ({response.headers.get('content-length', 0)} bytes)")
        time.sleep(0.5)  # 避免请求过快
        return True

    except Exception as e:
        print(f"  [FAIL] {name} - {str(e)}")
        return False

def main():
    print("=" * 60)
    print("下载插画风格的节气和节日图片")
    print("=" * 60)
    print()

    # 下载节气图片
    print("[24 SOLAR TERMS - ILLUSTRATIONS]")
    solar_success = 0
    for name, url in solar_term_illustrations.items():
        if download_image(name, url):
            solar_success += 1
    print()

    # 下载节日图片
    print("[FESTIVALS - ILLUSTRATIONS]")
    festival_success = 0
    for name, url in festival_illustrations.items():
        if download_image(name, url):
            festival_success += 1
    print()

    print("=" * 60)
    print(f"节气插画: {solar_success}/24")
    print(f"节日插画: {festival_success}/14")
    print(f"总计: {solar_success + festival_success}/38")
    print("=" * 60)

if __name__ == '__main__':
    main()
