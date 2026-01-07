#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""测试Python后端API"""

import requests
import json
import time

def test_backend():
    print("=" * 60)
    print("测试Python后端API")
    print("=" * 60)

    # 测试健康检查
    print("\n[测试1] 健康检查")
    try:
        response = requests.get('http://localhost:5000/api/health')
        if response.status_code == 200:
            data = response.json()
            print("✓ 后端服务运行正常")
            print(f"  服务: {data.get('service')}")
            print(f"  SDK: {data.get('sdk')}")
            print(f"  套餐: {data.get('plan')}")
        else:
            print(f"✗ 后端服务异常: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ 无法连接到后端: {e}")
        print("\n请先启动后端: python api_server.py")
        return False

    # 测试模型列表
    print("\n[测试2] 模型列表")
    try:
        response = requests.get('http://localhost:5000/api/models')
        if response.status_code == 200:
            data = response.json()
            models = data.get('models', [])
            print(f"✓ 可用模型数量: {len(models)}")
            for model in models:
                print(f"  - {model.get('id')}: {model.get('name')}")
        else:
            print(f"✗ 获取模型列表失败: {response.status_code}")
    except Exception as e:
        print(f"✗ 请求失败: {e}")

    # 测试推荐生成（简单测试）
    print("\n[测试3] 推荐生成测试")
    test_prompt = "请推荐一道适合小寒节气的养生菜品，用JSON格式返回。"
    print(f"Prompt: {test_prompt}")

    try:
        start_time = time.time()
        response = requests.post(
            'http://localhost:5000/api/recommend',
            json={
                'prompt': test_prompt,
                'model': 'glm-4-flash',
                'max_tokens': 500,
                'temperature': 0.7
            },
            timeout=30
        )
        elapsed = time.time() - start_time

        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                content = data.get('content', '')
                print(f"✓ 推荐生成成功")
                print(f"  耗时: {elapsed:.2f}秒")
                print(f"  内容长度: {len(content)} 字符")
                print(f"  内容预览: {content[:100]}...")
            else:
                print(f"✗ 生成失败: {data.get('error')}")
        else:
            print(f"✗ HTTP错误: {response.status_code}")
            print(f"  错误详情: {response.text}")
    except Exception as e:
        print(f"✗ 请求异常: {e}")

    print("\n" + "=" * 60)
    print("测试完成")
    print("=" * 60)
    return True

if __name__ == '__main__':
    import sys
    if sys.platform == 'win32':
        import codecs
        sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

    test_backend()
