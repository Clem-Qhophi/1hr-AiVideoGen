#!/usr/bin/env python3
"""print_beats.py — dump a project's beats.json timeline for inspection.

Usage:
  python tools/print_beats.py videos/<slug>
"""
import argparse
import json
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")


def main():
    ap = argparse.ArgumentParser(description="Print a project's beats.json timeline")
    ap.add_argument("project", help="project path (e.g. videos/gemini-3-7-release)")
    args = ap.parse_args()

    beats_path = Path(args.project) / "work" / "beats.json"
    if not beats_path.exists():
        sys.exit(f"no beats.json at {beats_path} — run tools/visual_director.py plan first")
    beats = json.loads(beats_path.read_text(encoding="utf-8")).get("beats", [])
    print(f"Total beats: {len(beats)}  ({beats_path})")
    for i, b in enumerate(beats):
        img_name = Path(b.get("image", "")).name
        t = b.get("text", "")
        print(f"Beat {i:02d} [{b['start_s']:05.1f}s - {b['end_s']:05.1f}s] "
              f"({b['duration_s']:04.1f}s) | Img: {img_name:<30} | {t}")


if __name__ == "__main__":
    main()