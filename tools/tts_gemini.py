#!/usr/bin/env python3
"""
tts_gemini.py — Gemini TTS voiceover + word-level timestamps.

A free/low-cost drop-in for tts.py: synthesizes the narration with Google's
Gemini TTS (a natural neural voice, via GEMINI_API_KEY) and derives the
word-timing spine one of two ways:
  --align assemblyai  (default) real forced alignment via AssemblyAI (needs ASSEMBLYAI_API_KEY)
  --align heuristic             estimate word times from the script text + audio duration
                                (no key, no install; approximate but good for section beats)
  --align none                  audio only, no transcript

The narration is synthesized in small per-section CHUNKS (Gemini's free tier
stalls on one long request but is fast on short ones), then the 24kHz PCM is
spliced losslessly. Writes the SAME outputs as tts.py, so make_master.py and
/make-tsx work unchanged.

Usage:
  python tools/tts_gemini.py videos/video-1 --text-file <file> --voice Charon --align heuristic
  python tools/tts_gemini.py --list-voices

Outputs:
  <project>/work/audio/voiceover.mp3       the generated voiceover
  <project>/work/edited-transcript.json    {words:[{text,start,end}], duration_s} in ms

Needs GEMINI_API_KEY (+ ASSEMBLYAI_API_KEY only for --align assemblyai) in .env,
and ffmpeg/ffprobe on PATH.
"""
import argparse
import json
import os
import re
import subprocess
import sys
import time
import wave
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent.parent
AAI_BASE = "https://api.assemblyai.com/v2"
DEFAULT_MODEL = "gemini-2.5-flash-preview-tts"
DEFAULT_VOICE = "Charon"
PCM_RATE = 24000  # Gemini TTS emits 24kHz, 16-bit, mono PCM
CHUNK_CHARS = 260  # keep each request small so the free tier responds fast

VOICE_RECOMMENDATIONS = {
    "authoritative": "Charon", "calm-explainer": "Kore",
    "sarcastic-review": "Puck", "breaking-news": "Fenrir",
}
PREBUILT_VOICES = ("Zephyr Puck Charon Kore Fenrir Leda Orus Aoede Callirrhoe Autonoe "
                   "Enceladus Iapetus Umbriel Algieba Despina Erinome Algenib Rasalgethi "
                   "Laomedeia Achernar Alnilam Schedar Gacrux Pulcherrima Achird "
                   "Zubenelgenubi Vindemiatrix Sadachbia Sadaltager Sulafat").split()


def load_env():
    env = {}
    p = ROOT / ".env"
    if p.exists():
        for line in p.read_text(encoding="utf-8-sig").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip().strip('"').strip("'")
    return {**env, **os.environ}


def make_chunks(raw_text, max_chars=CHUNK_CHARS):
    """Split narration into small chunks: by blank-line paragraphs, then by
    sentence if a paragraph is still too long."""
    chunks = []
    for para in re.split(r"\n\s*\n", raw_text):
        para = re.sub(r"\s+", " ", para).strip()
        if not para:
            continue
        if len(para) <= max_chars:
            chunks.append(para)
            continue
        cur = ""
        for sent in re.split(r"(?<=[.!?])\s+", para):
            if len(cur) + len(sent) + 1 <= max_chars:
                cur = (cur + " " + sent).strip()
            else:
                if cur:
                    chunks.append(cur)
                cur = sent
        if cur:
            chunks.append(cur)
    return chunks


def make_client(api_key):
    from google import genai
    from google.genai import types
    return genai.Client(api_key=api_key, http_options=types.HttpOptions(timeout=90000))


