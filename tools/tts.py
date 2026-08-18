#!/usr/bin/env python3
"""
tts.py — ElevenLabs text-to-speech with word-level timestamps.

Generates a voiceover MP3 + edited-transcript.json (the word-timing spine
that /make-tsx reads to sync visuals to speech). Replaces the AssemblyAI
transcription step for prompt-to-video (no raw footage to transcribe).

Usage:
  python tools/tts.py videos/video-1 --text "Hello world..."  --voice <voice_id>
  python tools/tts.py videos/video-1 --text-file videos/video-1/work/script.md --voice <voice_id>
  python tools/tts.py videos/video-1 --text-file ... --voice ... --model eleven_v3
  python tools/tts.py --list-voices

Needs ELEVENLABS_API_KEY in .env. Uses the /with-timestamps endpoint for
character-level alignment, aggregated to word-level (ms) to match the
edited-transcript.json format the rest of the pipeline expects.

Outputs:
  <project>/work/audio/voiceover.mp3          the generated voiceover
  <project>/work/edited-transcript.json       {words:[{text,start,end}]} in ms
"""
import argparse
import base64
import json
import os
import re
import subprocess
import sys
import time
from pathlib import Path

import requests

API_BASE = "https://api.elevenlabs.io/v1"
DEFAULT_MODEL = "eleven_multilingual_v2"
DEFAULT_VOICE = "21m00Tcm4TlvDq8ikWAM"  # Rachel — clear, neutral, good for tutorials
MAX_CHARS = 4500  # ElevenLabs limit is ~5000; stay safely under


def load_key(repo_root: Path) -> str:
    env = repo_root / ".env"
    if env.exists():
        for line in env.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line.startswith("ELEVENLABS_API_KEY="):
                val = line.split("=", 1)[1].strip().strip('"').strip("'")
                if val:
                    return val
    sys.exit("ELEVENLABS_API_KEY not found in .env — add it to use TTS")


def list_voices(key: str) -> None:
    r = requests.get(f"{API_BASE}/voices", headers={"xi-api-key": key}, timeout=30)
    r.raise_for_status()
    voices = r.json().get("voices", [])
    print(f"{'Voice ID':<40} {'Name':<25} {'Category':<15} {'Labels'}")
    print("-" * 100)
    for v in voices:
        vid = v.get("voice_id", "")
        name = v.get("name", "")
        cat = v.get("category", "")
        labels = v.get("labels", {})
        label_str = ", ".join(f"{k}: {v2}" for k, v2 in labels.items()) if labels else ""
        print(f"{vid:<40} {name:<25} {cat:<15} {label_str}")


def chunk_text(text: str, max_chars: int = MAX_CHARS) -> list[str]:
    """Split text into chunks at sentence boundaries, staying under max_chars."""
    text = text.strip()
    if len(text) <= max_chars:
        return [text]
    # Split into sentences on . ! ? followed by whitespace
    sentences = re.split(r'(?<=[.!?])\s+', text)
    chunks = []
    current = ""
    for sent in sentences:
        if len(current) + len(sent) + 1 <= max_chars:
            current = (current + " " + sent).strip() if current else sent
        else:
            if current:
                chunks.append(current)
            # If a single sentence is too long, hard-split on commas
            if len(sent) > max_chars:
                parts = re.split(r'(?<=,)\s+', sent)
                for part in parts:
                    if len(current) + len(part) + 1 <= max_chars:
                        current = (current + " " + part).strip() if current else part
                    else:
                        if current:
                            chunks.append(current)
                        # last resort: hard split by char count
                        for i in range(0, len(part), max_chars):
                            chunks.append(part[i:i + max_chars])
                        current = ""
            else:
                current = sent
    if current:
        chunks.append(current)
    return chunks


def synthesize_chunk(key: str, voice_id: str, text: str, model_id: str,
                     stability: float, similarity: float, style: float) -> dict:
    """Call the /with-timestamps endpoint for one chunk. Returns {audio_b64, alignment}."""
    url = f"{API_BASE}/text-to-speech/{voice_id}/with-timestamps"
    payload = {
        "text": text,
        "model_id": model_id,
        "voice_settings": {
            "stability": stability,
            "similarity_boost": similarity,
            "style": style,
            "use_speaker_boost": True,
        },
    }
    for attempt in range(6):
        try:
            r = requests.post(url, headers={"xi-api-key": key, "Content-Type": "application/json"},
                              json=payload, timeout=180)
            if r.status_code == 200:
                return r.json()
            if r.status_code == 401:
                detail = r.text[:300]
                if "quota_exceeded" in detail:
                    sys.exit(f"TTS failed: ElevenLabs quota exceeded. Check your account credits.\n  {detail}")
                sys.exit(f"TTS failed: Invalid API key (401). Check your ElevenLabs key.\n  {detail}")
            if r.status_code == 429:
                wait = 2 ** attempt * 5
                print(f"  rate limited, waiting {wait}s ...")
                time.sleep(wait)
                continue
            # Try fallback: basic endpoint (no timestamps)
            if r.status_code in (404, 422):
                print("  with-timestamps not available, falling back to basic TTS ...")
                return basic_tts(key, voice_id, text, model_id, stability, similarity, style)
            sys.exit(f"TTS failed (HTTP {r.status_code}): {r.text[:500]}")
        except (requests.exceptions.Timeout, requests.exceptions.ConnectionError) as e:
            if attempt < 5:
                wait = min(2 ** attempt * 5, 60)
                print(f"  connection error ({type(e).__name__}), retrying ({attempt + 1}/6) in {wait}s ...")
                time.sleep(wait)
                continue
            raise
    sys.exit("TTS failed after 6 retries")


