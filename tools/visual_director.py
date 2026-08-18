#!/usr/bin/env python3
"""
visual_director.py — High-Density Contextual Visual Synthesis & Beat Planner.

Solves the root cause of "blank spaces, repeated backgrounds, and screenshot mismatch":
  1. Inspects spoken words in every 2.0s - 4.5s window of edited-transcript.json.
  2. Synthesizes/selects a high-density, contextually matching visual asset:
     - Real Web Captures (announcements, pricing pages, documentation)
     - Syntax-Highlighted Code Editor Frames (mocking IDE reasoning, Python/TS agents)
     - Benchmark Spec Cards (SWE-Bench, FrontierCode, WebDev Arena, AutomationBench)
     - Split Comparison Diagrams (Gemini vs Sonnet, Fast vs Deep thinking)
     - Warning / CTA High-Impact Cards
  3. Enforces Visual Density & Diversity Rules:
     - Zero plain/empty background spans (>0 seconds)
     - Maximum consecutive same asset: <= 2 beats (<= 5 seconds)
     - Minimum unique asset count >= 10 distinct assets

Usage:
  python tools/visual_director.py plan videos/gemini-3-7-release --niche ai-news
  python tools/visual_director.py generate-assets videos/gemini-3-7-release
  python tools/visual_director.py audit videos/gemini-3-7-release
"""
import argparse
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")


def get_font(size, bold=True):
    candidates = ["arialbd.ttf", "segoeuib.ttf", "DejaVuSans-Bold.ttf", "consola.ttf", "Helvetica-Bold.ttf"]
    for c in candidates:
        try:
            return ImageFont.truetype(c, size)
        except:
            pass
    return ImageFont.load_default()


def generate_code_frame(out_path: Path, title: str, code_lines: list, accent=(56, 189, 248)):
    """Renders a sleek, syntax-highlighted dark IDE mockup."""
    w, h = 1920, 1080
    im = Image.new("RGB", (w, h), (15, 18, 25))
    draw = ImageDraw.Draw(im)

    # Window container
    draw.rectangle([(80, 80), (1840, 1000)], fill=(22, 27, 34), outline=(48, 54, 61), width=2)
    draw.rectangle([(80, 80), (1840, 150)], fill=(33, 38, 45))

    # Window buttons
    draw.ellipse([(110, 105), (130, 125)], fill=(239, 68, 68))
    draw.ellipse([(145, 105), (165, 125)], fill=(234, 179, 8))
    draw.ellipse([(180, 105), (200, 125)], fill=(34, 197, 94))

    # Tab title
    draw.text((230, 102), f"⚡ {title}", font=get_font(28, bold=True), fill=(240, 246, 252))

    # Code text
    font_code = get_font(30, bold=False)
    font_kw = get_font(30, bold=True)
    y = 190
    for idx, line in enumerate(code_lines):
        draw.text((110, y), f"{idx+1:>2}", font=font_code, fill=(100, 116, 139))
        if any(line.strip().startswith(kw) for kw in ["import", "from", "def", "async", "class", "return", "if", "await", "@"]):
            draw.text((180, y), line, font=font_kw, fill=accent)
        elif line.strip().startswith("#"):
            draw.text((180, y), line, font=font_code, fill=(148, 163, 184))
        elif '"' in line or "'" in line:
            draw.text((180, y), line, font=font_code, fill=(134, 239, 172))
        else:
            draw.text((180, y), line, font=font_code, fill=(241, 245, 249))
        y += 44

    im.save(out_path, "PNG")


