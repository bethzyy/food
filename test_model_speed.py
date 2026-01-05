#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
GLM模型速度对比测试脚本
测试 GLM-4-flash 和 GLM-4.7 的响应速度
"""

import os
import sys
import time
import json
import statistics
from typing import Dict, List, Tuple
import requests

# 设置UTF-8编码
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.detach())

# 测试配置
API_URL = "https://open.bigmodel.cn/api/anthropic/v1/messages"
TEST_COUNT = 3  # 每个模型测试次数

# 测试提示词
TEST_PROMPTS = {
    "简单": "请回答：1+1等于几？只回复数字。",
    "中等": """请详细解释以下概念：
1. 什么是人工智能？
2. 机器学习和深度学习的区别是什么？
3. 神经网络的基本原理。

请用简洁的语言回答，每个概念不超过50字。""",
    "复杂": """作为一名专业的营养师，请根据以下信息提供详细的饮食建议：

客户信息：
- 年龄：35岁
- 性别：女
- 职业：办公室职员
- 运动量：每周2-3次轻度运动
- 健康目标：改善消化系统健康

请提供：
1. 每日热量需求计算
2. 三大营养素（蛋白质、脂肪、碳水）的推荐摄入比例
3. 一日三餐的具体建议（包括食材和份量）
4. 需要避免的食物
5. 推荐的健康零食

