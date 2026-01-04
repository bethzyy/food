#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试GLM-4.7 API调用
"""

import os
import sys
import json
import requests
from datetime import datetime

# 设置Windows控制台编码
if sys.platform == 'win32':
    try:
        import codecs
        sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
        sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')
    except:
        pass

def test_glm47():
    """测试GLM-4.7 API"""

    # 获取API Key
    api_key = os.environ.get('ZHIPU_API_KEY', '')
    if not api_key:
        print("[ERROR] ZHIPU_API_KEY环境变量未设置")
        return False

    print(f"[OK] API Key已设置 (长度: {len(api_key)})")

    # 简单的测试prompt
    prompt = "请推荐一道适合小寒节气的养生菜品,用JSON格式返回。"

    print(f"[INFO] 开始测试GLM-4.7 API...")
    print(f"[INFO] Prompt: {prompt}")

    try:
        response = requests.post(
            'https://open.bigmodel.cn/api/paas/v4/chat/completions',
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {api_key}'
            },
            json={
                'model': 'glm-4.7',
                'messages': [
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ],
                'temperature': 0.7,
                'max_tokens': 1000
            },
            timeout=60
        )

        print(f"[INFO] HTTP状态码: {response.status_code}")

        if response.status_code != 200:
            print(f"[ERROR] API调用失败")
            print(f"[ERROR] 响应内容: {response.text}")
            return False

        data = response.json()
        print(f"[OK] API调用成功")

        content = data.get('choices', [{}])[0].get('message', {}).get('content', '')

        if not content:
            print("[ERROR] 返回内容为空")
            return False

        print(f"[OK] 返回内容长度: {len(content)} 字符")
        print(f"\n[INFO] 返回内容预览:")
        print("-" * 60)
        print(content[:500])
        print("-" * 60)

        print(f"\n[SUCCESS] GLM-4.7 API测试成功!")
        return True

    except Exception as e:
        print(f"[ERROR] 测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = test_glm47()
    sys.exit(0 if success else 1)
