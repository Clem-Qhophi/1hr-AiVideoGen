"""robust_tts.py — edge-tts with per-chunk retry + serial synthesis (the endpoint drops
streams under parallel load; free tier). Writes voiceover.mp3 only; word timings come
from align_asr.py afterwards."""
import asyncio
import sys
import json
import time
import subprocess
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parent.parent


async def synth_one(text: str, voice: str, rate: str, out: Path) -> None:
    c = edge_tts.Communicate(text, voice, rate=rate)
    await asyncio.wait_for(c.save(str(out)), timeout=300)


def probe_dur(p: Path) -> float:
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                        "-of", "default=noprint_wrappers=1:nokey=1", str(p)],
                       capture_output=True, text=True)
    try:
        return float(r.stdout.strip())
    except ValueError:
        return 0.0


def main() -> int:
    project = ROOT / sys.argv[1]
    voice = sys.argv[2] if len(sys.argv) > 2 else "en-US-AndrewNeural"
    speed = float(sys.argv[3]) if len(sys.argv) > 3 else 1.10
    audio_dir = project / "work" / "audio"
    audio_dir.mkdir(parents=True, exist_ok=True)
    pct = int(round((speed - 1.0) * 100))
    rate = f"+{pct}%"

    chunks = sorted(audio_dir.glob("_chunk_*.txt"))
    if not chunks:
        sys.exit("no _chunk_*.txt files found")
    out = audio_dir / "voiceover.mp3"
    tmp = audio_dir / "_ser.mp3"
    with open(out, "wb") as f:
        pass

    expected_ratio = 1.0 / speed  # duration scales ~inversely with rate
    for i, cf in enumerate(chunks):
        text = cf.read_text(encoding="utf-8").strip()
        words = len(text.split())
        # baseline ~195ms/word at +0% (measured 428.2s for 1046 words)
        expect = words * 0.4282 / 1.046 * expected_ratio
        ok = False
        for attempt in range(6):
            tmp.unlink(missing_ok=True)
            try:
                asyncio.run(synth_one(text, voice, rate, tmp))
            except Exception as e:
                print(f"  chunk {i}: synth error: {e}; retry")
                time.sleep(2)
                continue
            d = probe_dur(tmp)
            ok = d >= expect * 0.85  # allow 15% slop
            print(f"  chunk {i}: {words}w, got {d:.1f}s (expect ~{expect:.0f}s) {'OK' if ok else 'TRUNCATED, retry'}")
            if ok:
                break
            time.sleep(2)
        if not ok:
            print(f"FAILED after retries: chunk {i}")
            return 1
        with open(tmp, "rb") as src, open(out, "ab") as dst:
            dst.write(src.read())
        tmp.unlink(missing_ok=True)

    # re-encode for consistency
    final = audio_dir / "_final.mp3"
    subprocess.run(["ffmpeg", "-y", "-i", str(out), "-c:a", "libmp3lame", "-b:a", "192k", str(final)],
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    final.replace(out)
    print(f"voiceover: {probe_dur(out):.1f}s -> {out.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())