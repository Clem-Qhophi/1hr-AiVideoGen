#!/usr/bin/env python3
"""check_duration.py — validate a rendered video's duration against the plan's target.

Length is a first-class parameter (docs/VIDEO-OS-ROADMAP.md §4: "Validate the rendered duration back
against target"). This probes the baked preview and compares it to `target_s` from work/plan.json,
warning when it drifts past ±10% (a 5-min target that renders 3:40 means the script/pacing missed).

Usage:
  python tools/check_duration.py videos/<slug>              # read plan.json (target_s + preview)
  python tools/check_duration.py --video path.mp4 --target 200
  python tools/check_duration.py videos/<slug> --strict     # exit 1 on WARN (for CI/gates)

Exit code: 0 on PASS (or non-strict WARN), 1 on WARN with --strict, 2 on error.
"""
import argparse
import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOLERANCE = 0.10  # ±10%


def probe_dur(path: str) -> float:
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=nw=1:nk=1", path],
        capture_output=True, text=True)
    out = r.stdout.strip()
    if not out:
        sys.exit(f"[2] ffprobe could not read duration of {path}\n{r.stderr.strip()}")
    return float(out)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("project", nargs="?", help="videos/<slug> (reads work/plan.json)")
    ap.add_argument("--video", help="explicit video path (overrides plan preview)")
    ap.add_argument("--target", type=float, help="target seconds (overrides plan target_s)")
    ap.add_argument("--strict", action="store_true", help="exit 1 on WARN")
    args = ap.parse_args()

    target = args.target
    video = args.video
    if args.project:
        plan_path = os.path.join(ROOT, args.project, "work", "plan.json")
        if os.path.exists(plan_path):
            plan = json.load(open(plan_path, encoding="utf-8"))
            if target is None:
                target = plan.get("target_s")
            if video is None:
                video = plan.get("preview")
    if video and not os.path.isabs(video):
        video = os.path.join(ROOT, video)

    if not video or not os.path.exists(video):
        sys.exit(f"[2] no video to check (looked for {video}) — pass --video or ensure the preview exists")
    if target is None:
        # no target set: just report the duration, don't judge
        print(f"duration: {probe_dur(video):.1f}s  (no target_s in plan — nothing to validate against)")
        return

    actual = probe_dur(video)
    lo, hi = target * (1 - TOLERANCE), target * (1 + TOLERANCE)
    delta = actual - target
    pct = (delta / target * 100) if target else 0
    ok = lo <= actual <= hi
    tag = "PASS" if ok else "WARN"
    print(f"[{tag}] target {target:.0f}s  |  actual {actual:.1f}s  |  {delta:+.1f}s ({pct:+.0f}%)  "
          f"|  tolerance +/-{int(TOLERANCE*100)}% [{lo:.0f}-{hi:.0f}s]")
    if not ok:
        hint = "too long — tighten the script/pacing" if delta > 0 else "too short — script under target; add a beat or expand"
        print(f"       {hint}")
        if args.strict:
            sys.exit(1)


if __name__ == "__main__":
    main()