def synthesize_project_assets(project_dir: Path):
    """Generates and copies all auxiliary code frames, spec cards, and evidence into work/images/."""
    images_dir = project_dir / "work" / "images"
    images_dir.mkdir(parents=True, exist_ok=True)
    slug = project_dir.name
    model = slug.replace("_", "-").lower()

    # Code frames are AI/tech-news flavour: a Python IDE mockup on "your agent's commission" is
    # wrong content for a real-estate video. Detect AI-ness from the names of the assets the
    # project actually has (evidence + stock): no AI vocabulary -> no code frames.
    ai_hint = re.compile(r"\b(gpt|gemini|claude|llama|chatgpt|deepseek|mistral|openai|anthropic|"
                         r"bench|swe|arena|model|veo|sora|midjourney|api)\b", re.I)
    existing = [p.name for p in images_dir.iterdir()] if images_dir.is_dir() else []
    ev_dir = ROOT / "media" / "projects" / slug / "evidence"
    if ev_dir.is_dir():
        existing += [p.name for p in ev_dir.iterdir()]
    ai_project = any(ai_hint.search(n) for n in existing)

    if ai_project:
        # 1. Code Editor: Agentic Thinking Loop
        generate_code_frame(
            images_dir / "code-agent-loop.png",
            f"{slug}_agent.py — Thinking Budget & Tool Execution",
            [
                f"# {slug}: Configurable Thinking Budget Execution",
                "import openai as ai",
                "from ai import types",
                "",
                "client = ai.Client()",
                "response = await client.models.generate_content(",
                f"    model='{model}',",
                "    contents='Debug and patch repo issue #4129',",
                "    config=types.GenerateContentConfig(",
                "        thinking_config=types.ThinkingConfig(thinking_budget=16000),",
                "        tools=[types.Tool(function_declarations=[run_test, patch_file])],",
                "    )",
                ")",
                "",
                "# Verdict: benchmark pass rate verified in evidence",
                "print(f'Thinking Tokens: {response.usage.thinking_tokens}')",
                "print(f'Result: {response.text[:100]}...')",
            ],
            accent=(56, 189, 248),
        )

        # 2. Code Editor: Fast Latency Mode
        generate_code_frame(
            images_dir / "code-fast-latency.png",
            f"{slug}_fast.py — Zero-Thinking Sub-Second Latency",
            [
                "# Zero-Thinking Budget: Sub-200ms TTFT Mode",
                "config = types.GenerateContentConfig(",
                "    thinking_config=types.ThinkingConfig(thinking_budget=0),",
                "    temperature=0.2,",
                ")",
                "stream = client.models.generate_content_stream(",
                f"    model='{model}',",
                "    contents='Translate UI component to Tailwind and React',",
                "    config=config",
                ")",
                "for chunk in stream:",
                "    print(chunk.text, end='', flush=True)  # Instant Stream",
            ],
            accent=(74, 222, 128),
        )

        # 3. Code Editor: Tool Calling Execution
        generate_code_frame(
            images_dir / "code-tool-calling.png",
            f"{slug}_tools.py — Autonomous Tool Calling Fidelity",
            [
                "@tool",
                "def execute_sandbox_patch(diff_content: str) -> bool:",
                "    '''Applies unified git diff into Docker execution container.'''",
                "    sandbox = Container('bench-runner')",
                "    return sandbox.apply_patch(diff_content)",
                "",
                "# Autonomous Agent Execution Loop",
                f"agent = CodingAgent(model='{model}')",
                "test_run = agent.solve_issue('repo/django', issue_id=14981)",
                "assert test_run.passed == True",
            ],
            accent=(251, 191, 36),
        )
    else:
        print("  (project has no AI/tech asset vocabulary — skipping IDE code frames)")

    # Copy cards from work/cards/ to work/images/
    cards_dir = project_dir / "work" / "cards"
    if cards_dir.exists():
        for card_f in cards_dir.glob("*.png"):
            shutil.copy2(card_f, images_dir / card_f.name)

    # Copy evidence from media/projects/<slug>/evidence to work/images/
    slug = project_dir.name
    ev_dir = ROOT / "media" / "projects" / slug / "evidence"
    if ev_dir.exists():
        for ev_f in ev_dir.glob("*.png"):
            shutil.copy2(ev_f, images_dir / ev_f.name)

    # Scan for any Veo / AI video clips in work/images/
    video_clips = list(images_dir.glob("*.mp4"))
    all_assets = list(images_dir.glob("*.png")) + video_clips
    print(f"Synthesized and populated {len(all_assets)} visual assets ({len(video_clips)} video clips) in {images_dir}")


# keyword groups -> asset-name fragments that fit the beat's topic. Pure heuristic:
# the beat's words are matched against the FILENAMES of the assets that actually exist
# for this project, so nothing here is tied to one model or one video.
TOPIC_MAP = [
    (re.compile(r"\b(pricing|price|token|cost|cheap|half|billing|per month|per year|free)\b"),
     ["pricing", "price", "cost", "token", "catch", "fineprint", "card", "plan"]),
    (re.compile(r"\b(benchmark|score|pass|swe|frontier|arena|rank|elicit|elo|test suite|result)\b"),
     ["benchmark", "bench", "score", "card", "result", "pass"]),
    (re.compile(r"\b(latency|fast|speed|stream|instant|200ms|seconds|minute|real-time|quick)\b"),
     ["latency", "fast", "speed", "stream", "terminal", "instant"]),
    (re.compile(r"\b(tool|agent|execute|pytest|refactor|function|code|debug|sandbox|api)\b"),
     ["agent", "tool", "code", "terminal", "api", "loop"]),
    (re.compile(r"\b(announc|release|launch|unveil|shipped|now available|news|blog)\b"),
     ["announcement", "announce", "release", "evidence", "blog", "news"]),
    (re.compile(r"\b(catch|fine print|fineprint|trap|warning|hidden|limit|restriction|2027|until)\b"),
     ["catch", "fineprint", "warning", "card", "trap", "limit"]),
    (re.compile(r"\b(comparison|versus|vs|better|worse|difference|outperform|beat)\b"),
     ["compare", "comparison", "versus", "card", "chart"]),
]


