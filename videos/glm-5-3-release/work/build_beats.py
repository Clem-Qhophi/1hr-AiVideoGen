import json
import os
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent.parent
project_dir = Path(__file__).resolve().parent.parent
vo_path = project_dir / "work" / "audio" / "voiceover.mp3"

# Probe VO duration accurately with ffprobe
r = subprocess.run(
    ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", str(vo_path)],
    capture_output=True, text=True
)
total_dur = float(r.stdout.strip())
print(f"Voiceover duration: {total_dur:.2f}s")

def abs_p(rel_str):
    p = ROOT / rel_str
    if not p.exists():
        # try relative to project dir
        p2 = project_dir / rel_str
        if p2.exists():
            return str(p2.resolve())
        raise FileNotFoundError(f"Missing asset: {p}")
    return str(p.resolve())

beats_spec = [
    # (end_s, relative_path, move, cue)
    (5.5, "media/projects/glm-5-3-release/evidence/zhipu-glm53-announcement.png", "in", "hook"),
    (9.8, "videos/glm-5-3-release/work/cards/card_cybergym.png", "none", "stat-cyber"),
    (15.2, "videos/glm-5-3-release/work/cards/card_catch.png", "none", "stat-catch"),
    (22.0, "media/projects/glm-5-3-release/evidence/zhipu-glm53-announcement.png", "right", "context-ascend"),
    (29.5, "videos/glm-5-3-release/work/cards/card_specs.png", "none", "stat-specs"),
    (36.0, "media/library/backgrounds/rm-bg-cyan.png", "in", "verdict-open"),
    (44.0, "videos/glm-5-3-release/work/cards/card_cybergym.png", "none", "verdict-analyst"),
    (52.0, "videos/glm-5-3-release/work/cards/card_deepswe.png", "none", "verdict-coding"),
    (61.0, "videos/glm-5-3-release/work/cards/card_specs.png", "none", "verdict-context"),
    (71.0, "videos/glm-5-3-release/work/cards/card_cve.png", "none", "verdict-cves"),
    (82.0, "media/library/backgrounds/rm-bg-green.png", "left", "verdict-wrap"),
    (94.0, "media/projects/glm-5-3-release/evidence/cybergym-leaderboard.png", "in", "evidence-leaderboard"),
    (106.0, "videos/glm-5-3-release/work/cards/card_deepswe.png", "none", "evidence-deepswe"),
    (117.0, "videos/glm-5-3-release/work/cards/card_terminal.png", "none", "evidence-terminal"),
    (128.0, "media/library/backgrounds/rm-bg-accent.png", "out", "midroll-cta"),
    (140.0, "videos/glm-5-3-release/work/cards/card_terminal.png", "none", "evidence-cli-ascend"),
    (152.0, "videos/glm-5-3-release/work/cards/card_catch.png", "none", "honest-gap-exploit"),
    (165.0, "media/projects/glm-5-3-release/evidence/zai-coding-pricing.png", "down", "honest-gap-pricing"),
    (174.0, "media/library/backgrounds/rm-bg-amber.png", "in", "close-promise"),
    (9999.0, "media/library/backgrounds/rm-bg-red.png", "out", "close-cta"),
]

beats = []
cur_s = 0.0
for end_s, rel_img, move, cue in beats_spec:
    beat_end = min(end_s, total_dur)
    if cur_s >= total_dur:
        break
    beats.append({
        "image": abs_p(rel_img),
        "start_s": round(cur_s, 2),
        "end_s": round(beat_end, 2),
        "move": move,
        "cue": cue
    })
    cur_s = beat_end

# Ensure last beat extends exactly to total_dur
if beats:
    beats[-1]["end_s"] = round(total_dur, 2)

beats_data = {
    "output": {
        "w": 1920,
        "h": 1080,
        "fps": 30,
        "out": "output/glm-5-3-release-visuals.mp4"
    },
    "audio": "work/audio/voiceover.mp3",
    "grade": {
        "vignette": 0.18,
        "grain": 2,
        "tint": "none"
    },
    "beats": beats
}

beats_file = project_dir / "work" / "beats.json"
beats_file.write_text(json.dumps(beats_data, indent=2), encoding="utf-8")
print(f"Generated {len(beats)} beats in {beats_file}")
