#!/usr/bin/env python3
"""
upload_all_28_shorts.py — upload every packaged Short (videos/*/shorts/*/) to YouTube as
private drafts in ONE run. Discovers clips from disk — nothing hardcoded, works from any
checkout. Optionally restrict to a subset and/or a specific channel.

Usage:
  python tools/upload_all_28_shorts.py
  python tools/upload_all_28_shorts.py --projects slug1,slug2
  python tools/upload_all_28_shorts.py --channel the-forgotten-fix
"""
import argparse
import json
import os
import subprocess
import sys
import time
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parent.parent
# when run under the repo's venv, sys.executable IS the venv python — never hardcode a path
python_exe = sys.executable if "venv" in sys.executable.lower() else str(ROOT / "venv" / "Scripts" / "python.exe")
yt_upload_py = str(ROOT / "tools" / "yt_upload.py")


def discover_plans() -> list[tuple[str, str, Path]]:
    """All packaged clips: (slug, clip_id, publish.json path) sorted by slug."""
    plans = []
    for pub in sorted((ROOT / "videos").glob("*/shorts/*/packaging/publish.json")):
        slug = pub.parents[3].name
        cid = pub.parents[1].name
        plans.append((slug, cid, pub))
    return plans


def main() -> int:
    ap = argparse.ArgumentParser(description="Upload all packaged Shorts as private drafts")
    ap.add_argument("--projects", default=None,
                    help="comma-separated slugs to upload (default: every videos/*/shorts/*)")
    ap.add_argument("--channel", default=None,
                    help="channel name passed to yt_upload.py (auth target; 'the-forgotten-fix' "
                         "was the original 28-clip run's channel)")
    args = ap.parse_args()

    plans = discover_plans()
    if args.projects:
        wanted = {s.strip() for s in args.projects.split(",") if s.strip()}
        plans = [p for p in plans if p[0] in wanted]

    if not plans:
        print("no packaged shorts found under videos/*/shorts/*/packaging/publish.json")
        return 1

    print("=" * 80)
    print(f"     UPLOADING {len(plans)} SHORTS AS PRIVATE DRAFTS"
          + (f"  -> channel {args.channel}" if args.channel else ""))
    print("=" * 80)

    results = []
    for i, (slug, cid, plan_abs) in enumerate(plans, 1):
        plan_rel = plan_abs.relative_to(ROOT).as_posix()
        with open(plan_abs, "r", encoding="utf-8") as f:
            pdata = json.load(f)
            title = pdata.get("title", "")

        print(f"\n[{i}/{len(plans)}] Uploading Short {cid} of {slug}: '{title}' ...")
        cmd = [python_exe, yt_upload_py, "upload", plan_rel, "--skip-deliverable-check"]
        if args.channel:
            cmd += ["--channel", args.channel]

        start_t = time.time()
        res = subprocess.run(cmd, capture_output=True, text=True, cwd=str(ROOT))
        elapsed = time.time() - start_t

        if res.returncode == 0:
            video_url = ""
            for line in res.stdout.splitlines():
                if "https://youtu.be/" in line or "https://www.youtube.com/watch" in line:
                    video_url = line.strip()
                    break
            print(f"  SUCCESS ({elapsed:.1f}s) -> {video_url or 'Uploaded as Private Draft'}")
            results.append({
                "slug": slug,
                "clip_id": cid,
                "title": title,
                "status": "SUCCESS",
                "url": video_url,
                "time_sec": round(elapsed, 1)
            })
        else:
            print(f"  FAILED ({elapsed:.1f}s)")
            print(f"     STDOUT: {res.stdout.strip()[-300:]}")
            print(f"     STDERR: {res.stderr.strip()[-300:]}")
            results.append({
                "slug": slug,
                "clip_id": cid,
                "title": title,
                "status": "FAILED",
                "error": res.stderr.strip() or res.stdout.strip()
            })

    summary_file = ROOT / "videos" / "shorts_upload_summary.json"
    summary_file.write_text(json.dumps(results, indent=2), encoding="utf-8")

    success_count = sum(1 for r in results if r.get("status") == "SUCCESS")
    print("\n" + "=" * 80)
    print(f"UPLOAD RUN COMPLETED: {success_count} / {len(plans)} UPLOADED AS PRIVATE DRAFTS")
    print(f"Summary saved to: {summary_file}")
    print("=" * 80)
    return 0


if __name__ == "__main__":
    sys.exit(main())