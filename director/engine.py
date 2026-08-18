"""
director.engine — the deterministic stage runner (streaming).

Single source of truth for the commands each deterministic stage runs (voiceover, word_timing, master,
bake). Runs them via Popen and emits each output line through an `emit(event)` callback, so both the CLI
and the web UI's SSE stream get live progress instead of a blocking wait. Agent (creative) stages are
driven by director.agent; this module is only the tool-wrapping deterministic half.
"""
from __future__ import annotations
import os
import sys
import json
import subprocess

from . import providers as P
from .align import align_proportional
from .job import _timing_ok

ROOT = P.ROOT


# ---- per-stage command builders (the single source of truth) ---------------

def _persona_voice(slug: str) -> dict:
    """Read the channel persona (channel-persona.<niche>.json) for this job's niche. The persona
    is the channel's remembered identity (voice, delivery speed) — the pipeline must READ it,
    not just document it. Returns {} when unresolvable (callers fall back to defaults)."""
    try:
        spec = json.load(open(os.path.join(ROOT, "videos", slug, "work", "spec.json"), encoding="utf-8"))
        niche = spec.get("niche")
        if niche:
            pf = os.path.join(ROOT, f"channel-persona.{niche}.json")
            if os.path.exists(pf):
                return json.load(open(pf, encoding="utf-8"))
    except Exception:
        pass
    return {}


def _cmd_voiceover(slug: str):
    h = P.pick("voiceover")
    proj = os.path.join("videos", slug)
    spoken = os.path.join(proj, "work", "script_spoken.txt")
    if h.impl == "elevenlabs":
        cmd = [sys.executable, "tools/tts.py", proj, "--text-file", spoken, "--voice",
               "onwK4e9ZLuTAKqWW03F9", "--speed", "1.15", "--stability", "0.4", "--style", "0.3"]
        return cmd, 0.6, "ElevenLabs (pro)"
    persona = _persona_voice(slug)
    voice = str(persona.get("voice_id") or "")
    if not voice or " " in voice:  # unset, or "TBD - validate ..." placeholders
        voice = "en-US-AndrewNeural"
    speed = float(persona.get("tts_speed", 1.0))
    cmd = [sys.executable, "tools/tts_edge.py", proj, "--text-file", spoken,
           "--voice", voice, "--speed", str(speed)]
    if persona.get("tts_pitch_hz"):
        cmd += ["--pitch-hz", str(persona["tts_pitch_hz"])]
    if persona.get("tts_volume_pct"):
        cmd += ["--volume", str(persona["tts_volume_pct"])]
    note = (f"edge-tts (free; persona {voice} @{speed}x)" if persona else
            f"edge-tts (free; NO persona found — default {voice} @1.0x)")
    return cmd, 0.0, note


def _cmd_master(slug: str):
    return [sys.executable, "tools/make_master.py", os.path.join("videos", slug), "--bg", "dark"], 0.0, "make_master"


def _cmd_bake(slug: str):
    return [sys.executable, "tools/bake.py", os.path.join("videos", slug, "work", "timeline.json")], 0.0, "bake"


def _asr_cost(project_dir: str) -> float:
    """Nominal AssemblyAI cost for the VO just transcribed (~$0.01/min, per providers.py note)."""
    try:
        d = json.load(open(os.path.join(project_dir, "work", "edited-transcript.json"), encoding="utf-8"))
        return round(d.get("duration_s", 0) / 60.0 * 0.01, 4)
    except Exception:
        return 0.0


def popen_stream(cmd, emit) -> int:
    """Run a subprocess, emitting each stdout/stderr line as {type:'log', line:...}. Returns the code."""
    rel = " ".join(os.path.relpath(c, ROOT) if os.path.isabs(c) else c for c in cmd)
    emit({"type": "log", "line": "$ " + rel})
    proc = subprocess.Popen(cmd, cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                            text=True, bufsize=1)
    for line in proc.stdout:
        line = line.rstrip()
        if line:
            emit({"type": "log", "line": line})
    proc.wait()
    return proc.returncode


def run_deterministic(job, stage: str, emit) -> tuple[bool, float, str]:
    """Run one deterministic stage, streaming progress via emit. Returns (ok, cost_usd, provider_note)."""
    slug = job.slug
    if stage == "voiceover":
        cmd, cost, note = _cmd_voiceover(slug)
        return popen_stream(cmd, emit) == 0, cost, note
    if stage == "word_timing":
        if _timing_ok(job.project_dir):
            emit({"type": "log", "line": "word times already present (TTS WordBoundary / pro) — keeping them"})
            return True, 0.0, "kept"
        # No usable timings yet (e.g. edge-tts emitted no WordBoundary events, as on 2026-07-23).
        # Best FREE-tier option: real ASR timings from AssemblyAI, aligned onto the known script.
        # Strictly better than proportional; falls through to it if the key/credits are unavailable.
        h = P.pick("word_timing")
        if h.impl == "assemblyai" and h.available:
            emit({"type": "log", "line": "no word timings yet — transcribing VO with AssemblyAI for real timings…"})
            try:
                code = popen_stream(
                    [sys.executable, "tools/align_asr.py", os.path.join("videos", slug)], emit)
                if code == 0 and _timing_ok(job.project_dir):
                    return True, _asr_cost(job.project_dir), "assemblyai-asr"
                emit({"type": "log", "line": "AssemblyAI alignment produced no timings — falling back to proportional"})
            except Exception as e:  # noqa: BLE001
                emit({"type": "log", "line": f"AssemblyAI alignment failed ({e}) — falling back to proportional"})
        emit({"type": "log", "line": "aligning words (proportional free fallback)…"})
        try:
            n = align_proportional(job.project_dir)
            emit({"type": "log", "line": f"aligned {n} words (sentence-accurate, approximate)"})
            return True, 0.0, "proportional"
        except Exception as e:  # noqa: BLE001
            emit({"type": "log", "line": f"align failed: {e}"})
            return False, 0.0, "proportional"
    if stage == "master":
        cmd, cost, note = _cmd_master(slug)
        return popen_stream(cmd, emit) == 0, cost, note
    if stage == "bake":
        cmd, cost, note = _cmd_bake(slug)
        ok = popen_stream(cmd, emit) == 0
        if ok:
            # Non-fatal: validate the rendered duration against the plan target (roadmap §4).
            popen_stream([sys.executable, "tools/check_duration.py", os.path.join("videos", slug)], emit)
        return ok, cost, note
    if stage in ("intake", "upload"):
        emit({"type": "log", "line": f"{stage}: nothing to run"})
        return True, 0.0, ""
    emit({"type": "log", "line": f"no deterministic runner for '{stage}'"})
    return False, 0.0, "unknown"
