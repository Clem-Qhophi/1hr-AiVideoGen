#!/usr/bin/env python3
"""
tts_edge.py — FREE text-to-speech using Microsoft Edge TTS (no API key needed).

Alternative to tts.py (ElevenLabs). Uses Microsoft's neural TTS voices through
the edge-tts library. Completely free, no API key, no credits.

Generates voiceover MP3 + edited-transcript.json with word-level timestamps
(same output format as tts.py, so the rest of the pipeline works unchanged).

Usage:
  python tools/tts_edge.py videos/video-1 --text "Hello world" --voice en-US-AriaNeural
  python tools/tts_edge.py videos/video-1 --text-file videos/video-1/work/script.md --voice en-US-GuyNeural
  python tools/tts_edge.py --list-voices

Needs: pip install edge-tts (already installed in the venv)
"""
import argparse
import asyncio
import json
import os
import re
import subprocess
import sys
from pathlib import Path

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DEFAULT_VOICE = "en-US-GuyNeural"  # deep, news-style male voice

# Recommended voices by delivery mode
VOICE_RECOMMENDATIONS = {
    "breaking-news": "en-US-GuyNeural",      # deep, authoritative
    "calm-explainer": "en-US-AriaNeural",    # clear, female, educational
    "sarcastic-review": "en-US-DavisNeural", # casual, conversational
    "authoritative": "en-US-DavisNeural",    # steady, confident
}


async def list_voices_async():
    import edge_tts
    voices = await edge_tts.list_voices()
    print(f"{'Voice':<30} {'Locale':<12} {'Gender':<8}")
    print("-" * 55)
    for v in voices:
        if v["Locale"].startswith("en-"):
            print(f"{v['ShortName']:<30} {v['Locale']:<12} {v['Gender']:<8}")


def list_voices():
    asyncio.run(list_voices_async())


async def synthesize_async(text: str, voice: str, out_path: str, rate: str = "+0%",
                           volume: str = "+0%", pitch: str = "+0Hz") -> list[dict]:
    """Synthesize text and return word-level timestamps."""
    import edge_tts

    communicate = edge_tts.Communicate(text, voice, rate=rate, volume=volume, pitch=pitch,
                                       boundary="WordBoundary")
    words = []

    async for event in communicate.stream():
        if event["type"] == "audio":
            with open(out_path, "ab") as f:
                f.write(event["data"])
        elif event["type"] == "WordBoundary":
            words.append({
                "text": event["text"],
                "start": int(event["offset"] / 10000),  # offset is in 100ns units -> ms
                "end": int((event["offset"] + event["duration"]) / 10000),
            })

    return words


def synthesize(text: str, voice: str, out_path: str, rate: str = "+0%",
               volume: str = "+0%", pitch: str = "+0Hz") -> list[dict]:
    """Sync wrapper for synthesize_async."""
    # Clear the output file first
    with open(out_path, "wb") as f:
        pass
    return asyncio.run(synthesize_async(text, voice, out_path, rate, volume, pitch))


def probe_dur(path: str) -> float:
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=nw=1:nk=1", path],
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    return float(r.stdout.strip())


def chunk_text(text: str, max_chars: int = 3000) -> list[str]:
    """Split text into chunks at sentence boundaries."""
    text = text.strip()
    if len(text) <= max_chars:
        return [text]
    sentences = re.split(r'(?<=[.!?])\s+', text)
    chunks = []
    current = ""
    for sent in sentences:
        if len(current) + len(sent) + 1 <= max_chars:
            current = (current + " " + sent).strip() if current else sent
        else:
            if current:
                chunks.append(current)
            current = sent
    if current:
        chunks.append(current)
    return chunks


def extract_spoken_text(script: str) -> str:
    """Extract spoken narration: drop # comments, ## headers, and [beat: ...] directives."""
    lines = script.strip().split("\n")
    spoken = []
    for line in lines:
        line = line.strip()
        if not line or line.startswith("#") or re.match(r"^\[beat:", line, re.I):
            continue
        spoken.append(line)
    return " ".join(spoken)


def speed_to_rate(speed: float) -> str:
    """Convert speed multiplier to Edge TTS rate string."""
    pct = int((speed - 1.0) * 100)
    if pct >= 0:
        return f"+{pct}%"
    return f"{pct}%"


