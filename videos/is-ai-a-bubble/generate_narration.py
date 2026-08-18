import asyncio
import os
import re
import edge_tts

ROOT = os.path.dirname(os.path.abspath(__file__))
SCRIPT_PATH = os.path.join(ROOT, "script_full.md")
OUT_AUDIO = os.path.join(ROOT, "narration_master.mp3")
VOICE = "en-US-ChristopherNeural"

def clean_script_for_tts(raw_text: str) -> str:
    lines = []
    for line in raw_text.splitlines():
        line = line.strip()
        # Skip markdown headings, horizontal rules, timestamps, and metadata
        if not line or line.startswith("#") or line.startswith("---") or line.startswith("**Estimated Length"):
            continue
        if re.match(r"^\*\*(Act [IVX]+|ACT [IVX]+|[0-9]{2}:[0-9]{2})", line):
            continue
        # Remove director notes [VISUAL: ...] and [SFX: ...]
        line = re.sub(r"\[VISUAL:.*?\]", "", line)
        line = re.sub(r"\[SFX:.*?\]", "", line)
        line = line.strip()
        if line:
            lines.append(line)
    return " ".join(lines)

async def main():
    print(f"Reading script from {SCRIPT_PATH}...")
    with open(SCRIPT_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    spoken_text = clean_script_for_tts(content)
    print(f"Extracted {len(spoken_text.split())} spoken words.")
    print(f"Synthesizing voiceover with voice: {VOICE}...")

    communicate = edge_tts.Communicate(spoken_text, VOICE, rate="+3%")
    await communicate.save(OUT_AUDIO)
    print(f"[SUCCESS] Master narration saved successfully to: {OUT_AUDIO}")

if __name__ == "__main__":
    asyncio.run(main())
