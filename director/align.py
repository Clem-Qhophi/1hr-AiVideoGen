"""
director.align — free word-timing fallback.

When no ASR is available (AssemblyAI key empty) and edge-tts returns no WordBoundary events (as on
2026-07-23), derive word timings deterministically from the exact script text vs. the probed audio
duration: weight each word by character length, add a pause bonus after sentence/clause punctuation,
and distribute across the audio. Sentence-level accurate, sub-word approximate. Regenerate with a
pro provider (ElevenLabs timestamps / AssemblyAI) for frame-perfect sync.
"""
from __future__ import annotations
import os
import re
import json
import subprocess


def _probe_dur(path: str) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=nw=1:nk=1", path],
        capture_output=True, text=True).stdout.strip()
    return float(out)


def align_proportional(project_dir: str) -> int:
    """Write work/edited-transcript.json from work/script_spoken.txt + work/audio/voiceover.mp3.
    Returns the word count."""
    audio = os.path.join(project_dir, "work", "audio", "voiceover.mp3")
    spoken = os.path.join(project_dir, "work", "script_spoken.txt")
    out = os.path.join(project_dir, "work", "edited-transcript.json")

    dur = _probe_dur(audio)
    text = open(spoken, encoding="utf-8").read()
    raw = [w for w in re.split(r"\s+", text.strip()) if w]

    def core(w):
        return re.sub(r"[^A-Za-z0-9]", "", w)

    weights = []
    for w in raw:
        ww = max(1, len(core(w)))
        if re.search(r"[.!?]$", w):
            ww += 4          # sentence-final pause
        elif re.search(r"[,;:]$", w):
            ww += 1.5        # clause pause
        weights.append(ww)

    total = sum(weights)
    spm = (dur * 1000.0) / total     # ms per weight unit
    words, t = [], 0.0
    for w, ww in zip(raw, weights):
        start, end = t, t + ww * spm
        words.append({"text": core(w) or w, "start": int(start), "end": int(end)})
        t = end

    data = {
        "words": words,
        "duration_s": round(dur, 3),
        "_alignment": "proportional (free fallback; sentence-accurate, sub-word approximate)",
    }
    json.dump(data, open(out, "w", encoding="utf-8"), indent=1)
    return len(words)
