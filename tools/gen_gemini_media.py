#!/usr/bin/env python3
"""
gen_gemini_media.py — Unified Gemini, Imagen & Veo Media Generation Engine.

Integrates Google DeepMind's flagship generative media models into the video pipeline:
  - Video Generation: Veo 3.1 (veo-3.1-generate-preview, veo-3.1-fast-generate-preview, veo-3.1-lite-generate-preview)
  - Image Generation: Imagen 3 (imagen-3.0-generate-002) & Gemini Flash Image (gemini-3.1-flash-image, gemini-2.5-flash-image)

Features:
  - High-resolution cinematic 16:9 / 9:16 video and image synthesis
  - Seamless output mapping for work/images/ beats in longform videos
  - Fallback mechanisms for billing and quota management

Usage:
  python tools/gen_gemini_media.py video --prompt "Hyper-realistic glowing quantum computer processor, 4k cinematic" --out work/images/quantum.mp4
  python tools/gen_gemini_media.py image --prompt "Futuristic HUD holographic dashboard showing AI neural net status" --out work/images/hud.png
  python tools/gen_gemini_media.py list-models
"""
import argparse
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


def get_client():
    from google import genai
    env = load_env()
    api_key = env.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("Missing GEMINI_API_KEY in .env")
    return genai.Client(api_key=api_key)


def list_models():
    client = get_client()
    print("\n--- Available Google Gemini Media Models ---")
    video_models = []
    image_models = []
    for m in client.models.list():
        name = m.name
        if "veo" in name.lower():
            video_models.append(name)
        elif "image" in name.lower() or "imagen" in name.lower():
            image_models.append(name)

    print("\n[Veo Video Models]:")
    for vm in video_models:
        print(f"  ⚡ {vm}")

    print("\n[Imagen / Gemini Image Models]:")
    for im in image_models:
        print(f"  🎨 {im}")
    print("-------------------------------------------\n")


def generate_image(prompt: str, out_path: Path, model: str = "imagen-3.0-generate-002", aspect: str = "16:9"):
    from google.genai import types
    client = get_client()
    out_path.parent.mkdir(parents=True, exist_ok=True)
    print(f"[IMAGE GEN] Generating image with {model}:")
    print(f"  Prompt: {prompt}")
    print(f"  Aspect: {aspect}")

    try:
        if "imagen" in model:
            config = types.GenerateImagesConfig(number_of_images=1, aspect_ratio=aspect)
            res = client.models.generate_images(model=model, prompt=prompt, config=config)
            if res.generated_images:
                out_path.write_bytes(res.generated_images[0].image.image_bytes)
                print(f"[IMAGE GEN] Saved {out_path} ({os.path.getsize(out_path)//1024} KB)")
                return out_path
        else:
            # Gemini multimodal image generation
            res = client.models.generate_content(
                model=model,
                contents=prompt,
                config={"response_modalities": ["IMAGE", "TEXT"]}
            )
            for part in res.candidates[0].content.parts:
                if hasattr(part, "inline_data") and part.inline_data:
                    out_path.write_bytes(part.inline_data.data)
                    print(f"[IMAGE GEN] Saved {out_path} ({os.path.getsize(out_path)//1024} KB)")
                    return out_path
    except Exception as e:
        err_str = str(e)
        if "RESOURCE_EXHAUSTED" in err_str or "429" in err_str or "limit: 0" in err_str:
            print(f"[QUOTA/BILLING REQUIRED] Gemini Image generation requires paid billing enabled in Google AI Studio.")
        raise


def generate_video(prompt: str, out_path: Path, model: str = "veo-3.1-fast-generate-preview", aspect: str = "16:9"):
    from google.genai import types
    client = get_client()
    out_path.parent.mkdir(parents=True, exist_ok=True)
    print(f"[VEO VIDEO] Starting video generation with {model}:")
    print(f"  Prompt: {prompt}")
    print(f"  Aspect: {aspect}")

    config = types.GenerateVideosConfig(aspect_ratio=aspect, number_of_videos=1)
    try:
        operation = client.models.generate_videos(model=model, prompt=prompt, config=config)
    except Exception as e:
        err_str = str(e)
        if "RESOURCE_EXHAUSTED" in err_str or "429" in err_str:
            print(f"[QUOTA/BILLING REQUIRED] Google Veo video generation requires paid billing enabled in Google AI Studio.")
        raise

    print(f"[VEO VIDEO] Operation: {operation.name}. Polling status...")
    start_time = time.time()
    while not operation.done:
        elapsed = int(time.time() - start_time)
        print(f"  ... rendering ({elapsed}s elapsed) ...")
        time.sleep(10)
        operation = client.operations.get(operation.name)
        if elapsed > 600:
            raise TimeoutError("Veo timed out after 600s")

    if operation.error:
        raise RuntimeError(f"Veo error: {operation.error}")

    result = operation.response
    if result.generated_videos:
        video_bytes = result.generated_videos[0].video.video_bytes
        out_path.write_bytes(video_bytes)
        print(f"[VEO VIDEO] SUCCESS! Saved video to {out_path} ({len(video_bytes)/1024/1024:.2f} MB)")
        return out_path


def main():
    parser = argparse.ArgumentParser(description="Unified Gemini, Imagen & Veo Media Generator")
    sub = parser.add_subparsers(dest="cmd")

    sub.add_parser("list-models", help="List all available image and video models")

    p_img = sub.add_parser("image", help="Generate AI Image")
    p_img.add_argument("--prompt", required=True)
    p_img.add_argument("--out", required=True)
    p_img.add_argument("--model", default="imagen-3.0-generate-002")
    p_img.add_argument("--aspect", default="16:9", choices=["16:9", "9:16", "1:1"])

    p_vid = sub.add_parser("video", help="Generate Veo AI Video")
    p_vid.add_argument("--prompt", required=True)
    p_vid.add_argument("--out", required=True)
    p_vid.add_argument("--model", default="veo-3.1-fast-generate-preview")
    p_vid.add_argument("--aspect", default="16:9", choices=["16:9", "9:16", "1:1"])

    args = parser.parse_args()

    if args.cmd == "list-models":
        list_models()
    elif args.cmd == "image":
        generate_image(args.prompt, Path(args.out), model=args.model, aspect=args.aspect)
    elif args.cmd == "video":
        generate_video(args.prompt, Path(args.out), model=args.model, aspect=args.aspect)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