def discover_assets(project_dir: Path) -> dict:
    """stem -> 'work/images/<name>' for every usable image/video clip this project actually has.
    Stills are .png/.jpg/.jpeg/.webp — stock fetches land as .jpg, cards/evidence as .png, so
    globbing only *.png (as this did) silently dropped a project's whole stock pool."""
    images_dir = project_dir / "work" / "images"
    if not images_dir.is_dir():
        return {}
    out = {}
    for f in sorted(images_dir.glob("*.png")) + sorted(images_dir.glob("*.jpg")) \
            + sorted(images_dir.glob("*.jpeg")) + sorted(images_dir.glob("*.webp")):
        out[f.stem] = f"work/images/{f.name}"
    for f in sorted(images_dir.glob("*.mp4")):
        out[f.stem] = f"work/images/{f.name}"
    return out


def pick_asset(text_chunk: str, assets: dict, last_two: list) -> tuple:
    """Best-fit asset for a beat's words: filename fragments that match the topic, then a
    de-duplicated rotation so nothing repeats 3x in a row. Returns (rel_path, query)."""
    pool = list(assets.values())
    if not pool:
        return "work/images/rm-bg.png", "fallback"

    scored = []
    for name, rel in assets.items():
        score = 0
        for rx, frags in TOPIC_MAP:
            if rx.search(text_chunk):
                if any(frag in name.lower() for frag in frags):
                    score += 3
        for frag in name.lower().split("-"):
            if frag and frag in text_chunk:
                score += 2
        if "veo" in name.lower() or name.lower().startswith("broll"):
            score += 1  # video clips are richer than stills; nudge them up
        scored.append((score, name, rel))
    scored.sort(key=lambda x: -x[0])

    for score, name, rel in scored:
        if score > 0 and rel not in last_two:
            return rel, name.replace("-", " ").replace("_", " ").title()
    # no topical match: rotate through everything, skipping the last two
    for rel in pool:
        if rel not in last_two:
            return rel, "Rotational Asset Sequence"
    return pool[0], "Rotational Asset Sequence"


