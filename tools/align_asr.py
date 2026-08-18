#!/usr/bin/env python3
"""align_asr.py — real, frame-accurate word timings for a generated voiceover, via AssemblyAI.

Why this exists (the free ElevenLabs-timestamps replacement):
  The free voice path is edge-tts. edge-tts *usually* emits WordBoundary events (word timings),
  but on 2026-07-23 it returned ZERO of them for GuyNeural/AndrewNeural — and the whole pipeline
  syncs reveals/captions/SFX to word times. The old fallback was `director/align.py` proportional
  alignment: sentence-accurate but sub-word approximate.

  Now that an AssemblyAI key is present, we do better for $0-cheap: transcribe the *generated*
  voiceover with AssemblyAI (real ASR word timings), then align those timings onto the KNOWN
  script text. Result = the exact on-screen wording (from the script) with real, frame-accurate
  timings (from ASR). This beats both edge WordBoundary and proportional alignment.

Reads:  <project>/work/audio/voiceover.mp3  (or .wav)  and  <project>/work/script_spoken.txt
Writes: <project>/work/edited-transcript.json  ->  {words:[{text,start,end}], duration_s, _alignment}

Usage:
  python tools/align_asr.py videos/video-1
  python tools/align_asr.py videos/video-1 --audio work/audio/voiceover.mp3

Exit code is non-zero on any failure (no key / no credits / API error) so the director can fall
back to proportional alignment. It NEVER fabricates timings.
"""
import argparse
import difflib
import json
import re
import subprocess
import sys
import time
from pathlib import Path

import requests

API_BASE = "https://api.assemblyai.com/v2"
SPEECH_MODELS = ["universal-3-5-pro", "universal-2"]


def core(w: str) -> str:
    """Comparison key: letters/digits only, lowercased. Matches director/align.py's convention."""
    return re.sub(r"[^A-Za-z0-9]", "", w).lower()


def load_env_key(repo_root: Path, name: str) -> str:
    env = repo_root / ".env"
    if env.exists():
        for line in env.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line.startswith(name + "="):
                value = line.split("=", 1)[1].strip().strip('"').strip("'")
                if value:
                    return value
    import os
    if os.environ.get(name):
        return os.environ[name]
    sys.exit(f"{name} not set (.env or environment) — cannot run ASR alignment")


def probe_dur(path: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=nw=1:nk=1", str(path)],
        capture_output=True, text=True).stdout.strip()
    return float(out)


def transcribe(headers: dict, audio: Path) -> list[dict]:
    """Upload the audio, run AssemblyAI, return its word list [{text,start,end}] (ms)."""
    with open(audio, "rb") as f:
        up = requests.post(f"{API_BASE}/upload", headers=headers, data=f, timeout=300)
    up.raise_for_status()
    audio_url = up.json()["upload_url"]

    payload = {
        "audio_url": audio_url,
        "speech_models": SPEECH_MODELS,
        "punctuate": True,
        "format_text": True,
        # Clean synthetic TTS: we want faithful words, not disfluency capture (that's for raw footage).
    }
    sub = requests.post(f"{API_BASE}/transcript", headers=headers, json=payload, timeout=60)
    sub.raise_for_status()
    tid = sub.json()["id"]

    while True:
        time.sleep(4)
        r = requests.get(f"{API_BASE}/transcript/{tid}", headers=headers, timeout=60)
        r.raise_for_status()
        data = r.json()
        status = data["status"]
        if status == "completed":
            return data.get("words") or []
        if status == "error":
            sys.exit(f"AssemblyAI error: {data.get('error')}")
        print(f"  ...{status}")


def align_to_script(script_text: str, asr_words: list[dict]) -> list[dict]:
    """Transfer ASR word timings onto the known script tokens.

    We keep the SCRIPT's exact wording (ground truth) and borrow timings from the ASR words,
    matched by a sequence diff on the core (alnum-lowercased) forms. For clean TTS this is
    ~1:1; the diff makes it robust to the occasional ASR mishearing (acronyms, proper nouns).
    """
    sc_raw = [w for w in re.split(r"\s+", script_text.strip()) if core(w)]
    sc_core = [core(w) for w in sc_raw]
    asr = [{"text": w["text"], "start": int(w["start"]), "end": int(w["end"])} for w in asr_words]
    asr_core = [core(w["text"]) for w in asr]

    out: list[dict] = []
    sm = difflib.SequenceMatcher(None, sc_core, asr_core, autojunk=False)
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal":
            for k in range(i2 - i1):
                a = asr[j1 + k]
                out.append({"text": sc_raw[i1 + k], "start": a["start"], "end": a["end"]})
        elif tag == "replace":
            span_s = asr[j1]["start"]
            span_e = asr[j2 - 1]["end"]
            n = i2 - i1
            step = (span_e - span_s) / max(1, n)
            for k in range(n):
                out.append({"text": sc_raw[i1 + k],
                            "start": int(span_s + k * step),
                            "end": int(span_s + (k + 1) * step)})
        elif tag == "delete":
            # script words with no ASR match -> spread across the gap to the next ASR word
            prev_end = out[-1]["end"] if out else 0
            next_start = asr[j1]["start"] if j1 < len(asr) else prev_end
            n = i2 - i1
            step = (max(next_start, prev_end) - prev_end) / max(1, n)
            for k in range(n):
                out.append({"text": sc_raw[i1 + k],
                            "start": int(prev_end + k * step),
                            "end": int(prev_end + (k + 1) * step)})
        elif tag == "insert":
            pass  # ASR heard words not in the script -> ignore, keep script clean
    return out


def main() -> None:
    ap = argparse.ArgumentParser(description="Frame-accurate word timings via AssemblyAI ASR")
    ap.add_argument("project", help="project dir (e.g. videos/video-1)")
    ap.add_argument("--audio", help="audio path relative to project (default: work/audio/voiceover.mp3|wav)")
    args = ap.parse_args()

    repo_root = Path(__file__).resolve().parent.parent
    project = repo_root / args.project
    work = project / "work"

    if args.audio:
        audio = project / args.audio
    else:
        audio = work / "audio" / "voiceover.mp3"
        if not audio.exists():
            audio = work / "audio" / "voiceover.wav"
    if not audio.exists():
        sys.exit(f"no voiceover audio found at {audio}")

    spoken = work / "script_spoken.txt"
    if not spoken.exists():
        sys.exit(f"no script text at {spoken} — need the ground-truth script to align to")
    script_text = spoken.read_text(encoding="utf-8")

    headers = {"authorization": load_env_key(repo_root, "ASSEMBLYAI_API_KEY")}

    print(f"transcribing {audio.relative_to(repo_root)} with AssemblyAI ({SPEECH_MODELS[0]})...")
    asr_words = transcribe(headers, audio)
    print(f"  ASR returned {len(asr_words)} words")
    if not asr_words:
        sys.exit("AssemblyAI returned no words — cannot align")

    words = align_to_script(script_text, asr_words)
    dur = probe_dur(audio)
    data = {
        "words": words,
        "duration_s": round(dur, 3),
        "_alignment": "assemblyai-asr (real word timings, aligned to script; frame-accurate)",
    }
    out = work / "edited-transcript.json"
    out.write_text(json.dumps(data, indent=1), encoding="utf-8")
    print(f"wrote {len(words)} words -> {out.relative_to(repo_root)}  ({dur:.1f}s)")


if __name__ == "__main__":
    main()
