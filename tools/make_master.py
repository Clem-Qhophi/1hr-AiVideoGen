#!/usr/bin/env python3
"""
make_master.py — create a master MP4 from a voiceover audio file.

For prompt-to-video (no camera footage): generates a branded background video
with the TTS voiceover as the audio track. This becomes the "master" that
tools/bake.py composites Remotion shots over. Where no shot is mapped, the
branded background shows (full-screen cutaways cover the rest).

The background is a dark gradient PNG generated with Pillow (using the brand
colors from remotion/src/brand.ts), then looped by ffmpeg for the audio's
duration. A subtle dotted-grid overlay is added for the "AI-studio" feel.

Usage:
  python tools/make_master.py videos/video-1
  python tools/make_master.py videos/video-1 --audio work/audio/voiceover.mp3
  python tools/make_master.py videos/video-1 --width 3840 --height 2160 --fps 60
  python tools/make_master.py videos/video-1 --bg paper    # light background

Outputs:
  <project>/reference/master.mp4   the master video (branded bg + voiceover audio)
"""
import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

BG_PRESETS = {
    "dark": {"top": (13, 17, 23), "bottom": (26, 26, 46), "grid": (255, 255, 255, 12)},
    "paper": {"top": (255, 254, 247), "bottom": (250, 248, 245), "grid": (26, 26, 46, 10)},
    "ink": {"top": (26, 26, 46), "bottom": (13, 17, 23), "grid": (99, 102, 241, 20)},
}


def run(cmd):
    r = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    if r.returncode != 0:
        sys.stderr.write("\nFFMPEG FAILED:\n  " + " ".join(cmd) + "\n" + r.stdout[-3000:] + "\n")
        raise SystemExit(1)
    return r.stdout


def probe_dur(path):
    return float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                      "-of", "default=nw=1:nk=1", path]).strip())


def best_h264():
    """Same probe-don't-assume rule as render_cuts/build_longform/bake (copied pattern;
    consolidate into a shared helper later): QSV is ~4x libx264 on this machine."""
    def ok(cmd):
        r = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        return r.returncode == 0 and "Could not open encoder" not in (r.stderr or "")
    for name, opts in (("h264_nvenc", ["-preset", "p5", "-rc", "vbr", "-cq", "22", "-b:v", "0"]),
                       ("h264_qsv", ["-global_quality", "22", "-preset", "medium"]),
                       ("h264_amf", ["-quality", "quality", "-rc", "cqp", "-qp_i", "22", "-qp_p", "22"]),
                       ("h264_mf", ["-rate_control", "quality", "-quality", "70"])):
        if ok(["ffmpeg", "-v", "error", "-f", "lavfi", "-i", "nullsrc=s=256x256:d=1",
               "-frames:v", "1", "-c:v", name, "-f", "null", "-"]):
            return name, opts
    return "libx264", ["-preset", "veryfast", "-crf", "20"]


def make_gradient_png(width, height, top_rgb, bottom_rgb, grid_rgba, out_path):
    """Generate a vertical gradient PNG with a subtle dotted grid overlay."""
    # build a 1xH column and stretch it — a vertical gradient has no horizontal variation,
    # so the per-pixel double loop was pure waste (8.3M pixel writes at 4K)
    col = Image.new("RGB", (1, height))
    px = col.load()
    tr, tg, tb = top_rgb
    br, bg, bb = bottom_rgb
    for y in range(height):
        t = y / max(height - 1, 1)
        px[0, y] = (int(tr + (br - tr) * t), int(tg + (bg - tg) * t), int(tb + (bb - tb) * t))
    img = col.resize((width, height), Image.BILINEAR)

    # overlay a subtle dotted grid (every 48px)
    if grid_rgba:
        overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)
        spacing = 48
        for x in range(0, width, spacing):
            for y in range(0, height, spacing):
                draw.ellipse([x - 1, y - 1, x + 1, y + 1], fill=grid_rgba)
        img = img.convert("RGBA")
        img = Image.alpha_composite(img, overlay)

    # temp file for one ffmpeg read — optimize=True just burns seconds on PNG compression
    img.convert("RGB").save(out_path, "PNG")


