#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
快速检查节气和传统节日图片URL的有效性（详细版）
"""

import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
import sys
import json

# 24节气图片
solar_terms = {
    '立春': 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1920&q=80',
    '雨水': 'https://images.unsplash.com/photo-1518173946687-a4c036bc6c9f?w=1920&q=80',
    '惊蛰': 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80',
    '春分': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920&q=80',
    '清明': 'https://images.unsplash.com/photo-1527525443983-6e60c75fff46?w=1920&q=80',
    '谷雨': 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=80',
    '立夏': 'https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=1920&q=80',
    '小满': 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1920&q=80',
    '芒种': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80',
    '夏至': 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=80',
    '小暑': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80',
    '大暑': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80',
    '立秋': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
    '处暑': 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80',
    '白露': 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1920&q=80',
    '秋分': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920&q=80',
    '寒露': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80',
    '霜降': 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1920&q=80',
    '立冬': 'https://images.unsplash.com/photo-1483664852095-d6cc6870705d?w=1920&q=80',
    '小雪': 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1920&q=80',
    '大雪': 'https://images.unsplash.com/photo-1483347752404-cbf69f21f402?w=1920&q=80',
    '冬至': 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=1920&q=80',
    '小寒': 'https://images.unsplash.com/photo-1518182170546-0764ce7c6a6a?w=1920&q=80',
    '大寒': 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?w=1920&q=80'
}

# 传统节日图片
festivals = {
    '春节': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&q=80',
    '元宵节': 'https://images.unsplash.com/photo-1518176258769-f227c798150e?w=1920&q=80',
    '清明节': 'https://images.unsplash.com/photo-1527525443983-6e60c75fff46?w=1920&q=80',
    '端午节': 'https://images.unsplash.com/photo-1533565406508-97d5cc661319?w=1920&q=80',
    '七夕节': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
    '中秋节': 'https://images.unsplash.com/photo-1507652313519-d4e9174996cd?w=1920&q=80',
    '重阳节': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
    '冬至（节日）': 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=1920&q=80',
    '除夕': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&q=80'
}

def check_url(name, url):
    """检查单个URL的有效性"""
    try:
        response = requests.head(url, timeout=10, allow_redirects=True)
        if response.status_code == 200:
            return name, url, True, 'OK'
        else:
            return name, url, False, f'HTTP {response.status_code}'
    except requests.exceptions.Timeout:
        return name, url, False, 'Timeout'
    except requests.exceptions.RequestException as e:
        return name, url, False, str(e)[:50]

def main():
    all_images = {**solar_terms, **festivals}

    success_list = []
    fail_list = []

    print("Checking image URLs...")
    print()

    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(check_url, name, url): (name, url)
                   for name, url in all_images.items()}

        for future in as_completed(futures):
            name, url = futures[future]
            try:
                name, url, success, message = future.result()
                if success:
                    success_list.append(name)
                    print(f"[OK] {name}")
                else:
                    fail_list.append((name, url, message))
                    print(f"[FAIL] {name} - {message}")

            except Exception as e:
                fail_list.append((name, url, str(e)))
                print(f"[ERROR] {name} - {e}")

    print()
    print("=" * 80)
    print(f"Total: {len(all_images)} images")
    print(f"Success: {len(success_list)}")
    print(f"Failed: {len(fail_list)}")
    print("=" * 80)

    if fail_list:
        print()
        print("FAILED IMAGES:")
        print("-" * 80)
        for name, url, error in fail_list:
            print(f"{name}:")
            print(f"  URL: {url}")
            print(f"  Error: {error}")
            print()

        # Save failed list to JSON
        with open('failed_images.json', 'w', encoding='utf-8') as f:
            json.dump([{name: url} for name, url, _ in fail_list], f, ensure_ascii=False, indent=2)
        print("Failed URLs saved to: failed_images.json")

        return 1
    else:
        print()
        print("[SUCCESS] All image URLs are valid!")
        return 0

if __name__ == '__main__':
    sys.exit(main())