def main():
    ap = argparse.ArgumentParser(description="Free TTS using Microsoft Edge TTS (no API key needed)")
    ap.add_argument("project", nargs="?", help="project dir (e.g. videos/video-1)")
    ap.add_argument("--text", help="inline text to synthesize")
    ap.add_argument("--text-file", help="file to read script from")
    ap.add_argument("--voice", default=DEFAULT_VOICE, help=f"voice name (default: {DEFAULT_VOICE})")
    ap.add_argument("--speed", type=float, default=1.0, help="speed multiplier (0.5-2.0, default 1.0)")
    ap.add_argument("--pitch-hz", dest="pitch_hz", type=float, default=0.0,
                    help="pitch shift in Hz (e.g. -3 reads less announcer-flat; default 0)")
    ap.add_argument("--volume", dest="volume_pct", type=float, default=0.0,
                    help="volume shift in percent (default 0)")
    ap.add_argument("--list-voices", action="store_true", help="list available English voices")
    args = ap.parse_args()

    if args.list_voices:
        list_voices()
        return

    if not args.project:
        sys.exit("usage: tts_edge.py <project> --text '...' | --text-file path | --list-voices")

    if args.text_file:
        text = extract_spoken_text(Path(args.text_file).read_text(encoding="utf-8"))
    elif args.text:
        text = args.text.strip()
    else:
        sys.exit("provide --text or --text-file")

    text = re.sub(r'\s+', ' ', text)
    if not text:
        sys.exit("empty text — nothing to synthesize")

    repo_root = Path(ROOT)
    project = repo_root / args.project
    audio_dir = project / "work" / "audio"
    audio_dir.mkdir(parents=True, exist_ok=True)
    work_dir = project / "work"
    work_dir.mkdir(parents=True, exist_ok=True)

    out_audio = str(audio_dir / "voiceover.mp3")
    out_transcript = work_dir / "edited-transcript.json"

    # Convert speed to Edge TTS rate
    rate = speed_to_rate(args.speed)
    vol = f"{int(args.volume_pct):+d}%"
    pitch = f"{int(args.pitch_hz):+d}Hz"

    chunks = chunk_text(text)
    print(f"text: {len(text)} chars -> {len(chunks)} chunk(s)")
    print(f"voice: {args.voice}  rate: {rate}  volume: {vol}  pitch: {pitch}")

    all_words = []
    time_offset_ms = 0

    # Clear output file
    with open(out_audio, "wb") as f:
        pass

    # Synthesize chunks IN PARALLEL (max 3: each synthesize() runs its own asyncio loop in
    # its own thread; don't push higher or the free edge-tts endpoint starts refusing).
    # Word offsets are re-derived from each chunk's PROBED duration below, so only the
    # concat order matters — parallel synthesis changes nothing about the output.
    from concurrent.futures import ThreadPoolExecutor
    chunk_files = [str(audio_dir / f"_chunk_{i:03d}.mp3") for i in range(len(chunks))]
    if len(chunks) > 1:
        print("synthesizing in parallel (3 workers)...")
        with ThreadPoolExecutor(max_workers=3) as ex:
            results = list(ex.map(
                lambda ic: synthesize(ic[1], args.voice, chunk_files[ic[0]], rate, vol, pitch),
                enumerate(chunks)))
    else:
        results = [synthesize(chunks[0], args.voice, chunk_files[0], rate, vol, pitch)]

    for i, words in enumerate(results):
        chunk_audio = chunk_files[i]

        # Get chunk duration
        chunk_dur = probe_dur(chunk_audio)

        # Append chunk audio to main file
        with open(chunk_audio, "rb") as src, open(out_audio, "ab") as dst:
            dst.write(src.read())

        # Offset word timestamps
        for w in words:
            w["start"] += time_offset_ms
            w["end"] += time_offset_ms
        all_words.extend(words)
        print(f"  chunk {i+1}/{len(chunks)}: {len(words)} words, {chunk_dur:.1f}s")

        time_offset_ms += int(chunk_dur * 1000)

        # Clean up chunk file
        if os.path.exists(chunk_audio):
            os.remove(chunk_audio)

    # Re-encode the concatenated audio for consistency
    final_audio = str(audio_dir / "_final.mp3")
    subprocess.run(["ffmpeg", "-y", "-i", out_audio, "-c:a", "libmp3lame", "-b:a", "192k", final_audio],
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    os.replace(final_audio, out_audio)

    total_dur = probe_dur(out_audio)
    print(f"\nvoiceover: {total_dur:.1f}s -> {os.path.relpath(out_audio, repo_root)}")

    # Write edited-transcript.json
    transcript = {"words": all_words, "duration_s": round(total_dur, 3)}
    out_transcript.write_text(json.dumps(transcript, indent=1), encoding="utf-8")
    print(f"transcript: {len(all_words)} words -> {os.path.relpath(str(out_transcript), repo_root)}")
    print(f"\nDone. FREE — no credits used.")


if __name__ == "__main__":
    main()
