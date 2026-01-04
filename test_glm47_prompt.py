#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试GLM-4.7使用完整prompt
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

def load_prompt():
    """加载prompt文件"""
    prompt_path = os.path.join(os.path.dirname(__file__), 'prompts', 'food_recommendation_prompt.txt')

    with open(prompt_path, 'r', encoding='utf-8') as f:
        prompt = f.read()

    # 替换变量
    now = datetime.now()
    params = {
        'date': now.strftime('%Y-%m-%d'),
        'time': now.strftime('%H:%M'),
        'mealPeriod': '午餐',
        'dietType': '日常饮食',
        'weather': '晴',
        'solarTerm': '冬季',
        'season': '冬'
    }

    for key, value in params.items():
        prompt = prompt.replace(f'{{{key}}}', value)

    return prompt, params

def test_glm47_with_full_prompt():
    """测试GLM-4.7使用完整prompt"""

    api_key = os.environ.get('ZHIPU_API_KEY', '')
    if not api_key:
        print("[ERROR] ZHIPU_API_KEY环境变量未设置")
        return False

    print(f"[OK] API Key已设置")

    # 加载完整prompt
    prompt, params = load_prompt()

    print(f"[INFO] Prompt长度: {len(prompt)} 字符")
    print(f"[INFO] 测试参数: {params}")
    print(f"\n[Prompt前300字符预览]")
    print("=" * 60)
    print(prompt[:300])
    print("=" * 60)

    try:
        print("\n[INFO] 调用GLM-4.7 API...")
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
                'max_tokens': 4096
            },
            timeout=60
        )

        print(f"[INFO] HTTP状态码: {response.status_code}")

        if response.status_code != 200:
            print(f"[ERROR] API调用失败")
            print(f"[ERROR] 响应: {response.text}")
            return False

        data = response.json()
        print(f"[OK] API调用成功")

        content = data.get('choices', [{}])[0].get('message', {}).get('content', '')

        if not content or len(content) == 0:
            print(f"[ERROR] GLM-4.7返回空内容!")
            print(f"[INFO] 完整响应:")
            print(json.dumps(data, indent=2, ensure_ascii=False))
            return False

        print(f"[OK] 返回内容长度: {len(content)} 字符")
        print(f"\n[返回内容预览]")
        print("=" * 60)
        print(content[:500])
        print("=" * 60)

        # 尝试解析JSON
        try:
            import re
            json_match = re.search(r'```json\s*([\s\S]*?)\s*```', content)
            if json_match:
                result = json.loads(json_match.group(1))
                print(f"\n[OK] JSON解析成功")
                print(f"[INFO] 菜品数量: {len(result.get('dishes', []))}")
                return True
        except Exception as e:
            print(f"[WARN] JSON解析失败: {e}")

        return True

    except Exception as e:
        print(f"[ERROR] 测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = test_glm47_with_full_prompt()
    sys.exit(0 if success else 1)
