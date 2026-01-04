#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GLM-4.7 API测试脚本
测试雅致中国风prompt的API调用和JSON解析
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

# 24节气
SOLAR_TERMS = {
    1: '小寒', 2: '大寒', 3: '立春', 4: '雨水', 5: '惊蛰', 6: '春分',
    7: '清明', 8: '谷雨', 9: '立夏', 10: '小满', 11: '芒种', 12: '夏至',
    13: '小暑', 14: '大暑', 15: '立秋', 16: '处暑', 17: '白露', 18: '秋分',
    19: '寒露', 20: '霜降', 21: '立冬', 22: '小雪', 23: '大雪', 24: '冬至'
}

def get_season(month):
    """根据月份获取季节"""
    if month >= 3 and month <= 5:
        return '春'
    elif month >= 6 and month <= 8:
        return '夏'
    elif month >= 9 and month <= 11:
        return '秋'
    else:
        return '冬'

def get_solar_term(month, day):
    """根据日期获取节气"""
    index = (month - 1) * 2 + day // 15
    return SOLAR_TERMS.get(min(index + 1, 24), '未知')

def load_prompt():
    """加载prompt文件"""
    prompt_path = os.path.join(os.path.dirname(__file__), 'prompts', 'food_recommendation_prompt.txt')

    if not os.path.exists(prompt_path):
        print(f"[ERROR] Prompt文件不存在: {prompt_path}")
        return None

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
        'solarTerm': get_solar_term(now.month, now.day),
        'season': get_season(now.month)
    }

    for key, value in params.items():
        prompt = prompt.replace(f'{{{key}}}', value)

    return prompt, params

def check_prompt_content(prompt):
    """检查prompt内容"""
    print("\n" + "="*60)
    print("检查Prompt内容")
    print("="*60)

    checks = {
        '古典称谓(阁下)': '阁下' in prompt,
        '黄帝内经': '黄帝内经' in prompt,
        '本草纲目': '本草纲目' in prompt,
        '黄历': '黄历' in prompt,
        '时辰': '时辰' in prompt,
        '天人合一': '天人合一' in prompt,
        '治未病': '治未病' in prompt,
        '君臣佐使': '君臣佐使' in prompt,
        'reasoning字段': 'reasoning' in prompt,
        '节气养生': '节气养生' in prompt,
    }

    all_passed = True
    for check_name, passed in checks.items():
        status = "[OK]" if passed else "[FAIL]"
        print(f"{status} {check_name}")
        if not passed:
            all_passed = False

    return all_passed

def parse_json_response(content):
    """解析JSON响应"""
    print("\n" + "="*60)
    print("解析JSON响应")
    print("="*60)

    # 方法1: 提取```json```代码块
    import re
    json_match = re.search(r'```json\s*([\s\S]*?)\s*```', content)
    if json_match:
        print("[INFO] 使用方法1: 提取```json```代码块")
        try:
            return json.loads(json_match.group(1))
        except json.JSONDecodeError as e:
            print(f"[ERROR] 方法1解析失败: {e}")

    # 方法2: 提取第一个{和最后一个}之间的内容
    first_brace = content.find('{')
    last_brace = content.rfind('}')
    if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
        print("[INFO] 使用方法2: 提取{{}}之间的内容")
        try:
            json_str = content[first_brace:last_brace + 1]
            return json.loads(json_str)
        except json.JSONDecodeError as e:
            print(f"[ERROR] 方法2解析失败: {e}")

    print("[ERROR] 所有JSON解析方法都失败")
    return None

def check_json_structure(data):
    """检查JSON结构"""
    print("\n" + "="*60)
    print("检查JSON结构")
    print("="*60)

    checks = {
        'dishes字段存在': False,
        'dishes是数组': False,
        'totalNutrition字段存在': False,
        'reasoning字段存在': False,
        'tips字段存在': False,
    }

    if 'dishes' in data:
        checks['dishes字段存在'] = True
        if isinstance(data['dishes'], list):
            checks['dishes是数组'] = True
            print(f"[INFO] 菜品数量: {len(data['dishes'])}道")

    if 'totalNutrition' in data:
        checks['totalNutrition字段存在'] = True

    if 'reasoning' in data:
        checks['reasoning字段存在'] = True
        print("[INFO] 推荐理由字段存在")
        if 'solarTerm' in data['reasoning']:
            print(f"[INFO] 节气理由: {data['reasoning']['solarTerm'][:50]}...")

    if 'tips' in data:
        checks['tips字段存在'] = True

    all_passed = True
    for check_name, passed in checks.items():
        status = "[OK]" if passed else "[FAIL]"
        print(f"{status} {check_name}")
        if not passed:
            all_passed = False

    return all_passed