def tts_chunk(client, text, voice, model, retries=2):
    """Synthesize one chunk. Returns (pcm_bytes, sample_rate). Fails loudly after retries."""
    from google.genai import types
    for attempt in range(retries + 1):
        try:
            resp = client.models.generate_content(
                model=model, contents=text,
                config=types.GenerateContentConfig(
                    response_modalities=["AUDIO"],
                    speech_config=types.SpeechConfig(
                        voice_config=types.VoiceConfig(
                            prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name=voice))),
                ),
            )
            for cand in (resp.candidates or []):
                for part in ((cand.content.parts if cand.content else None) or []):
                    inline = getattr(part, "inline_data", None)
                    if inline and inline.data:
                        rate = PCM_RATE
                        m = re.search(r"rate=(\d+)", getattr(inline, "mime_type", "") or "")
                        if m:
                            rate = int(m.group(1))
                        return inline.data, rate
            raise RuntimeError("no audio part in response")
        except Exception as e:
            if attempt < retries:
                print(f"  chunk retry {attempt + 1}/{retries} ({type(e).__name__}) ...", flush=True)
                time.sleep(5)
                continue
            sys.exit(f"Gemini API error: {type(e).__name__}: {e}")


def write_wav(pcm, path, rate):
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(rate)
        w.writeframes(pcm)


def run(cmd):
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)


def probe_dur(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                        "-of", "default=nw=1:nk=1", str(path)],
                       stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    return float(r.stdout.strip())


def aai_transcribe(key, wav_path):
    h = {"authorization": key}
    with open(wav_path, "rb") as f:
        up = requests.post(f"{AAI_BASE}/upload", headers=h, data=f, timeout=300)
    up.raise_for_status()
    sub = requests.post(f"{AAI_BASE}/transcript", headers=h,
                        json={"audio_url": up.json()["upload_url"], "punctuate": True, "format_text": True},
                        timeout=60)
    sub.raise_for_status()
    tid = sub.json()["id"]
    while True:
        time.sleep(3)
        r = requests.get(f"{AAI_BASE}/transcript/{tid}", headers=h, timeout=60)
        r.raise_for_status()
        data = r.json()
        if data["status"] == "completed":
            return [{"text": w["text"], "start": int(w["start"]), "end": int(w["end"])}
                    for w in (data.get("words") or [])]
        if data["status"] == "error":
            sys.exit(f"AssemblyAI error: {data.get('error')}")


def heuristic_words(text, duration_s):
    """Estimate word timings from text + total duration. Monotonic; spans [0, duration]."""
    tokens = text.split()
    if not tokens:
        return []
    dur_ms = int(duration_s * 1000)

    def speak_len(w):
        return max(1, sum(c.isalnum() for c in w))

    def pause_after(w):
        if w.endswith((".", "!", "?", ":")):
            return 300
        if w.endswith((",", ";")):
            return 120
        return 45

    weights = [speak_len(w) for w in tokens]
    pauses = [pause_after(w) for w in tokens]
    total_pause = sum(pauses)
    if total_pause > dur_ms * 0.4 and total_pause > 0:
        scale = (dur_ms * 0.4) / total_pause
        pauses = [int(p * scale) for p in pauses]
        total_pause = sum(pauses)
    speech_ms = max(1, dur_ms - total_pause)
    per_unit = speech_ms / max(1, sum(weights))
    words, t = [], 0.0
    for w, wt, pa in zip(tokens, weights, pauses):
        start = int(t)
        end = int(t + wt * per_unit)
        words.append({"text": w, "start": start, "end": min(end, dur_ms)})
        t = end + pa
    words[-1]["end"] = dur_ms
    return words