def basic_tts(key: str, voice_id: str, text: str, model_id: str,
              stability: float, similarity: float, style: float) -> dict:
    """Fallback: basic TTS endpoint (no alignment). Audio only, no timestamps."""
    url = f"{API_BASE}/text-to-speech/{voice_id}"
    payload = {
        "text": text,
        "model_id": model_id,
        "voice_settings": {
            "stability": stability,
            "similarity_boost": similarity,
            "style": style,
            "use_speaker_boost": True,
        },
    }
    for attempt in range(6):
        try:
            r = requests.post(url, headers={"xi-api-key": key, "Content-Type": "application/json"},
                              json=payload, timeout=180)
            r.raise_for_status()
            audio_b64 = base64.b64encode(r.content).decode("ascii")
            return {"audio_base64": audio_b64, "alignment": None}
        except (requests.exceptions.Timeout, requests.exceptions.ConnectionError) as e:
            if attempt < 5:
                wait = min(2 ** attempt * 5, 60)
                print(f"  basic TTS connection error ({type(e).__name__}), retrying ({attempt + 1}/6) in {wait}s ...")
                time.sleep(wait)
                continue
            raise


def chars_to_words(alignment: dict) -> list[dict]:
    """Aggregate character-level alignment into word-level {text, start, end} in ms."""
    if not alignment:
        return []
    chars = alignment.get("characters", [])
    starts = alignment.get("character_start_times_seconds", [])
    ends = alignment.get("character_end_times_seconds", [])
    if len(chars) != len(starts) or len(chars) != len(ends):
        return []

    words = []
    current_word = ""
    word_start = None
    word_end = None

    for ch, st, en in zip(chars, starts, ends):
        if ch.strip() == "":
            if current_word:
                words.append({
                    "text": current_word,
                    "start": int(word_start * 1000),
                    "end": int(word_end * 1000),
                })
                current_word = ""
                word_start = None
                word_end = None
        else:
            if word_start is None:
                word_start = st
            current_word += ch
            word_end = en

    if current_word:
        words.append({
            "text": current_word,
            "start": int(word_start * 1000),
            "end": int(word_end * 1000),
        })

    return words


def probe_dur(path: str) -> float:
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=nw=1:nk=1", path],
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    return float(r.stdout.strip())


def concat_audio(chunk_files: list[str], out_path: str) -> float:
    """Concatenate audio chunks via ffmpeg. Returns total duration."""
    if len(chunk_files) == 1:
        # re-encode to ensure consistent format
        subprocess.run(["ffmpeg", "-y", "-i", chunk_files[0], "-c:a", "libmp3lame",
                        "-b:a", "192k", out_path],
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    else:
        listf = out_path + ".txt"
        with open(listf, "w") as f:
            for cf in chunk_files:
                f.write(f"file '{cf.replace(os.sep, '/')}'\n")
        subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", listf,
                        "-c:a", "libmp3lame", "-b:a", "192k", out_path],
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        os.remove(listf)
    return probe_dur(out_path)


