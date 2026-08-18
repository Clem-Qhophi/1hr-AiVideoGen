#!/usr/bin/env python3
"""
synth_foley.py — synthesize reusable KITCHEN/HOME foley with pure ffmpeg (no API, $0).

Why: the shared SFX library (media/library/sfx/) is UI/tech-flavored from ad/tech videos. A
home-hacks video is built on kitchen motion — pouring, simmering, scrubbing, foil scrunching —
and the ElevenLabs sound-generation API is a billing wall on this setup. These clips are
synthesized deterministically with ffmpeg lavfi generators (same seed -> same WAV), totally
license-clean (self-generated, nothing sampled), loudness-normalized to the library target
(~-20 LUFS / -1.5 dBFS ceiling) and registered in catalog.json so tools/mix_sfx.py uses them
like any other clip.

Usage:
  python tools/synth_foley.py              # generate all missing kitchen ids
  python tools/synth_foley.py --only id1,id2
  python tools/synth_foley.py --dry-run    # print plan, write nothing
"""
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SFX_DIR = os.path.join(ROOT, "media", "library", "sfx")
CLIPS_DIR = os.path.join(SFX_DIR, "clips")
CATALOG = os.path.join(SFX_DIR, "catalog.json")
TARGET_LUFS = -20.0
CEILING_DBF = -1.5
FPS = 44100

RECIPES = {
    "water-pour-soft": (1.8, ["water", "pour", "tap", "pot", "fill", "sink", "kitchen"],
        "anoisesrc=color=brown:seed=11:duration=1.8:amplitude=0.9,"
        "highpass=f=110,lowpass=f=2600,tremolo=f=11:d=0.35,"
        "afade=t=in:d=0.15,afade=t=out:d=0.4,volume=0.55[b];"
        "anoisesrc=color=white:seed=21:duration=1.8:amplitude=0.05,"
        "highpass=f=2800,afade=t=in:d=0.1,afade=t=out:d=0.3[d];"
        "[b][d]amix=inputs=2:normalize=0"),
    "water-simmer-bubbles": (1.8, ["water", "simmer", "boil", "bubbles", "pot", "stove"],
        "anoisesrc=color=brown:seed=12:duration=1.8:amplitude=0.7,"
        "lowpass=f=650,tremolo=f=26:d=0.55,afade=t=in:d=0.2,afade=t=out:d=0.4[b];"
        "anoisesrc=color=white:seed=22:duration=1.8:amplitude=0.09,"
        "highpass=f=1800,lowpass=f=8000,tremolo=f=9:d=0.6,"
        "afade=t=in:d=0.1,afade=t=out:d=0.3[d];"
        "[b][d]amix=inputs=2:normalize=0"),
    "salt-sprinkle": (1.1, ["salt", "sprinkle", "shake", "granules", "dust"],
        "anoisesrc=color=white:seed=13:duration=1.1:amplitude=0.5,"
        "bandpass=f=5200:w=3200,tremolo=f=62:d=0.55,afade=t=in:d=0.02,afade=t=out:d=0.2"),
    "scrub-brush": (1.4, ["scrub", "brush", "scour", "bristle", "clean"],
        "anoisesrc=color=brown:seed=14:duration=1.4:amplitude=0.85,"
        "highpass=f=400,lowpass=f=4200,tremolo=f=6:d=0.8,"
        "afade=t=in:d=0.12,afade=t=out:d=0.3,volume=0.8"),
    "aluminum-foil-scrunch": (0.9, ["foil", "aluminum", "scrunch", "crumple", "ball"],
        "anoisesrc=color=white:seed=15:duration=0.9:amplitude=0.4,"
        "highpass=f=2500,lowpass=f=16000,tremolo=f=33:d=0.7,afade=t=in:d=0.02,afade=t=out:d=0.25"),
    "pot-clang-soft": (0.9, ["pot", "stove", "place", "metal", "clang"],
        "aevalsrc=0.5*exp(-13*t)*(sin(2*PI*118*t)+0.55*sin(2*PI*298*t)"
        "+0.3*sin(2*PI*610*t)):d=0.9:s=44100,afade=t=out:d=0.45"),
    "steam-hiss-soft": (1.3, ["steam", "hiss", "hot", "pan", "rising"],
        "anoisesrc=color=white:seed=16:duration=1.3:amplitude=0.22,"
        "highpass=f=2800,lowpass=f=9500,tremolo=f=4:d=0.4,afade=t=in:d=0.35,afade=t=out:d=0.3"),
    "metal-scrape-clean": (1.0, ["scrape", "metal", "pan", "spatula", "loosen"],
        "aevalsrc=0.3*exp(-5.5*t)*sin(2*PI*t*(900-420*t)):d=1.0:s=44100,"
        "highpass=f=1400,afade=t=in:d=0.05,afade=t=out:d=0.35,volume=0.8"),
    "cupboard-close-soft": (0.6, ["cupboard", "cabinet", "wood", "close", "click"],
        "aevalsrc=0.6*exp(-35*t)*(sin(2*PI*390*t)+0.35*sin(2*PI*800*t)):d=0.6:s=44100,"
        "afade=t=out:d=0.2"),
    "soap-dispenser-thock": (0.5, ["soap", "dispenser", "pump", "foam", "thock"],
        "aevalsrc=0.6*exp(-48*t)*sin(2*PI*150*t):d=0.5:s=44100,afade=t=out:d=0.28,"
        "volume=1.2"),
}


