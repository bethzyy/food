#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试智谱AI API Key - 从环境变量读取
"""

import requests
import json
import os

# 从环境变量读取API Key
API_KEY = os.environ.get('ZHIPU_API_KEY', '')

if not API_KEY:
    print("❌ 错误: 未找到环境变量 ZHIPU_API_KEY")
    print("请先设置环境变量:")
    print("  Windows CMD: set ZHIPU_API_KEY=your-api-key")
    print("  Windows PowerShell: $env:ZHIPU_API_KEY='your-api-key'")
    print("  Linux/Mac: export ZHIPU_API_KEY='your-api-key'")
    exit(1)

# 测试1: Anthropic兼容格式
print("=" * 60)
print("测试1: Anthropic兼容格式")
print("=" * 60)

url1 = "https://open.bigmodel.cn/api/anthropic/v1/messages"
headers1 = {
    "Content-Type": "application/json",
    "x-api-key": API_KEY
}
data1 = {
    "model": "glm-4-flash",
    "messages": [{"role": "user", "content": "1+1=?"}],
    "max_tokens": 100
}

print(f"URL: {url1}")
print(f"Headers: {headers1}")
print(f"Data: {json.dumps(data1, indent=2)}")
print()

try:
    response = requests.post(url1, headers=headers1, json=data1, timeout=10)
    print(f"状态码: {response.status_code}")
    print(f"响应: {response.text}")
except Exception as e:
    print(f"错误: {e}")

print()

# 测试2: OpenAI兼容格式
print("=" * 60)
print("测试2: OpenAI兼容格式")
print("=" * 60)

url2 = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
headers2 = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {API_KEY}"
}
data2 = {
    "model": "glm-4-flash",
    "messages": [{"role": "user", "content": "1+1=?"}]
}

print(f"URL: {url2}")
print(f"Headers: {headers2}")
print(f"Data: {json.dumps(data2, indent=2)}")
print()

try:
    response = requests.post(url2, headers=headers2, json=data2, timeout=10)
    print(f"状态码: {response.status_code}")
    print(f"响应: {response.text}")
except Exception as e:
    print(f"错误: {e}")

print()

# 测试3: 使用zhipuai SDK
print("=" * 60)
print("测试3: 尝试使用zhipuai Python SDK")
print("=" * 60)

try:
    from zhipuai import ZhipuAI
    client = ZhipuAI(api_key=API_KEY)
    response = client.chat.completions.create(
        model="glm-4-flash",
        messages=[{"role": "user", "content": "1+1=?"}]
    )
    print(f"成功! 响应: {response}")
except ImportError:
    print("zhipuai SDK未安装,跳过此测试")
    print("安装命令: pip install zhipuai")
except Exception as e:
    print(f"错误: {e}")
    print(f"错误类型: {type(e).__name__}")

print()
print("=" * 60)
print("测试完成")
print("=" * 60)