def main():
    ap = argparse.ArgumentParser(description="Gemini TTS + word-level timestamps")
    ap.add_argument("project", nargs="?")
    ap.add_argument("--text")
    ap.add_argument("--text-file")
    ap.add_argument("--voice", default=DEFAULT_VOICE)
    ap.add_argument("--model", default=DEFAULT_MODEL)
    ap.add_argument("--speed", type=float, default=1.0)
    ap.add_argument("--align", choices=["assemblyai", "heuristic", "none"], default="assemblyai")
    ap.add_argument("--list-voices", action="store_true")
    args = ap.parse_args()

    if args.list_voices:
        print("Gemini prebuilt voices:\n  " + " ".join(PREBUILT_VOICES))
        for mode, v in VOICE_RECOMMENDATIONS.items():
            print(f"  {mode:<16} {v}")
        return

    if not args.project:
        sys.exit("usage: tts_gemini.py <project> --text-file path [--voice Charon] [--align heuristic]")

    if args.text_file:
        raw = Path(args.text_file).read_text(encoding="utf-8")
    elif args.text:
        raw = args.text
    else:
        sys.exit("provide --text or --text-file")
    full_text = re.sub(r"\s+", " ", raw).strip()
    if not full_text:
        sys.exit("empty text — nothing to synthesize")

    env = load_env()
    gkey = env.get("GEMINI_API_KEY", "").strip()
    akey = env.get("ASSEMBLYAI_API_KEY", "").strip()
    if not gkey:
        sys.exit("GEMINI_API_KEY not found in .env")
    if args.align == "assemblyai" and not akey:
        sys.exit("ASSEMBLYAI_API_KEY not in .env — use --align heuristic for a no-key estimate")

    project = ROOT / args.project
    audio_dir = project / "work" / "audio"
    audio_dir.mkdir(parents=True, exist_ok=True)
    work_dir = project / "work"
    work_dir.mkdir(parents=True, exist_ok=True)

    chunks = make_chunks(raw)
    print(f"Gemini TTS: model={args.model} voice={args.voice}  {len(full_text)} chars -> {len(chunks)} chunk(s)", flush=True)

    client = make_client(gkey)
    pcm_all = bytearray()
    rate = PCM_RATE
    for i, ch in enumerate(chunks):
        t0 = time.time()
        pcm, rate = tts_chunk(client, ch, args.voice, args.model)
        pcm_all += pcm
        print(f"  chunk {i + 1}/{len(chunks)}: {len(ch)} chars -> {len(pcm) / 1e6:.1f} MB  ({time.time() - t0:.1f}s)", flush=True)
        if i + 1 < len(chunks):
            time.sleep(1.5)  # be gentle on the free-tier rate limit

    raw_wav = audio_dir / "_voice_raw.wav"
    write_wav(bytes(pcm_all), raw_wav, rate)
    print(f"audio: {len(pcm_all) / 1e6:.1f} MB PCM @ {rate}Hz, {probe_dur(raw_wav):.1f}s", flush=True)

    if abs(args.speed - 1.0) > 1e-3:
        final_wav = audio_dir / "_voice_final.wav"
        run(["ffmpeg", "-y", "-i", str(raw_wav), "-af", f"atempo={args.speed}",
             "-ar", str(rate), "-ac", "1", str(final_wav)])
    else:
        final_wav = raw_wav

    out_mp3 = audio_dir / "voiceover.mp3"
    run(["ffmpeg", "-y", "-i", str(final_wav), "-c:a", "libmp3lame", "-b:a", "192k", str(out_mp3)])
    total_dur = probe_dur(out_mp3)
    print(f"voiceover: {total_dur:.1f}s -> {out_mp3.relative_to(ROOT)}", flush=True)

    if args.align == "assemblyai":
        print("aligning words via AssemblyAI ...", flush=True)
        words = aai_transcribe(akey, final_wav)
    elif args.align == "heuristic":
        print("estimating word times (heuristic; approximate) ...", flush=True)
        words = heuristic_words(full_text, total_dur)
    else:
        words = []

    (work_dir / "edited-transcript.json").write_text(
        json.dumps({"words": words, "duration_s": round(total_dur, 3)}, indent=1), encoding="utf-8")
    print(f"transcript: {len(words)} words -> {(work_dir / 'edited-transcript.json').relative_to(ROOT)}", flush=True)

    for p in (raw_wav, audio_dir / "_voice_final.wav"):
        try:
            if p.exists():
                p.unlink()
        except OSError:
            pass

    if words:
        print(f"  first words: {' '.join(w['text'] for w in words[:8])} ...", flush=True)


if __name__ == "__main__":
    main()