def run(cmd, cwd=None):
    return subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8",
                          errors="replace", cwd=cwd)


def measure(path):
    r = run(["ffmpeg", "-hide_banner", "-i", path, "-af", "volumedetect", "-f", "null",
             os.devnull])
    blob = r.stdout or r.stderr
    m = re.search(r"max_volume:\s*(-?[\d.]+) dB", blob)
    peak = float(m.group(1)) if m else None
    r2 = run(["ffmpeg", "-hide_banner", "-i", path, "-af", "ebur128", "-f", "null",
              os.devnull])
    blob2 = r2.stdout or r2.stderr
    ms = re.findall(r"I:\s*(-?[\d.]+)\s*LUFS", blob2)
    lufs = float(ms[-1]) if ms else None
    return peak, lufs


def make_one(sid, dur, graph):
    wav = os.path.join(CLIPS_DIR, f"_{sid}.wav")
    mp3 = os.path.join(CLIPS_DIR, f"{sid}.mp3")
    # Pass the graph text directly as the lavfi -i value (no -filter_complex_script, no file).
    # The graph string is read as one argv element, so Windows path colons never enter it.
    r = run(["ffmpeg", "-y", "-v", "error", "-f", "lavfi", "-i", graph,
             "-ar", str(FPS), "-t", f"{dur}", wav])
    if r.returncode != 0:
        print("  ffmpeg:", r.stderr[-1500:])
        return None, (None, None)
    peak, lufs = measure(wav)
    if peak is None:
        print("  (no audio produced)")
        return None, (None, None)
    if lufs is None or lufs < -50:
        gain = CEILING_DBF + 0.5 - peak
    else:
        gain = TARGET_LUFS - lufs
        if peak + gain > CEILING_DBF:
            gain = CEILING_DBF - peak
    r = run(["ffmpeg", "-y", "-v", "error", "-i", wav,
             "-af", f"volume={gain:.3f}dB", "-c:a", "libmp3lame", "-q:a", "2", mp3])
    if r.returncode != 0:
        print("  encode:", r.stderr[-1000:])
    peak, lufs = measure(mp3)
    os.remove(wav)
    return dur, (peak, lufs)


def main():
    args = sys.argv[1:]
    only = None
    if "--only" in args:
        only = set(args[args.index("--only") + 1].split(","))
    dry = "--dry-run" in args

    catalog = json.load(open(CATALOG, encoding="utf-8"))
    catalog.setdefault("clips", [])
    by_id = {c["id"]: c for c in catalog["clips"]}
    os.makedirs(CLIPS_DIR, exist_ok=True)

    for sid, (dur, tags, graph) in RECIPES.items():
        if only and sid not in only:
            continue
        if sid in by_id and os.path.exists(os.path.join(CLIPS_DIR, f"{sid}.mp3")):
            print(f"  skip (exists): {sid}")
            continue
        print(f"-> {sid} ({dur}s)")
        if dry:
            continue
        actual_dur, (peak, lufs) = make_one(sid, dur, graph)
        if peak is None:
            continue
        by_id[sid] = {
            "id": sid, "file": f"clips/{sid}.mp3", "category": "foley", "tags": tags,
            "duration_s": actual_dur or dur,
            "peak_dbfs": round(peak, 1), "loudness_lufs": round(lufs, 1),
            "source": "ffmpeg:synth", "model": "deterministic lavfi",
            "license": "self-generated deterministic synthesis (no external material)",
            "prompt": graph, "used_in": [],
        }
        print(f"   peak={peak:.1f}dBFS  lufs={lufs:.1f}")

    exist = {c["id"] for c in catalog["clips"]}
    if not dry:
        added = [by_id[s] for s in RECIPES if s not in exist and s in by_id]
        if added:
            catalog["clips"] = catalog["clips"] + added
            with open(CATALOG, "w", encoding="utf-8") as f:
                json.dump(catalog, f, indent=2, ensure_ascii=False)
                f.write("\n")
    print(f"\ncatalog -> {os.path.relpath(CATALOG, ROOT)}  ({len(catalog['clips'])} clips)")


if __name__ == "__main__":
    main()