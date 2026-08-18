#!/usr/bin/env python3
"""
analyze_video.py — analyze a screen recording and generate a narration script.

Extracts key frames + timing info from a screen recording, then the LLM writes
a professional narration script that matches what's happening on screen.

No OCR needed — the user provides a brief description of what the video shows,
and the LLM writes a step-by-step script with timing that matches the video's
duration and visual flow.

Usage:
  python tools/analyze_video.py videos/video-1 --recording videos/video-1/recording.mp4 --description "Walking through the settings panel of an app"
  python tools/analyze_video.py videos/video-1 --recording videos/video-1/recording.mp4 --description "..." --delivery-mode calm-explainer

Outputs:
  <project>/work/script.md           the generated narration script
  <project>/work/video_analysis.json  frame timings + scene info
  <project>/work/keyframes/           extracted key frame thumbnails
"""
import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def probe_dur(path: str) -> float:
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=nw=1:nk=1", path],
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    return float(r.stdout.strip())


def probe_info(path: str) -> dict:
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries",
         "stream=width,height,r_frame_rate,codec_name",
         "-of", "json", path],
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    info = json.loads(r.stdout)
    streams = info.get("streams", [])
    vs = next((s for s in streams if s.get("codec_type") == "video"), {})
    return {
        "width": int(vs.get("width", 1920)),
        "height": int(vs.get("height", 1080)),
        "fps": vs.get("r_frame_rate", "30/1"),
        "codec": vs.get("codec_name", "unknown"),
    }


def extract_keyframes(video_path: str, out_dir: str, interval_s: float = 3.0) -> list[dict]:
    """Extract one frame every `interval_s` seconds. Returns list of {time_s, file}."""
    os.makedirs(out_dir, exist_ok=True)
    dur = probe_dur(video_path)
    frames = []
    t = 0.0
    idx = 0
    while t < dur:
        frame_path = os.path.join(out_dir, f"frame_{idx:04d}.jpg")
        subprocess.run(
            ["ffmpeg", "-y", "-ss", f"{t:.2f}", "-i", video_path,
             "-frames:v", "1", "-q:v", "3", frame_path],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        if os.path.exists(frame_path):
            frames.append({"time_s": round(t, 2), "file": frame_path, "index": idx})
        t += interval_s
        idx += 1
    return frames


def generate_script_from_analysis(description: str, duration: float, delivery_mode: str,
                                  goal: str, num_scenes: int) -> str:
    """Use the LLM to generate a narration script from the description + timing."""
    # Add the repo root to sys.path so we can import server.llm
    if ROOT not in sys.path:
        sys.path.insert(0, ROOT)
    from server import llm

    word_target = int(duration * 2.5)  # ~150 words/min

    enhanced_prompt = f"""Create a narration script for a SCREEN RECORDING TUTORIAL.

What the video shows: {description}
Video duration: {duration:.0f} seconds (~{word_target} words)
Delivery mode: {delivery_mode}
Goal: {goal}

The script should:
1. Match the video duration — don't write more than {word_target} words
2. Walk through what's happening on screen step by step
3. Use timing markers (## 0:00, ## 0:15, etc.) to indicate when each section should be narrated
4. Be conversational and natural — as if narrating live
5. Explain WHAT to do and WHY, not just describe what's visible
6. Include a hook at the start and a CTA at the end

Divide the script into {min(num_scenes, 8)} sections, each covering roughly {duration/min(num_scenes, 8):.0f} seconds of video.
"""

    return llm.generate_script(enhanced_prompt, delivery_mode, goal, max(1, int(duration / 60)))


def main():
    ap = argparse.ArgumentParser(description="Analyze screen recording and generate narration script")
    ap.add_argument("project", help="project dir (e.g. videos/video-1)")
    ap.add_argument("--recording", required=True, help="path to the screen recording MP4")
    ap.add_argument("--description", required=True, help="brief description of what the video shows")
    ap.add_argument("--delivery-mode", default="calm-explainer", help="delivery mode")
    ap.add_argument("--goal", default="followers", help="goal")
    ap.add_argument("--interval", type=float, default=3.0, help="seconds between keyframes")
    args = ap.parse_args()

    repo_root = Path(ROOT)
    project = repo_root / args.project
    work_dir = project / "work"
    work_dir.mkdir(parents=True, exist_ok=True)

    recording = args.recording
    if not os.path.isabs(recording):
        recording = str(repo_root / recording)
    if not os.path.exists(recording):
        sys.exit(f"Recording not found: {recording}")

    print(f"analyzing: {os.path.relpath(recording, repo_root)}")

    # 1. Probe video info
    info = probe_info(recording)
    duration = probe_dur(recording)
    print(f"  duration: {duration:.1f}s  {info['width']}x{info['height']}  {info['codec']}")

    # 2. Extract keyframes
    keyframes_dir = str(work_dir / "keyframes")
    print(f"extracting keyframes (every {args.interval}s) ...")
    frames = extract_keyframes(recording, keyframes_dir, args.interval)
    print(f"  {len(frames)} keyframes extracted")

    # 3. Save analysis
    analysis = {
        "recording": os.path.relpath(recording, repo_root),
        "duration_s": duration,
        "info": info,
        "keyframes": [{"time_s": f["time_s"], "index": f["index"]} for f in frames],
        "description": args.description,
        "delivery_mode": args.delivery_mode,
        "goal": args.goal,
    }
    (work_dir / "video_analysis.json").write_text(json.dumps(analysis, indent=2), encoding="utf-8")

    # 4. Generate script
    print("generating narration script ...")
    script = generate_script_from_analysis(
        args.description, duration, args.delivery_mode, args.goal, len(frames)
    )
    (work_dir / "script.md").write_text(script, encoding="utf-8")
    print(f"  script -> {os.path.relpath(str(work_dir / 'script.md'), repo_root)}")

    # 5. Copy the recording as the master (the voiceover will be composited over it)
    ref_dir = project / "reference"
    ref_dir.mkdir(parents=True, exist_ok=True)
    master_path = str(ref_dir / "master.mp4")
    if os.path.exists(master_path):
        os.remove(master_path)
    # Create a copy (or symlink) of the recording as the master
    subprocess.run(["ffmpeg", "-y", "-i", recording, "-c", "copy", master_path],
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    print(f"  master -> {os.path.relpath(master_path, repo_root)}")

    print(f"\nDone. {len(frames)} keyframes, {duration:.1f}s video, script generated.")


if __name__ == "__main__":
    main()