请用专业但易懂的语言回答。"""
}


def get_api_key() -> str:
    """获取API Key"""
    # 优先从环境变量获取
    api_key = os.environ.get("ZHIPU_API_KEY")
    if api_key:
        return api_key

    # 尝试从.env文件读取
    env_file = os.path.join(os.path.dirname(__file__), "config.env")
    if os.path.exists(env_file):
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                if line.startswith("ZHIPU_API_KEY="):
                    return line.split("=", 1)[1].strip()

    raise ValueError("未找到API Key，请设置环境变量 ZHIPU_API_KEY 或在 config.env 中配置")


def test_model(model: str, prompt: str, max_tokens: int = 1000) -> Tuple[int, str, bool]:
    """
    测试单个模型的响应时间

    Args:
        model: 模型名称 (glm-4-flash 或 glm-4.7)
        prompt: 测试提示词
        max_tokens: 最大token数

    Returns:
        (响应时间ms, 返回内容, 是否成功)
    """
    api_key = get_api_key()

    headers = {
        "Content-Type": "application/json",
        "x-api-key": api_key
    }

    payload = {
        "model": model,
        "max_tokens": max_tokens,
        "messages": [{
            "role": "user",
            "content": prompt
        }]
    }

    try:
        start_time = time.time()
        response = requests.post(API_URL, headers=headers, json=payload, timeout=120)
        elapsed_time = int((time.time() - start_time) * 1000)  # 转换为毫秒

        if response.status_code == 200:
            data = response.json()
            content = data.get("content", [{}])[0].get("text", "")
            return elapsed_time, content, True
        else:
            error_msg = response.json().get("error", {}).get("message", f"HTTP {response.status_code}")
            return elapsed_time, error_msg, False

    except Exception as e:
        return 0, str(e), False


def run_comprehensive_test():
    """运行完整的对比测试"""
    print("=" * 80)
    print("[TEST] GLM Model Speed Comparison")
    print("=" * 80)
    print()

    # 获取API Key
    try:
        api_key = get_api_key()
        print(f"✓ API Key: {api_key[:10]}...{api_key[-4:]}")
        print()
    except ValueError as e:
        print(f"❌ 错误: {e}")
        return

    # 模型列表
    models = [
        {"name": "GLM-4-flash", "id": "glm-4-flash", "emoji": "⚡"},
        {"name": "GLM-4.7", "id": "glm-4.7", "emoji": "🧠"}
    ]

    # 测试配置
    test_configs = [
        {"complexity": "简单", "prompt": TEST_PROMPTS["简单"], "max_tokens": 500},
        {"complexity": "中等", "prompt": TEST_PROMPTS["中等"], "max_tokens": 1000},
        {"complexity": "复杂", "prompt": TEST_PROMPTS["复杂"], "max_tokens": 2000}
    ]

    # 存储所有测试结果
    all_results = {}

    for config in test_configs:
        complexity = config["complexity"]
        prompt = config["prompt"]
        max_tokens = config["max_tokens"]

        print("=" * 80)
        print(f"📝 测试场景: {complexity}提示词 ({len(prompt)}字符, max_tokens={max_tokens})")
        print("=" * 80)
        print()

        scenario_results = {}

        for model_info in models:
            model_name = model_info["name"]
            model_id = model_info["id"]
            emoji = model_info["emoji"]

            print(f"{emoji} 测试 {model_name}...")
            times = []
            success_count = 0

            for i in range(TEST_COUNT):
                print(f"  第{i+1}/{TEST_COUNT}次测试...", end=" ", flush=True)
                elapsed, content, success = test_model(model_id, prompt, max_tokens)

                if success:
                    times.append(elapsed)
                    success_count += 1
                    print(f"✓ {elapsed}ms ({elapsed/1000:.2f}秒) - 返回{len(content)}字符")
                else:
                    print(f"✗ 失败: {content}")

            # 计算统计数据
            scenario_results[model_id] = {
                "times": times,
                "success_count": success_count,
                "total_count": TEST_COUNT,
                "success_rate": (success_count / TEST_COUNT * 100) if TEST_COUNT > 0 else 0
            }

            # 显示统计
            if times:
                avg_time = statistics.mean(times)
                min_time = min(times)
                max_time = max(times)
                std_dev = statistics.stdev(times) if len(times) > 1 else 0

                print(f"  → 平均: {avg_time:.0f}ms ({avg_time/1000:.2f}秒)")
                print(f"  → 最快: {min_time}ms ({min_time/1000:.2f}秒)")
                print(f"  → 最慢: {max_time}ms ({max_time/1000:.2f}秒)")
                print(f"  → 标准差: {std_dev:.0f}ms")
                print(f"  → 成功率: {scenario_results[model_id]['success_rate']:.1f}%")
            else:
                print(f"  → ❌ 所有测试均失败")
            print()

        all_results[complexity] = scenario_results

    # 生成总结报告
    print("=" * 80)
    print("📊 测试总结报告")
    print("=" * 80)
    print()

    for complexity, scenario_results in all_results.items():
        print(f"\n【{complexity}提示词】")
        print("-" * 80)

        flash_times = scenario_results["glm-4-flash"]["times"]
        glm47_times = scenario_results["glm-4.7"]["times"]

        if flash_times and glm47_times:
            flash_avg = statistics.mean(flash_times)
            glm47_avg = statistics.mean(glm47_times)

            # 计算速度差异
            speed_diff = ((glm47_avg - flash_avg) / glm47_avg) * 100
            faster_by = glm47_avg / flash_avg

            print(f"GLM-4-flash 平均: {flash_avg:.0f}ms ({flash_avg/1000:.2f}秒)")
            print(f"GLM-4.7    平均: {glm47_avg:.0f}ms ({glm47_avg/1000:.2f}秒)")
            print(f"速度差异: GLM-4-flash 比 GLM-4.7 快 {speed_diff:.1f}% ({faster_by:.1f}x)")

            if speed_diff > 50:
                print(f"🏆 推荐: GLM-4-flash (速度快{speed_diff:.0f}%以上)")
            elif speed_diff > 20:
                print(f"👍 推荐: GLM-4-flash (速度明显更快)")
            else:
                print(f"⚖️  速度接近，可根据质量需求选择")
        else:
            if not flash_times:
                print("❌ GLM-4-flash 测试失败")
            if not glm47_times:
                print("❌ GLM-4.7 测试失败")

        print()

    # 最终建议
    print("=" * 80)
    print("💡 使用建议")
    print("=" * 80)
    print()

    # 计算所有场景的平均速度
    all_flash_times = []
    all_glm47_times = []

    for scenario_results in all_results.values():
        all_flash_times.extend(scenario_results["glm-4-flash"]["times"])
        all_glm47_times.extend(scenario_results["glm-4.7"]["times"])

    if all_flash_times and all_glm47_times:
        flash_avg = statistics.mean(all_flash_times)
        glm47_avg = statistics.mean(all_glm47_times)
        speed_diff = ((glm47_avg - flash_avg) / glm47_avg) * 100

        print(f"整体平均响应时间:")
        print(f"  • GLM-4-flash: {flash_avg/1000:.2f}秒")
        print(f"  • GLM-4.7:    {glm47_avg/1000:.2f}秒")
        print(f"  • 速度差异:   {speed_diff:.1f}%")
        print()

        print("推荐使用场景:")
        print(f"  ⚡ GLM-4-flash - 适合:")
        print(f"     • 需要快速响应的场景 (如实时对话)")
        print(f"     • 简单到中等复杂度的任务")
        print(f"     • 对响应速度要求高的应用")
        print()

        print(f"  🧠 GLM-4.7 - 适合:")
        print(f"     • 对输出质量要求极高的场景")
        print(f"     • 复杂推理和深度分析任务")
        print(f"     • 可以接受较长等待时间的应用")
        print()

        if speed_diff > 50:
            print(f"🎯 建议: 在饮食推荐应用中使用 GLM-4-flash")
            print(f"   理由: 速度快{speed_diff:.0f}%，用户体验更好，质量足够")
        else:
            print(f"🎯 建议: 可以根据实际需求选择")
            print(f"   理由: 速度差异较小，可以平衡速度和质量")

    print()
    print("=" * 80)
    print("✅ 测试完成")
    print("=" * 80)


if __name__ == "__main__":
    try:
        run_comprehensive_test()
    except KeyboardInterrupt:
        print("\n\n⚠️  测试被用户中断")
    except Exception as e:
        print(f"\n\n❌ 测试出错: {e}")
        import traceback
        traceback.print_exc()
