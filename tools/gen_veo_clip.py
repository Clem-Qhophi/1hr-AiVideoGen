#!/usr/bin/env python3
"""
gen_veo_clip.py — Generate cinematic AI video b-roll using Google DeepMind's Veo.

Generates high-definition 16:9 / 9:16 video clips from text prompts or reference images
using Google's Veo 3.1 / 2.0 video generation models.

Features:
  - Supports veo-3.1-generate-preview, veo-3.1-fast-generate-preview, veo-3.1-lite-generate-preview
  - Automatic asynchronous operation polling with progress updates
  - Directly downloads and saves the generated MP4 clip
  - Compatible with tools/build_longform.py and tools/visual_director.py (supports MP4 beats)

Usage:
  python tools/gen_veo_clip.py --prompt "Cinematic flying camera through futuristic neon AI server racks" --out work/images/veo-server.mp4
  python tools/gen_veo_clip.py --prompt "..." --aspect 16:9 --model veo-3.1-fast-generate-preview
  python tools/gen_veo_clip.py --check-access
"""
import argparse
import json
import os
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")


def load_env():
    env = {}
    p = ROOT / ".env"
    if p.exists():
        for line in p.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip().strip('"').strip("'")
    return {**env, **os.environ}


def check_veo_access():
    """Checks if GEMINI_API_KEY has Veo models enabled."""
    from google import genai
    env = load_env()
    api_key = env.get("GEMINI_API_KEY")
    if not api_key:
        print("[FAIL] Missing GEMINI_API_KEY in .env")
        return False

    client = genai.Client(api_key=api_key)
    print("Checking available models for GEMINI_API_KEY...")
    veo_models = []
    try:
        for m in client.models.list():
            if "veo" in m.name.lower():
                veo_models.append(m.name)
        if veo_models:
            print(f"[OK] Found {len(veo_models)} Veo models:")
            for vm in veo_models:
                print(f"  - {vm}")
            return True
        else:
            print("[WARN] No Veo models listed for this key.")
            return False
    except Exception as e:
        print(f"[ERROR] Failed to query models: {e}")
        return False


def generate_veo_video(prompt: str, out_path: Path, model: str = "veo-3.1-fast-generate-preview",
                       aspect_ratio: str = "16:9", image_ref: Path = None):
    """
    Generates a video clip using Google Veo, polls the operation, and saves the MP4.
    """
    from google import genai
    from google.genai import types

    env = load_env()
    api_key = env.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("Missing GEMINI_API_KEY in .env")

    client = genai.Client(api_key=api_key)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    print(f"\n[VEO] Initiating video generation:")
    print(f"  Model       : {model}")
    print(f"  Prompt      : {prompt}")
    print(f"  Aspect Ratio: {aspect_ratio}")
    print(f"  Destination : {out_path}")

    config = types.GenerateVideosConfig(
        aspect_ratio=aspect_ratio,
        number_of_videos=1,
    )

    try:
        operation = client.models.generate_videos(
            model=model,
            prompt=prompt,
            config=config,
        )
    except Exception as e:
        err_str = str(e)
        if "RESOURCE_EXHAUSTED" in err_str or "429" in err_str:
            print(f"\n[QUOTA EXCEEDED / BILLING REQUIRED]")
            print(f"Google Veo video generation requires an active pay-as-you-go billing tier in Google AI Studio.")
            print(f"Visit: https://aistudio.google.com/ or https://console.cloud.google.com/ to link a billing account.")
        raise

    print(f"[VEO] Operation created: {operation.name}. Polling for video completion...")

    poll_interval = 10
    max_wait = 600  # 10 minutes max
    start_time = time.time()

    while not operation.done:
        elapsed = int(time.time() - start_time)
        print(f"  ... rendering in progress ({elapsed}s elapsed) ...")
        time.sleep(poll_interval)
        operation = client.operations.get(operation.name)
        if elapsed > max_wait:
            raise TimeoutError(f"Veo video generation timed out after {max_wait}s")

    if operation.error:
        raise RuntimeError(f"Veo generation failed: {operation.error}")

    result = operation.response
    if not result.generated_videos:
        raise RuntimeError("Veo completed but returned no video stream.")

    video_bytes = result.generated_videos[0].video.video_bytes
    out_path.write_bytes(video_bytes)
    print(f"[VEO] SUCCESS! Saved video to {out_path} ({len(video_bytes) / 1024 / 1024:.2f} MB)")
    return out_path


def main():
    parser = argparse.ArgumentParser(description="Google DeepMind Veo Video Generator")
    parser.add_argument("--prompt", help="Text prompt describing the scene")
    parser.add_argument("--out", help="Output MP4 file path")
    parser.add_argument("--model", default="veo-3.1-fast-generate-preview",
                        help="Veo model (veo-3.1-fast-generate-preview, veo-3.1-generate-preview, veo-3.1-lite-generate-preview)")
    parser.add_argument("--aspect", default="16:9", choices=["16:9", "9:16", "1:1"])
    parser.add_argument("--check-access", action="store_true", help="Test Veo API access and list available models")

    args = parser.parse_args()

    if args.check_access:
        check_veo_access()
        return

    if not args.prompt or not args.out:
        parser.error("--prompt and --out are required for video generation.")

    generate_veo_video(args.prompt, Path(args.out), model=args.model, aspect_ratio=args.aspect)


if __name__ == "__main__":
    main()