def main() -> None:
    ap = argparse.ArgumentParser(description="ElevenLabs TTS with word-level timestamps")
    ap.add_argument("project", nargs="?", help="project dir (e.g. videos/video-1)")
    ap.add_argument("--text", help="inline text to synthesize")
    ap.add_argument("--text-file", help="file to read script from")
    ap.add_argument("--voice", default=DEFAULT_VOICE, help=f"voice ID (default: {DEFAULT_VOICE})")
    ap.add_argument("--model", default=DEFAULT_MODEL, help=f"model id (default: {DEFAULT_MODEL})")
    ap.add_argument("--stability", type=float, default=0.5, help="0-1, higher=more consistent")
    ap.add_argument("--similarity", type=float, default=0.75, help="0-1, higher=more similar")
    ap.add_argument("--style", type=float, default=0.0, help="0-1, higher=more stylized")
    ap.add_argument("--speed", type=float, default=1.0, help="speed multiplier (0.7-1.2)")
    ap.add_argument("--list-voices", action="store_true", help="list available voices and exit")
    args = ap.parse_args()

    repo_root = Path(__file__).resolve().parent.parent
    key = load_key(repo_root)

    if args.list_voices:
        list_voices(key)
        return

    if not args.project:
        sys.exit("usage: tts.py <project> --text '...' | --text-file path | --list-voices")

    if args.text_file:
        text = Path(args.text_file).read_text(encoding="utf-8").strip()
    elif args.text:
        text = args.text.strip()
    else:
        sys.exit("provide --text or --text-file")

    text = re.sub(r'\s+', ' ', text)
    if not text:
        sys.exit("empty text — nothing to synthesize")

    project = repo_root / args.project
    audio_dir = project / "work" / "audio"
    audio_dir.mkdir(parents=True, exist_ok=True)
    work_dir = project / "work"
    work_dir.mkdir(parents=True, exist_ok=True)

    out_audio = str(audio_dir / "voiceover.mp3")
    out_transcript = work_dir / "edited-transcript.json"

    chunks = chunk_text(text)
    print(f"text: {len(text)} chars -> {len(chunks)} chunk(s)")
    print(f"voice: {args.voice}  model: {args.model}")

    all_words = []
    chunk_files = []
    time_offset = 0.0

    for i, chunk in enumerate(chunks):
        print(f"\nchunk {i+1}/{len(chunks)} ({len(chunk)} chars) ...")
        result = synthesize_chunk(key, args.voice, chunk, args.model,
                                   args.stability, args.similarity, args.style)

        # decode audio
        chunk_mp3 = str(audio_dir / f"_chunk_{i:03d}.mp3")
        audio_bytes = base64.b64decode(result["audio_base64"])
        with open(chunk_mp3, "wb") as f:
            f.write(audio_bytes)
        chunk_dur = probe_dur(chunk_mp3)
        chunk_files.append(chunk_mp3)
        print(f"  audio: {len(audio_bytes)/1e6:.1f} MB, {chunk_dur:.1f}s")

        # parse alignment -> words, offset by accumulated time
        words = chars_to_words(result.get("alignment"))
        for w in words:
            w["start"] += int(time_offset * 1000)
            w["end"] += int(time_offset * 1000)
        all_words.extend(words)
        if words:
            print(f"  words: {len(words)} (offset +{time_offset:.1f}s)")
        else:
            print(f"  WARNING: no alignment data — transcript will be empty for this chunk")

        time_offset += chunk_dur

    # concat audio
    print("\nconcatenating audio ...")
    total_dur = concat_audio(chunk_files, out_audio)
    print(f"voiceover: {total_dur:.1f}s -> {os.path.relpath(out_audio, repo_root)}")

    # cleanup chunks
    for cf in chunk_files:
        if os.path.exists(cf):
            os.remove(cf)

    # apply speed adjustment via ffmpeg atempo (if speed != 1.0)
    if args.speed != 1.0:
        print(f"applying speed adjustment ({args.speed}x) ...")
        sped_path = out_audio.replace(".mp3", "_sped.mp3")
        # atempo supports 0.5-2.0; for outside that range, chain filters
        speed = args.speed
        if 0.5 <= speed <= 2.0:
            atempo = f"atempo={speed}"
        else:
            # chain: e.g. 2.5x = atempo=2.0,atempo=1.25
            atempo = f"atempo=2.0,atempo={speed/2.0}"
        subprocess.run(
            ["ffmpeg", "-y", "-i", out_audio, "-af", atempo, "-c:a", "libmp3lame", "-b:a", "192k", sped_path],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        os.replace(sped_path, out_audio)
        old_dur = total_dur
        total_dur = probe_dur(out_audio)
        print(f"  speed: {old_dur:.1f}s -> {total_dur:.1f}s")
        # scale word timestamps to match the new duration
        speed_ratio = total_dur / old_dur if old_dur > 0 else 1.0
        for w in all_words:
            w["start"] = int(w["start"] * speed_ratio)
            w["end"] = int(w["end"] * speed_ratio)

    # write edited-transcript.json
    transcript = {"words": all_words, "duration_s": round(total_dur, 3)}
    out_transcript.write_text(json.dumps(transcript, indent=1), encoding="utf-8")
    print(f"transcript: {len(all_words)} words -> {os.path.relpath(str(out_transcript), repo_root)}")

    # estimate cost
    cost = total_dur / 60 * 1000  # ElevenLabs TTS: ~1000 credits/min
    print(f"\nDone. ~{cost:.0f} ElevenLabs credits used (~${cost/5000:.2f} at creator tier).")
    if not all_words:
        print("  WARNING: no word timestamps — /make-tsx cannot sync visuals without them.")
        print("  The with-timestamps endpoint may not be available on your plan.")


if __name__ == "__main__":
    main()