def main():
    ap = argparse.ArgumentParser(description="Create a master MP4 from voiceover audio")
    ap.add_argument("project", help="project dir (e.g. videos/video-1)")
    ap.add_argument("--audio", default=None, help="audio file (default: <project>/work/audio/voiceover.mp3)")
    ap.add_argument("--width", type=int, default=1920, help="video width (default 1920)")
    ap.add_argument("--height", type=int, default=1080, help="video height (default 1080)")
    ap.add_argument("--fps", type=int, default=30, help="frame rate (default 30)")
    ap.add_argument("--bg", choices=list(BG_PRESETS.keys()), default="dark",
                    help="background style (default dark)")
    ap.add_argument("--crf", type=int, default=18, help="H.264 quality (default 18, lower=better)")
    args = ap.parse_args()

    project = Path(ROOT) / args.project
    if not project.exists():
        sys.exit(f"project not found: {project}")

    audio = args.audio
    if audio is None:
        audio = str(project / "work" / "audio" / "voiceover.mp3")
    if not os.path.isabs(audio):
        audio = str(project / audio)
    if not os.path.exists(audio):
        sys.exit(f"audio not found: {audio}\n  Run tools/tts.py first to generate the voiceover.")

    ref_dir = project / "reference"
    ref_dir.mkdir(parents=True, exist_ok=True)
    out_path = str(ref_dir / "master.mp4")

    dur = probe_dur(audio)
    print(f"audio: {dur:.1f}s  bg: {args.bg}  {args.width}x{args.height}@{args.fps}")

    # generate gradient background PNG
    bg_path = str(project / "work" / "_bg.png")
    work_dir = project / "work"
    work_dir.mkdir(parents=True, exist_ok=True)
    preset = BG_PRESETS[args.bg]
    print("generating branded background ...")
    make_gradient_png(args.width, args.height, preset["top"], preset["bottom"],
                      preset["grid"], bg_path)

    # create video: loop PNG for audio duration + mux audio
    # Use -t with the audio duration (not -shortest) to avoid frame-rounding drift.
    # Static content + the best working encoder (QSV ~4x libx264 here).
    print("encoding master (this takes a moment) ...")
    enc, enc_opts = best_h264()
    run([
        "ffmpeg", "-y", "-hide_banner",
        "-loop", "1", "-i", bg_path, "-i", audio,
        "-c:v", enc] + enc_opts + [
        "-pix_fmt", "yuv420p", "-r", str(args.fps),
        "-c:a", "aac", "-b:a", "192k",
        "-t", f"{dur:.3f}", "-movflags", "+faststart",
        "-vf", f"scale={args.width}:{args.height}",
        out_path
    ])

    # cleanup bg png
    if os.path.exists(bg_path):
        os.remove(bg_path)

    # verify
    actual_dur = probe_dur(out_path)
    print(f"\nmaster -> {os.path.relpath(out_path, ROOT)}  ({actual_dur:.1f}s)")
    if abs(actual_dur - dur) > 0.2:
        print(f"  WARNING: duration drift {actual_dur - dur:+.2f}s vs audio")

    # write a basic timeline.json (all beats will be cutaways since no talking head)
    timeline = {
        "master": f"{args.project}/reference/master.mp4",
        "master_fps": args.fps,
        "remotion_out": "remotion/out",
        "shots": [],
        "preview": {
            "end_s": round(actual_dur, 2),
            "out": f"{args.project}/output/{Path(args.project).name}-preview.mp4",
            "width": args.width,
            "height": args.height,
            "fps": args.fps,
        },
    }
    timeline_path = project / "work" / "timeline.json"
    timeline_path.write_text(json.dumps(timeline, indent=2), encoding="utf-8")
    print(f"timeline -> {os.path.relpath(str(timeline_path), ROOT)}  (empty — /make-tsx will fill shots)")


if __name__ == "__main__":
    main()