def plan_dense_beats(project_dir: Path) -> dict:
    """
    Creates an aligned, high-density beats.json where every single beat maps to a
    rich visual asset matching the exact spoken narration.
    """
    work = project_dir / "work"
    et_path = work / "edited-transcript.json"
    if not et_path.exists():
        raise FileNotFoundError(f"Missing {et_path}")

    words = json.loads(et_path.read_text(encoding="utf-8"))["words"]
    synthesize_project_assets(project_dir)

    assets = discover_assets(project_dir)

    # Check for Veo AI video clips (Judicious Placement Policy: max 2 strategic spots: Hook + Turn)
    veo_clips = [rel for name, rel in sorted(assets.items()) if name.lower().startswith("veo")]
    video_stills = [rel for name, rel in sorted(assets.items()) if rel.lower().endswith(".mp4")]

    beats = []
    w_idx = 0
    total_words = len(words)
    beat_duration_target = 3.2

    # ms vs seconds: whisper/aligner emit ms (start values climb past 300 quickly); a plain
    # seconds format stays under 300 even for a 10-minute video's first words. Max, not any:
    # a single slow first word must not flip the whole file to the wrong unit.
    starts = [float(w.get("start", 0)) for w in words[:20]]
    is_ms = max(starts) > 300 if starts else False

    # the 50% mark, for the Veo turn clip: estimate the total beat count up front
    last_t = float(words[-1].get("end", 0)) / 1000.0 if is_ms else float(words[-1].get("end", 0))
    turn_beat = max(1, int(last_t / beat_duration_target) // 2) if last_t else 10**9
    turn_used = False

    while w_idx < total_words:
        beat_idx = len(beats)
        raw_start = words[w_idx]["start"]
        b_start = raw_start / 1000.0 if is_ms else float(raw_start)
        b_words = []
        while w_idx < total_words:
            raw_end = words[w_idx]["end"]
            curr_end = raw_end / 1000.0 if is_ms else float(raw_end)
            b_words.append(words[w_idx]["text"])
            w_idx += 1
            if (curr_end - b_start >= beat_duration_target and len(b_words) >= 4) or w_idx >= total_words:
                break

        last_raw_end = words[w_idx - 1]["end"] if w_idx > 0 else raw_start + 3000
        b_end = last_raw_end / 1000.0 if is_ms else float(last_raw_end)
        text_chunk = " ".join(b_words).lower()

        # Judicious placement: beat 0 = the Veo hook (or first video clip), the 50% mark = the
        # Veo turn clip, everything else is topical matching against real project assets.
        if beat_idx == 0 and veo_clips:
            chosen, query = veo_clips[0], "Veo Cinematic Hook"
        elif beat_idx == 0 and video_stills:
            chosen, query = video_stills[0], "Opening Motion Hook"
        elif not turn_used and len(veo_clips) > 1 and beat_idx >= turn_beat:
            chosen, query = veo_clips[1], "Veo Cinematic Turn"
            turn_used = True
        else:
            chosen, query = pick_asset(text_chunk, assets, [b["image"] for b in beats[-2:]])

        # Ken burns motion variations
        moves = ["in", "out", "left", "right"]
        move = moves[len(beats) % len(moves)]

        beats.append({
            "beat_index": len(beats),
            "start_s": round(b_start, 2),
            "end_s": round(b_end, 2),
            "duration_s": round(b_end - b_start, 2),
            "query": query,
            "image": chosen,
            "text": " ".join(b_words),
            "move": move,
        })

    # Beats must be CONTIGUOUS: build_longform concatenates segments END TO END (it ignores
    # start_s), so a plan that only covers the spoken words (pauses left as gaps) renders
    # SHORTER than the narration and -shortest then truncates the tail — measured 610.1s of
    # 633.8s audio on re-agent-commission. Absorb each pause into the preceding beat and
    # extend the final beat to the end of the voiceover.
    audio = work / "audio" / "voiceover.mp3"
    audio_dur = None
    if audio.exists():
        try:
            r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                "-of", "default=nw=1:nk=1", str(audio)],
                               capture_output=True, text=True)
            audio_dur = float(r.stdout.strip())
        except (ValueError, OSError):
            pass
    for i in range(len(beats)):
        if i + 1 < len(beats):
            beats[i]["end_s"] = beats[i + 1]["start_s"]
        elif audio_dur:
            beats[i]["end_s"] = audio_dur
        beats[i]["duration_s"] = round(beats[i]["end_s"] - beats[i]["start_s"], 2)

    beats_data = {
        "output": {
            "w": 1920,
            "h": 1080,
            "fps": 30,
            "out": f"output/{project_dir.name}-MASTER.mp4",
        },
        "audio": "work/audio/voiceover.mp3",
        "project": project_dir.name,
        "total_beats": len(beats),
        "runtime_s": round((words[-1]["end"] / 1000.0) if is_ms else words[-1]["end"], 2) if words else 0.0,
        "beats": beats,
    }
    beats_path = work / "beats.json"
    beats_path.write_text(json.dumps(beats_data, indent=2), encoding="utf-8")
    print(f"Generated {len(beats)} dense, context-synchronized visual beats -> {beats_path}")
    return beats_data


def audit_visual_density(project_dir: Path) -> dict:
    beats_path = project_dir / "work" / "beats.json"
    if not beats_path.exists():
        return {"pass": False, "error": "Missing beats.json"}

    data = json.loads(beats_path.read_text(encoding="utf-8"))
    beats = data.get("beats", [])
    if not beats:
        return {"pass": False, "error": "Empty beats.json"}

    max_consec = 1
    cur_consec = 1
    for i in range(1, len(beats)):
        if beats[i]["image"] == beats[i-1]["image"]:
            cur_consec += 1
            max_consec = max(max_consec, cur_consec)
        else:
            cur_consec = 1

    unique_images = set(b["image"] for b in beats)
    ratio = len(unique_images) / len(beats)

    # Check existence on disk
    missing = []
    for b in beats:
        fp = project_dir / b["image"] if not Path(b["image"]).is_absolute() else Path(b["image"])
        if not fp.exists():
            missing.append(str(fp))

    passed = (max_consec <= 2) and (len(unique_images) >= 10) and (len(missing) == 0)

    report = {
        "pass": passed,
        "total_beats": len(beats),
        "unique_assets": len(unique_images),
        "unique_ratio": round(ratio, 3),
        "max_consecutive_same_asset": max_consec,
        "missing_files": list(set(missing)),
    }
    print(json.dumps(report, indent=2))
    return report


def main():
    parser = argparse.ArgumentParser(description="Visual Director - High Density Visual Synthesis")
    sub = parser.add_subparsers(dest="cmd")

    p_plan = sub.add_parser("plan")
    p_plan.add_argument("project")

    p_gen = sub.add_parser("generate-assets")
    p_gen.add_argument("project")

    p_audit = sub.add_parser("audit")
    p_audit.add_argument("project")

    args = parser.parse_args()
    if args.cmd == "plan":
        plan_dense_beats(Path(args.project))
    elif args.cmd == "generate-assets":
        synthesize_project_assets(Path(args.project))
    elif args.cmd == "audit":
        audit_visual_density(Path(args.project))


if __name__ == "__main__":
    main()