def test_api_call():
    """测试API调用"""
    print("\n" + "="*60)
    print("开始GLM-4.7 API测试")
    print("="*60)

    # 1. 检查API Key
    api_key = os.environ.get('ZHIPU_API_KEY', '')
    if not api_key:
        print("[ERROR] ZHIPU_API_KEY环境变量未设置")
        print("[HINT] 请设置: $env:ZHIPU_API_KEY=\"your-key\"")
        return False

    print(f"[OK] API Key已设置 (长度: {len(api_key)})")

    # 2. 加载prompt
    result = load_prompt()
    if result is None:
        return False

    prompt, params = result

    print(f"[OK] Prompt已加载")
    print(f"[INFO] 测试参数:")
    print(f"      - 日期: {params['date']}")
    print(f"      - 时间: {params['time']}")
    print(f"      - 节气: {params['solarTerm']} ({params['season']})")
    print(f"      - 天气: {params['weather']}")
    print(f"      - 餐次: {params['mealPeriod']}")

    # 3. 检查prompt内容
    if not check_prompt_content(prompt):
        print("[WARN] Prompt内容检查有部分失败")

    # 4. 调用API
    print("\n" + "="*60)
    print("调用GLM-4.7 API")
    print("="*60)
    print("[INFO] 正在发送请求...")

    try:
        response = requests.post(
            'https://open.bigmodel.cn/api/paas/v4/chat/completions',
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {api_key}'
            },
            json={
                'model': 'glm-4-flash',
                'messages': [
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ],
                'temperature': 0.7,
                'max_tokens': 3000
            },
            timeout=60
        )

        if response.status_code != 200:
            print(f"[ERROR] API调用失败: HTTP {response.status_code}")
            print(f"[ERROR] 响应内容: {response.text}")
            return False

        print(f"[OK] API调用成功 (HTTP {response.status_code})")

        data = response.json()
        content = data.get('choices', [{}])[0].get('message', {}).get('content', '')

        if not content:
            print("[ERROR] API返回内容为空")
            return False

        print(f"[OK] API返回内容 (长度: {len(content)} 字符)")

        # 5. 解析JSON
        parsed_data = parse_json_response(content)

        if parsed_data is None:
            print("\n[ERROR] JSON解析失败")
            print("[INFO] 原始返回内容:")
            print("-" * 60)
            print(content[:1000])
            print("-" * 60)
            return False

        print("[OK] JSON解析成功")

        # 6. 检查JSON结构
        if not check_json_structure(parsed_data):
            print("[WARN] JSON结构检查有部分失败")

        # 7. 显示结果摘要
        print("\n" + "="*60)
        print("测试结果摘要")
        print("="*60)

        if 'dishes' in parsed_data and len(parsed_data['dishes']) > 0:
            dish = parsed_data['dishes'][0]
            print(f"[OK] 第一道菜: {dish.get('name', '未知')}")
            print(f"[OK] 类型: {dish.get('type', '未知')}")

        if 'reasoning' in parsed_data:
            reasoning = parsed_data['reasoning']
            print(f"[OK] 推荐理由:")
            for key, value in reasoning.items():
                if isinstance(value, str):
                    print(f"      - {key}: {value[:50]}...")

        print("\n" + "="*60)
        print("[SUCCESS] 测试通过!")
        print("="*60)

        # 保存结果到文件
        output_file = os.path.join(os.path.dirname(__file__), 'logs', 'api_test_result.json')
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(parsed_data, f, ensure_ascii=False, indent=2)
        print(f"[INFO] 完整结果已保存到: {output_file}")

        return True

    except requests.exceptions.Timeout:
        print("[ERROR] 请求超时")
        return False
    except Exception as e:
        print(f"[ERROR] 请求失败: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = test_api_call()
    sys.exit(0 if success else 1)
