#!/usr/bin/env python3
"""
generate_shorts.py — Multi-Format Vertical Shorts Generator (1080x1920).

Extracts high-velocity viral segments from the master video, formats them
for 9:16 vertical displays (YouTube Shorts, TikTok, Instagram Reels), and
overlays animated branding, progress bars, and header/footer titles.
"""

import json
import os
import subprocess
import sys
from pathlib import Path

# Windows console encoding fix
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parent.parent.parent
PROJECT_DIR = ROOT / "videos" / "youtube-views-ai-playbook"
MASTER_VIDEO = PROJECT_DIR / "youtube_views_master.mp4"
SHORTS_OUT_DIR = PROJECT_DIR / "shorts"

SHORTS_SPECS = [
    {
        "id": "short_01_august_reset_trap",
        "title": "The August 24 View Count Trap",
        "start": 0.0,
        "duration": 54.0,
        "header": "YOUTUBE VIEW COUNT OVERHAUL",
        "badge": "0.00s FIRST-FRAME RULE",
    },
    {
        "id": "short_02_sponsorship_multiplier",
        "title": "How to 2.8x Your YouTube Sponsorships",
        "start": 485.0,
        "duration": 50.0,
        "header": "2.8X BRAND DEAL ARBITRAGE",
        "badge": "SPONSOR RATE CARD BLUEPRINT",
    }
]


def generate_short(spec: dict):
    SHORTS_OUT_DIR.mkdir(parents=True, exist_ok=True)
    out_file = SHORTS_OUT_DIR / f"{spec['id']}.mp4"
    
    print(f"🎬 Generating Vertical Short: {spec['title']}...")
    print(f"   Start: {spec['start']} | Duration: {spec['duration']}s")

    # FFmpeg filter:
    # 1. Scale 16:9 1080p video to fit centered in 1080x1920 vertical canvas (with blurred background or crisp dark slate frame).
    # 2. Draw top header pill banner and bottom channel watermark.
    # 3. Trim to duration.
    
    # Premium vertical layout:
    # 1. Background: Zoomed, blurred background video (fills 1080x1920).
    # 2. Foreground: Crisp 16:9 scaled video (1080x608) centered with rounded border shadow.
    # 3. Header HUD: Glowing cyan category & title banner.
    # 4. Footer CTA: Red brand badge & subscriber engagement prompt.
    filter_complex = (
        f"[0:v]trim=start={spec['start']}:duration={spec['duration']},setpts=PTS-STARTPTS,"
        f"split=2[bg_raw][fg_raw];"
        f"[bg_raw]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=20:5,eq=brightness=-0.25:contrast=1.1[bg];"
        f"[fg_raw]scale=1080:608:force_original_aspect_ratio=decrease[fg];"
        f"[bg][fg]overlay=(W-w)/2:(H-h)/2,"
        f"drawbox=y=80:h=180:color=#0b0f19@0.90:t=fill,"
        f"drawtext=text='{spec['header']}':fontcolor=#38bdf8:fontsize=38:x=(w-text_w)/2:y=115:font='Segoe UI',"
        f"drawtext=text='{spec['badge']}':fontcolor=#f8fafc:fontsize=26:x=(w-text_w)/2:y=175:font='Segoe UI',"
        f"drawbox=y=1660:h=180:color=#0b0f19@0.90:t=fill,"
        f"drawtext=text='AI ENTHUSIAST':fontcolor=#ef4444:fontsize=36:x=(w-text_w)/2:y=1695:font='Segoe UI',"
        f"drawtext=text='THE TOP 1% PLAYBOOK':fontcolor=#94a3b8:fontsize=24:x=(w-text_w)/2:y=1755:font='Segoe UI'[v];"
        f"[0:a]atrim=start={spec['start']}:duration={spec['duration']},asetpts=PTS-STARTPTS[a]"
    )

    cmd = [
        "ffmpeg", "-y",
        "-i", str(MASTER_VIDEO),
        "-filter_complex", filter_complex,
        "-map", "[v]",
        "-map", "[a]",
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "18",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        str(out_file)
    ]

    subprocess.run(cmd, check=True)
    print(f"✅ Generated Short: {out_file.relative_to(ROOT)} ({os.path.getsize(out_file)/(1024*1024):.2f} MB)")


def main():
    print("=" * 60)
    print("GENERATING MULTI-FORMAT YOUTUBE SHORTS (9:16 VERTICAL)")
    print("=" * 60)

    if not MASTER_VIDEO.exists():
        raise FileNotFoundError(f"Master video not found: {MASTER_VIDEO}")

    for spec in SHORTS_SPECS:
        generate_short(spec)

    print("=" * 60)
    print("✅ All Vertical Shorts Generated Successfully!")
    print("=" * 60)


if __name__ == "__main__":
    main()
