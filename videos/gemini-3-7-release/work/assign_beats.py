import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent.parent
project_dir = Path(__file__).resolve().parent.parent
beats_file = project_dir / "work" / "beats.json"

beats_data = json.loads(beats_file.read_text(encoding="utf-8"))

def abs_p(rel_str):
    p = ROOT / rel_str
    if not p.exists():
        raise FileNotFoundError(f"Missing asset: {p}")
    return str(p.resolve())

mapping = [
    # (max_s, relative_img_path, move)
    (5.08, "media/projects/gemini-3-7-release/evidence/deepmind-gemini-announcement.png", "in"),
    (8.5, "videos/gemini-3-7-release/work/cards/card_deepswe.png", "none"),
    (12.57, "videos/gemini-3-7-release/work/cards/card_price_cut.png", "none"),
    (18.0, "media/projects/gemini-3-7-release/evidence/deepmind-gemini-announcement.png", "right"),
    (24.0, "media/library/backgrounds/rm-bg-cyan.png", "in"),
    (30.0, "videos/gemini-3-7-release/work/cards/card_frontiercode.png", "none"),
    (37.0, "media/library/backgrounds/rm-bg-accent.png", "left"),
    (45.0, "media/library/backgrounds/rm-bg-green.png", "out"),
    (55.0, "videos/gemini-3-7-release/work/cards/card_deepswe.png", "none"),
    (68.0, "media/projects/gemini-3-7-release/evidence/github-copilot-gemini.png", "in"),
    (80.0, "videos/gemini-3-7-release/work/cards/card_automation.png", "none"),
    (95.0, "media/library/backgrounds/rm-bg-cyan.png", "up"),
    (110.0, "media/projects/gemini-3-7-release/evidence/google-ai-pricing.png", "down"),
    (120.0, "videos/gemini-3-7-release/work/cards/card_deepswe.png", "none"),
    (128.0, "videos/gemini-3-7-release/work/cards/card_frontiercode.png", "none"),
    (136.0, "videos/gemini-3-7-release/work/cards/card_webdev.png", "none"),
    (144.0, "videos/gemini-3-7-release/work/cards/card_gdppdf.png", "none"),
    (152.0, "videos/gemini-3-7-release/work/cards/card_automation.png", "none"),
    (160.0, "media/library/backgrounds/rm-bg-amber.png", "in"),
    (168.0, "videos/gemini-3-7-release/work/cards/card_price_cut.png", "none"),
    (178.0, "videos/gemini-3-7-release/work/cards/card_catch_2027.png", "none"),
    (188.0, "media/projects/gemini-3-7-release/evidence/google-ai-pricing.png", "left"),
    (198.0, "media/library/backgrounds/rm-bg-red.png", "out"),
    (208.0, "media/library/backgrounds/rm-bg-cyan.png", "right"),
    (216.0, "media/projects/gemini-3-7-release/evidence/deepmind-gemini-announcement.png", "in"),
    (999.0, "media/library/backgrounds/rm-bg-accent.png", "out"),
]

for beat in beats_data["beats"]:
    start = beat["start_s"]
    for max_s, img_path, move in mapping:
        if start < max_s:
            beat["image"] = abs_p(img_path)
            beat["move"] = move
            break

beats_file.write_text(json.dumps(beats_data, indent=1), encoding="utf-8")
print(f"Updated {len(beats_data['beats'])} beats in {beats_file}")
