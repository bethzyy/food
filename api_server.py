#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
饮食推荐API服务器 - 使用Anthropic SDK
所有API调用都在GLM Coding Plan套餐内，不会产生额外费用
"""

import os
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
from anthropic import Anthropic

# 设置Windows控制台编码
if sys.platform == 'win32':
    try:
        import codecs
        sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
        sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')
    except:
        pass

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# 初始化Anthropic客户端（全局复用）
API_KEY = os.environ.get('ZHIPU_API_KEY')
if not API_KEY:
    print("ERROR: ZHIPU_API_KEY environment variable not set")
    sys.exit(1)

anthropic_client = Anthropic(
    api_key=API_KEY,
    base_url="https://open.bigmodel.cn/api/anthropic"
)

print("=" * 60)
print("饮食推荐API服务器启动")
print("=" * 60)
print(f"API Key已加载 (长度: {len(API_KEY)})")
print(f"Base URL: https://open.bigmodel.cn/api/anthropic")
print(f"SDK: Anthropic (套餐内调用)")
print("=" * 60)


@app.route('/api/recommend', methods=['POST'])
def generate_recommendation():
    """生成饮食推荐 - 使用Anthropic SDK在套餐内调用"""

    try:
        data = request.json
        prompt = data.get('prompt')
        model = data.get('model', 'glm-4-flash')
        max_tokens = data.get('max_tokens', 4096)
        temperature = data.get('temperature', 0.7)

        if not prompt:
            return jsonify({'error': 'Missing prompt'}), 400

        print(f"\n{'='*60}")
        print(f"收到推荐请求")
        print(f"模型: {model}")
        print(f"Prompt长度: {len(prompt)} 字符")
        print(f"{'='*60}")

        # 使用Anthropic SDK调用API（在套餐内）
        response = anthropic_client.messages.create(
            model=model,
            max_tokens=max_tokens,
            temperature=temperature,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        if response and response.content:
            content = response.content[0].text
            print(f"✓ 推荐生成成功")
            print(f"返回内容长度: {len(content)} 字符")

            return jsonify({
                'success': True,
                'content': content
            })
        else:
            print(f"✗ API返回空内容")
            return jsonify({'error': 'Empty response from API'}), 500

    except Exception as e:
        print(f"✗ 生成推荐失败: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查"""
    return jsonify({
        'status': 'ok',
        'service': '饮食推荐API服务器',
        'sdk': 'Anthropic',
        'plan': 'GLM Coding Plan (套餐内)',
        'models': ['glm-4-flash', 'glm-4.6', 'glm-4.7']
    })


@app.route('/api/models', methods=['GET'])
def list_models():
    """列出可用模型"""
    return jsonify({
        'models': [
            {'id': 'glm-4-flash', 'name': 'GLM-4 Flash', 'description': '快速模型'},
            {'id': 'glm-4.6', 'name': 'GLM-4.6', 'description': '标准模型'},
            {'id': 'glm-4.7', 'name': 'GLM-4.7', 'description': '高质量模型'}
        ]
    })


if __name__ == '__main__':
    PORT = 5000
    print(f"\n服务器启动在 http://localhost:{PORT}")
    print(f"健康检查: http://localhost:{PORT}/api/health")
    print(f"API端点: http://localhost:{PORT}/api/recommend")
    print(f"{'='*60}\n")

    app.run(
        host='localhost',
        port=PORT,
        debug=True
    )
