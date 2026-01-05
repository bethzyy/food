#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
import sys
import time
import statistics
import requests

# UTF-8输出设置
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())

API_URL = "https://open.bigmodel.cn/api/anthropic/v1/messages"

def get_api_key():
    api_key = os.environ.get("ZHIPU_API_KEY")
    if api_key:
        return api_key

    env_file = os.path.join(os.path.dirname(__file__), "config.env")
    if os.path.exists(env_file):
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                if line.startswith("ZHIPU_API_KEY="):
                    return line.split("=", 1)[1].strip()
    raise ValueError("API Key not found")

def test_model(model, prompt, max_tokens=1000):
    api_key = get_api_key()
    headers = {
        "Content-Type": "application/json",
        "x-api-key": api_key
    }
    payload = {
        "model": model,
        "max_tokens": max_tokens,
        "messages": [{"role": "user", "content": prompt}]
    }

    try:
        start = time.time()
        resp = requests.post(API_URL, headers=headers, json=payload, timeout=120)
        elapsed = int((time.time() - start) * 1000)

        if resp.status_code == 200:
            content = resp.json().get("content", [{}])[0].get("text", "")
            return elapsed, content, True
        else:
            return elapsed, f"HTTP {resp.status_code}", False
    except Exception as e:
        return 0, str(e), False

def main():
    print("=" * 70)
    print(" GLM Model Speed Test")
    print("=" * 70)
    print()

    try:
        api_key = get_api_key()
        print(f"[OK] API Key: {api_key[:10]}...{api_key[-4:]}")
    except ValueError as e:
        print(f"[ERROR] {e}")
        return

    print()

    # 测试提示词
    prompts = {
        "Simple": "1+1=? Answer with number only.",
        "Medium": "Explain AI, Machine Learning, and Neural Networks briefly.",
        "Complex": "As a nutritionist, provide detailed diet advice for a 35-year-old female office worker who wants to improve digestive health."
    }

    models = [
        {"name": "GLM-4-flash", "id": "glm-4-flash"},
        {"name": "GLM-4.7", "id": "glm-4.7"}
    ]

    all_results = {}

    for difficulty, prompt in prompts.items():
        print(f"\n{'='*70}")
        print(f" Test: {difficulty} Prompt ({len(prompt)} chars)")
        print(f"{'='*70}\n")

        max_tokens = 500 if difficulty == "Simple" else (1000 if difficulty == "Medium" else 2000)

        scenario_results = {}

        for model in models:
            print(f"[{model['name']}]")
            times = []
            success = 0

            for i in range(3):
                print(f"  Test {i+1}/3... ", end="", flush=True)
                elapsed, content, ok = test_model(model["id"], prompt, max_tokens)

                if ok:
                    times.append(elapsed)
                    success += 1
                    print(f"OK {elapsed}ms ({elapsed/1000:.2f}s) - {len(content)} chars")
                else:
                    print(f"FAIL - {content}")

            scenario_results[model["id"]] = {
                "times": times,
                "success": success,
                "total": 3
            }

            if times:
                avg = statistics.mean(times)
                min_t = min(times)
                max_t = max(times)
                print(f"  -> Average: {avg:.0f}ms ({avg/1000:.2f}s)")
                print(f"  -> Min: {min_t}ms, Max: {max_t}ms")
                print(f"  -> Success: {success}/3 ({success/3*100:.0f}%)")
            print()

        all_results[difficulty] = scenario_results

    # 总结
    print(f"\n{'='*70}")
    print(" SUMMARY")
    print(f"{'='*70}\n")

    for difficulty, results in all_results.items():
        print(f"\n[{difficulty}]")
        print("-" * 70)

        flash_times = results["glm-4-flash"]["times"]
        glm47_times = results["glm-4.7"]["times"]

        if flash_times and glm47_times:
            flash_avg = statistics.mean(flash_times)
            glm47_avg = statistics.mean(glm47_times)
            diff = ((glm47_avg - flash_avg) / glm47_avg) * 100

            print(f"GLM-4-flash: {flash_avg:.0f}ms ({flash_avg/1000:.2f}s)")
            print(f"GLM-4.7:    {glm47_avg:.0f}ms ({glm47_avg/1000:.2f}s)")
            print(f"Flash is {diff:.1f}% faster ({glm47_avg/flash_avg:.2f}x)")

            if diff > 50:
                print(f"[RECOMMEND] Use GLM-4-flash ({diff:.0f}% faster)")
            else:
                print(f"[INFO] Speed difference: {diff:.1f}%")

    print(f"\n{'='*70}")
    print(" CONCLUSION")
    print(f"{'='*70}\n")

    # 计算总体平均
    all_flash = []
    all_glm47 = []
    for r in all_results.values():
        all_flash.extend(r["glm-4-flash"]["times"])
        all_glm47.extend(r["glm-4.7"]["times"])

    if all_flash and all_glm47:
        flash_avg = statistics.mean(all_flash)
        glm47_avg = statistics.mean(all_glm47)
        diff = ((glm47_avg - flash_avg) / glm47_avg) * 100

        print(f"Overall Average:")
        print(f"  GLM-4-flash: {flash_avg/1000:.2f}s")
        print(f"  GLM-4.7:    {glm47_avg/1000:.2f}s")
        print(f"  Difference: {diff:.1f}%\n")

        print("Recommendations:")
        print("  [GLM-4-flash] Best for:")
        print("    - Real-time applications")
        print("    - Simple to medium tasks")
        print("    - Fast response required")
        print()
        print("  [GLM-4.7] Best for:")
        print("    - Highest quality required")
        print("    - Complex reasoning")
        print("    - Can wait longer")

        print(f"\n[FINAL] Use GLM-4-flash for diet app ({diff:.0f}% faster)")

    print(f"\n{'='*70}")
    print(" TEST COMPLETE")
    print(f"{'='*70}\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n[INTERRUPTED] Test cancelled by user")
    except Exception as e:
        print(f"\n\n[ERROR] {e}")
        import traceback
        traceback.print_exc()
