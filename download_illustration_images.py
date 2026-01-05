#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
下载节气和传统节日插画背景图
使用插画风格的图片资源
"""

import requests
import json
import os
from pathlib import Path

# 24节气插画风格图片URL
solar_term_images = {
    '立春': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&q=80',  # 插画风格
    '雨水': 'https://images.unsplash.com/photo-1518173946687-a4c036bc6c9f?w=1920&q=80',
    '惊蛰': 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1920&q=80',
    '春分': 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80',
    '清明': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920&q=80',
    '谷雨': 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=80',
    '立夏': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
    '小满': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80',
    '芒种': 'https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=1920&q=80',
    '夏至': 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1920&q=80',
    '小暑': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80',
    '大暑': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80',
    '立秋': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
    '处暑': 'https://images.unsplash.com/photo-1483664852095-d6cc6870705d?w=1920&q=80',
    '白露': 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1920&q=80',
    '秋分': 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=1920&q=80',
    '寒露': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80',
    '霜降': 'https://images.unsplash.com/photo-1527525443983-6e60c75fff46?w=1920&q=80',
    '立冬': 'https://images.unsplash.com/photo-1483347752404-cbf69f21f402?w=1920&q=80',
    '小雪': 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1920&q=80',
    '大雪': 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?w=1920&q=80',
    '冬至': 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=1920&q=80',
    '小寒': 'https://images.unsplash.com/photo-1518182170546-0764ce7c6a6a?w=1920&q=80',
    '大寒': 'https://images.unsplash.com/photo-1483664852095-d6cc6870705d?w=1920&q=80'
}

# 传统节日插画风格图片URL
festival_images = {
    '春节': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&q=80',
    '小年': 'https://images.unsplash.com/photo-1518176258769-f227c798150e?w=1920&q=80',
    '元宵节': 'https://images.unsplash.com/photo-1527525443983-6e60c75fff46?w=1920&q=80',
    '清明节': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920&q=80',
    '端午节': 'https://images.unsplash.com/photo-1533565406508-97d5cc661319?w=1920&q=80',
    '七夕节': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
    '中秋节': 'https://images.unsplash.com/photo-1507652313519-d4e9174996cd?w=1920&q=80',
    '重阳节': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80',
    '腊八节': 'https://images.unsplash.com/photo-1483664852095-d6cc6870705d?w=1920&q=80',
    '冬至': 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=1920&q=80',
    '除夕': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&q=80',
    '祭灶节': 'https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=1920&q=80',
    '寒食节': 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80',
    '上巳节': 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=80'
}

# 创建保存目录
images_dir = Path(__file__).parent / 'images' / 'festival_art'
images_dir.mkdir(exist_ok=True)

def download_image(name, url, category):
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

        print(f"  [OK] {filename}")
        return filename

    except Exception as e:
        print(f"  [FAIL] {name} - {str(e)}")
        return None

def main():
    print("=" * 60)
    print("开始下载节气和传统节日插画背景图")
    print("=" * 60)
    print()

    # 下载节气图片
    print("[24 SOLAR TERMS]")
    solar_terms = {}
    for name, url in solar_term_images.items():
        filename = download_image(name, url, 'solar_terms')
        if filename:
            solar_terms[name] = filename
    print()

    # 下载传统节日图片
    print("[TRADITIONAL FESTIVALS]")
    festivals = {}
    for name, url in festival_images.items():
        filename = download_image(name, url, 'festivals')
        if filename:
            festivals[name] = filename
    print()

    # 保存本地路径映射
    local_mapping = {
        'solar_terms': solar_terms,
        'festivals': festivals
    }

    mapping_file = Path(__file__).parent / 'images' / 'art_images_mapping.json'
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
