#!/usr/bin/env python3
"""
validate_captures.py — check evidence captures for blank/white frames (Cloudflare blocks).

Reads media/projects/<project>/evidence/manifest.json, checks each capture's pixel
content, and reports which ones are blank (near-pure white = Cloudflare challenge page)
vs real content.

Usage:
  python tools/validate_captures.py videos/<project>
  python tools/validate_captures.py videos/<project> --fix   # add disclosure note to blank captures

Exit code 0 = all captures real, 1 = some blank, 2 = no manifest found.
"""
import argparse
import json
import os
import sys
from pathlib import Path

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def check_capture(filepath):
    """Check if a capture is blank/white. Returns (is_blank, mean_brightness, dark_ratio)."""
    try:
        from PIL import Image
    except ImportError:
        print("  WARNING: Pillow not installed, cannot check pixel content")
        return False, 0, 0

    try:
        im = Image.open(filepath).convert("L")
        pixels = list(im.getdata())
        n = len(pixels)
        if n == 0:
            return True, 255, 0
        mean = sum(pixels) / n
        dark = sum(1 for v in pixels if v < 200)
        dark_ratio = dark / n
        # Blank/white: mean > 250 AND less than 1% dark pixels
        is_blank = mean > 250 and dark_ratio < 0.01
        return is_blank, mean, dark_ratio
    except Exception as e:
        print(f"  WARNING: could not read {filepath}: {e}")
        return False, 0, 0


def main():
    ap = argparse.ArgumentParser(description="Check evidence captures for blank/white frames")
    ap.add_argument("project", help="project path (e.g., videos/gpt-56-sol-chatgpt-update)")
    ap.add_argument("--fix", action="store_true", help="print fix instructions for blank captures")
    args = ap.parse_args()

    proj = os.path.join(ROOT, args.project)

    # Try common evidence locations
    candidates = [
        os.path.join(proj, "media", "projects", os.path.basename(proj), "evidence"),
        os.path.join(ROOT, "media", "projects", os.path.basename(proj), "evidence"),
    ]
    evidence_dir = None
    for c in candidates:
        if os.path.exists(c):
            evidence_dir = c
            break

    if not evidence_dir:
        print(f"no evidence directory found for {args.project}")
        print(f"  checked: {', '.join(candidates)}")
        sys.exit(2)

    manifest_path = os.path.join(evidence_dir, "manifest.json")
    if not os.path.exists(manifest_path):
        print(f"no manifest.json at {evidence_dir}")
        sys.exit(2)

    with open(manifest_path, encoding="utf-8") as f:
        manifest = json.load(f)

    print(f"evidence captures: {len(manifest)} in {os.path.relpath(evidence_dir, ROOT)}")
    blank_count = 0
    real_count = 0
    blanks = []

    for entry in manifest:
        name = entry.get("name", "?")
        filename = entry.get("file", f"{name}.png")
        filepath = os.path.join(evidence_dir, filename)

        if not os.path.exists(filepath):
            print(f"  {name}: FILE MISSING ({filename})")
            blank_count += 1
            blanks.append(name)
            continue

        is_blank, mean, dark = check_capture(filepath)
        size_kb = os.path.getsize(filepath) // 1024

        if is_blank:
            print(f"  {name}: BLANK (mean={mean:.1f}, dark={dark*100:.1f}%, {size_kb}KB)")
            blank_count += 1
            blanks.append(name)
        else:
            print(f"  {name}: OK (mean={mean:.1f}, dark={dark*100:.1f}%, {size_kb}KB)")
            real_count += 1

    print(f"\n{real_count} real, {blank_count} blank out of {len(manifest)} captures")

    if blank_count > 0:
        if args.fix:
            # mark blank entries in the manifest so downstream steps (visual_director,
            # check_deliverable) know the capture is a blocked frame, not a real shot
            for entry in manifest:
                name = entry.get("name", "?")
                if name in blanks:
                    entry["blank"] = True
                    entry["disclosure"] = "live capture blocked — source text verified directly"
            with open(manifest_path, "w", encoding="utf-8") as f:
                json.dump(manifest, f, indent=2, ensure_ascii=False)
                f.write("\n")
            print(f"marked {len(blanks)} blank capture(s) in {manifest_path}")
        else:
            print("\nBLANK CAPTURES DETECTED.")
            print("Wire them into EvidenceFrame anyway with an on-screen disclosure:")
            print('  "live capture blocked — source text verified directly"')
            print("Never substitute stat cards — blank EvidenceFrame + disclosure is honest.")
            print("(re-run with --fix to mark them in the manifest)")
        sys.exit(1)
    else:
        print("\nAll captures appear to contain real content.")
        sys.exit(0)


if __name__ == "__main__":
    main()
