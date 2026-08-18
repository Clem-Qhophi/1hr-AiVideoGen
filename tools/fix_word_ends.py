#!/usr/bin/env python3
"""
fix_word_ends.py — repair quantized ASR word END times using the actual audio.

Why this exists: an ASR response can come back with word `start` times that are accurate and
word `end` times that are quantized junk. Seen on video-1: **84% of words had an end exactly
80 ms after their start**, implying a 4.4 words/sec speaking rate (impossible; normal is 2-3).

That breaks the cut pipeline in two directions, both silent:
  * every gap between a bogus end and the next real start looks like a PAUSE, so the cut engine
    "compresses dead air" that is actually the middle of a spoken word — it clips speech;
  * `analyze_cut` then reports dozens of phantom internal pauses and clipped-tail risks, burying
    the real ones.

The fix is to find each word's real release in the waveform: walk forward from the word's start
until the energy drops to the clip's noise floor, stopping at the next word's start. Words in
continuous speech end up abutting the next word (gap ~0), and only genuine silence stays a pause.

Usage:
  python tools/fix_word_ends.py videos/video-1                 # all clips, writes .bak first
  python tools/fix_word_ends.py videos/video-1 --clips 4166
  python tools/fix_word_ends.py videos/video-1 --dry-run       # report only, change nothing

Reads/writes <project>/work/transcripts/<id>.json (backup: <id>.json.bak).
Needs <project>/work/audio/<id>.wav (the 16 kHz mono extract /clean-cut step 1 makes).
"""
import argparse
import json
import os
import shutil
import sys
from pathlib import Path

ROOT = Path(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, str(ROOT / "tools"))

from cutlib import AudioProbe   # noqa: E402  (same RMS/noise-floor engine the cut planner uses)

STEP = 0.02          # s, resolution of the release search
MIN_DUR = 0.08       # s, never shorter than the ASR's own minimum
LOOKAHEAD = 0.80     # s, how far past the last word to search
QUIET_MARGIN = 6.0   # dB over the clip's noise floor that counts as "released"
HOLD = 2             # consecutive quiet steps required (one dip is not a word ending)
GUARD = 0.02         # s, never run into the next word's onset


def fix_clip(probe: AudioProbe, clip: str, words: list) -> tuple[int, float, float]:
    floor = probe.floor_db(clip)
    changed = 0
    before = after = 0.0
    for i, w in enumerate(words):
        s = w["start"] / 1000.0
        old_e = w["end"] / 1000.0
        limit = (words[i + 1]["start"] / 1000.0 - GUARD) if i + 1 < len(words) else s + LOOKAHEAD
        if limit <= s + MIN_DUR:
            continue                                   # next word is already on top of this one

        t, quiet, release = s + MIN_DUR, 0, None
        while t <= limit:
            if probe.rms_db(clip, t) <= floor + QUIET_MARGIN:
                quiet += 1
                if quiet >= HOLD:
                    release = t - (HOLD - 1) * STEP     # first quiet sample, not the last
                    break
            else:
                quiet = 0
            t += STEP
        # never went quiet -> the word runs straight into the next one
        new_e = min(limit, release if release is not None else limit)
        new_e = max(new_e, s + MIN_DUR)

        before += old_e - s
        after += new_e - s
        if abs(new_e - old_e) >= STEP:
            changed += 1
        w["end"] = int(round(new_e * 1000))
    return changed, before, after


def main():
    ap = argparse.ArgumentParser(description="repair quantized ASR word end times from the audio")
    ap.add_argument("project")
    ap.add_argument("--clips", default=None, help="comma list of clip ids (default: all)")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    project = Path(a.project if os.path.isabs(a.project) else os.path.abspath(a.project))
    tdir = project / "work" / "transcripts"
    if not tdir.is_dir():
        raise SystemExit(f"no transcripts dir: {tdir}")
    ids = ([c.strip() for c in a.clips.split(",")] if a.clips
           else sorted(p.stem for p in tdir.glob("*.json")))
    probe = AudioProbe(project)

    for clip in ids:
        p = tdir / f"{clip}.json"
        if not p.exists():
            print(f"{clip}: no transcript, skipped")
            continue
        data = json.loads(p.read_text(encoding="utf-8"))
        words = data.get("words") or []
        if not words:
            print(f"{clip}: no words, skipped")
            continue

        span = words[-1]["end"] / 1000.0 - words[0]["start"] / 1000.0
        changed, before, after = fix_clip(probe, clip, words)
        rate_before = len(words) / before if before else 0
        rate_after = len(words) / after if after else 0
        print(f"{clip}: {len(words)} words, {changed} ends corrected")
        print(f"   speech time {before:.1f}s -> {after:.1f}s   "
              f"(implied rate {rate_before:.2f} -> {rate_after:.2f} words/sec)")
        print(f"   silence in the {span:.1f}s span: "
              f"{span - before:.1f}s -> {span - after:.1f}s")

        if a.dry_run:
            print("   (dry run, nothing written)")
            continue
        bak = p.with_suffix(".json.bak")
        if not bak.exists():
            shutil.copy2(p, bak)
        p.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
        print(f"   written (backup: {bak.name})")


if __name__ == "__main__":
    main()
