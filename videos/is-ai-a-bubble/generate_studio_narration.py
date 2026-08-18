import asyncio
import os
import re
import subprocess
import edge_tts

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PROJECT_DIR = os.path.join(ROOT, "videos", "is-ai-a-bubble")
SCRIPT_PATH = os.path.join(PROJECT_DIR, "script_full.md")
RAW_VOICE_OUT = os.path.join(PROJECT_DIR, "raw_narration.mp3")
MASTER_AUDIO_OUT = os.path.join(PROJECT_DIR, "studio_master_audio.mp3")

BG_MUSIC = os.path.join(ROOT, "media", "library", "music", "clips", "tech-pulse.mp3")
SFX_WHOOSH = os.path.join(ROOT, "media", "library", "sfx", "clips", "whoosh-soft.mp3")
SFX_IMPACT = os.path.join(ROOT, "media", "library", "sfx", "clips", "impact-deep-soft.mp3")

# High-fidelity natural documentary narrator
VOICE = "en-US-GuyNeural"

def clean_script(raw_text: str) -> str:
    lines = []
    for line in raw_text.splitlines():
        line = line.strip()
        if not line or line.startswith("#") or line.startswith("---") or line.startswith("**Estimated"):
            continue
        if re.match(r"^\*\*(Act [IVX]+|ACT [IVX]+|[0-9]{2}:[0-9]{2})", line):
            continue
        # Remove director cues
        line = re.sub(r"\[VISUAL:.*?\]", "", line)
        line = re.sub(r"\[SFX:.*?\]", "", line)
        line = line.strip()
        if line:
            lines.append(line)
    
    # Join with distinct paragraph pauses
    return "\n\n".join(lines)

async def synthesize_voice():
    print(f"Reading script: {SCRIPT_PATH}...")
    with open(SCRIPT_PATH, "r", encoding="utf-8") as f:
        text = clean_script(f.read())

    print(f"Synthesizing high-cadence narration with voice '{VOICE}'...")
    communicate = edge_tts.Communicate(text, VOICE, rate="-2%", pitch="-1Hz")
    await communicate.save(RAW_VOICE_OUT)
    print(f"Raw narration written: {RAW_VOICE_OUT}")

def master_audio():
    print("Mastering audio: Equalization + -24dB Tech Ambient Music Bed...")
    # FFmpeg filtergraph:
    # 1. Voice EQ: Highpass 80Hz (remove mud), gentle presence boost at 3kHz, compression.
    # 2. Loop bg music at volume 0.08 (-24dB), mix with voiceover.
    cmd = [
        "ffmpeg", "-y",
        "-i", RAW_VOICE_OUT,
        "-stream_loop", "-1", "-i", BG_MUSIC,
        "-filter_complex",
        "[0:a]highpass=f=80,equalizer=f=3200:t=q:w=1.2:g=2.5,compand=attacks=0.05:decays=0.2:points=-80/-80|-24/-20|-12/-10|0/-4[voice];"
        "[1:a]volume=0.07[bg];"
        "[voice][bg]amix=inputs=2:duration=first:dropout_transition=3[aout]",
        "-map", "[aout]",
        "-c:a", "libmp3lame",
        "-b:a", "192k",
        MASTER_AUDIO_OUT
    ]
    subprocess.run(cmd, check=True)
    print(f"[SUCCESS] Studio master audio generated: {MASTER_AUDIO_OUT}")

if __name__ == "__main__":
    asyncio.run(synthesize_voice())
    master_audio()
