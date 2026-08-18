#!/usr/bin/env python3
"""
viral_packaging_engine.py — 1M-View YouTube Packaging & 90+ CTR Probability Scoring Engine.

Automates viral ideation, divergent multi-archetype brainstorming, objective 100-point
CTR probability evaluation, and high-impact thumbnail rendering.

Archetypes Explored:
  1. Extreme Metaphor & Superhuman Speed ("The Flash", "Fastest AI Ever Built", "Instant Latency")
  2. Threat / Industry Shock / Obsolescence ("OpenAI Is Cooked", "Google Just Broke Coding")
  3. The Glitch / The Catch / Unfair Advantage ("50% Price Cut But There's A Catch", "The Pricing Glitch")
  4. David vs Goliath Benchmark Destruction ("65% SWE-Bench for $0.75", "RIP Claude 3.5 Sonnet?")
  5. Urgent Direct Command / Curiosity Hook ("Do NOT Code Until You Watch This", "Why Everyone Is Switching")

100-Point CTR Probability Rubric:
  - Curiosity Gap (25 pts): Unresolved tension, incomplete loop, high intrigue.
  - Emotional Stakes & Disruption (20 pts): Extreme speed, savings, fear of obsolescence.
  - Mobile Glanceability / Readability (20 pts): Title <= 55 chars, Thumbnail <= 4 bold words, high contrast.
  - Visual Metaphor & Graphic Hook (15 pts): Striking visual anchor (e.g. Flash lightning, battle split, glowing gauge).
  - Title-Thumbnail Synergy (10 pts): Thumbnail complements and amplifies title without duplicating words.
  - Entity Velocity (10 pts): High-search trend anchors (Gemini, Claude, DeepMind).

Hard Rule: Must score >= 90/100 to pass. If below 90, iterative optimization runs until 90+ is reached.

Usage:
  python tools/viral_packaging_engine.py brainstorm videos/gemini-3-7-release
  python tools/viral_packaging_engine.py evaluate --title "..." --thumb-text "..." --concept "..."
  python tools/viral_packaging_engine.py optimize videos/gemini-3-7-release --min-score 90
  python tools/viral_packaging_engine.py render videos/gemini-3-7-release --candidate-index 0
"""
import argparse
import json
import os
import re
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parent.parent

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")


ARCHETYPES = [
    {
        "id": "superhuman-speed",
        "name": "Superhuman Speed / The Superhero Metaphor",
        "title_templates": [
            "This AI is So Fast It Feels Like Cheating ({entity})",
            "The Fastest AI on Earth Just Changed Everything ({entity})",
            "This is Insane: Google's New Flash AI is Literally The Flash",
            "{entity}: The Speed is Unbelievable (Coding Speedrun)",
        ],
        "thumb_text_options": ["TOO FAST", "0.1s LATENCY", "INSANE SPEED", "THE FLASH AI"],
        "accent": "cyan",
        "visual_concept": "Superhero lightning aura around {entity} logo with glowing speed meter and comparison badge",
    },
    {
        "id": "industry-threat",
        "name": "Industry Threat / Competitor Shock",
        "title_templates": [
            "Google Just Ended Claude 3.5 Sonnet ({entity})",
            "OpenAI Did Not Expect This... ({entity} Coding Test)",
            "RIP Claude? Google's New Model Just Destroyed Coding Benchmarks",
            "Why Developers Are Abandoning Their AI Models for {entity}",
        ],
        "thumb_text_options": ["IT'S OVER", "OPENAI PANICS", "65% CODING", "CLAUDE DESTROYED"],
        "accent": "red",
        "visual_concept": "Side-by-side battle split: Claude/OpenAI cracked logo vs glowing {entity} with 65.3% badge",
    },
    {
        "id": "the-catch-glitch",
        "name": "The Unfair Advantage / The Catch",
        "title_templates": [
            "Google's 50% Price Cut Has a Massive Catch ({entity})",
            "They Built the Best Coding Model... Then Hid This Fine Print",
            "Why {entity} is Half the Price (Until 2027)",
            "The $0.75 Coding AI: What Google Isn't Telling You",
        ],
        "thumb_text_options": ["HALF PRICE", "THE CATCH", "50% OFF", "DON'T MISS THIS"],
        "accent": "amber",
        "visual_concept": "Bright yellow price cut badge with bold red warning tape 'WARNING: 2027 TRAP' and official invoice",
    },
    {
        "id": "benchmark-destruction",
        "name": "David vs Goliath Benchmark Destruction",
        "title_templates": [
            "65.3% on SWE-Bench for $0.75?! Google Just Broke AI",
            "The New Coding King is Here: {entity} Benchmark Deep Dive",
            "This 65% SWE-Bench Score Makes Zero Sense ({entity})",
            "How {entity} Beats Models 10x Its Size on SWE-Bench",
        ],
        "thumb_text_options": ["65.3% SWE-BENCH", "NEW #1 CODING", "BENCHMARK SMASH", "RECORD BROKEN"],
        "accent": "green",
        "visual_concept": "Exploding benchmark bar chart where {entity} blows past Sonnet and GPT-4o with glowing green numbers",
    },
    {
        "id": "urgent-command",
        "name": "Urgent Command / Warning Hook",
        "title_templates": [
            "Do NOT Code Another Line Until You See {entity}",
            "Stop Using Claude 3.5 Sonnet Immediately ({entity})",
            "Watch This Before Building With {entity}",
            "Every Software Engineer Needs to See This New Model",
        ],
        "thumb_text_options": ["STOP CODING", "WATCH FIRST", "DON'T USE CLAUDE", "MUST SEE"],
        "accent": "red",
        "visual_concept": "High contrast caution frame, glowing syntax-highlighted code editor executing complex bugfix in 2 seconds",
    },
]


def score_concept(title: str, thumb_text: str, visual_concept: str, topic_keywords: list) -> dict:
    """
    Evaluates a title + thumbnail concept across 6 weighted dimensions.
    Returns individual dimension scores and an aggregate 0-100 CTR Probability Score.
    """
    # 1. Curiosity Gap (max 25)
    c_score = 0
    curiosity_patterns = [
        r"\b(why|how|what|secret|catch|hidden|trick|glitch|trap|warning|before you|insane|cheating|literally)\b",
        r"\b(feels like|didn'?t expect|not telling|never seen|nobody noticed)\b",
        r"\.\.\.|\?!|\?",
    ]
    for p in curiosity_patterns:
        if re.search(p, title, re.I) or re.search(p, visual_concept, re.I):
            c_score += 8
    if any(w in thumb_text.upper() for w in ["THE CATCH", "WARNING", "STOP", "OVER", "TOO FAST", "INSANE"]):
        c_score += 7
    c_score = min(25, max(12, c_score))

    # 2. Emotional Stakes & Disruption (max 20)
    s_score = 0
    stakes_patterns = [
        r"\b(fastest|destroyed|ended|broken|game over|rip|cheating|zero sense|panics|50%|half price|\$0\.)\b",
        r"\b(speed|coding|benchmarks|earth|world|million|thousands)\b",
    ]
    for p in stakes_patterns:
        if re.search(p, title, re.I) or re.search(p, thumb_text, re.I):
            s_score += 10
    s_score = min(20, max(10, s_score))

    # 3. Mobile Glanceability / Readability (max 20)
    g_score = 20
    t_words = len(thumb_text.split())
    if t_words > 4:
        g_score -= (t_words - 4) * 4
    if len(title) > 65:
        g_score -= int((len(title) - 65) / 2)
    elif len(title) < 30:
        g_score -= 3
    g_score = max(5, g_score)

    # 4. Visual Metaphor & Graphic Hook (max 15)
    v_score = 0
    visual_metaphors = ["lightning", "superhero", "battle", "split", "exploding", "chart", "glowing", "meter", "trap"]
    for m in visual_metaphors:
        if m in visual_concept.lower():
            v_score += 5
    v_score = min(15, max(8, v_score))

    # 5. Title-Thumbnail Synergy (max 10)
    # Penalize word-for-word duplication between title and thumbnail text
    syn_score = 10
    t_set = set(re.findall(r"\w+", title.lower()))
    th_set = set(re.findall(r"\w+", thumb_text.lower()))
    overlap = t_set.intersection(th_set) - {"ai", "the", "a", "is", "for", "to", "in", "new"}
    if len(overlap) >= 3:
        syn_score -= 5
    elif len(overlap) == 0:
        syn_score += 0 # complementary
    syn_score = max(4, syn_score)

    # 6. Entity Velocity (max 10)
    e_score = 0
    for kw in topic_keywords:
        if kw.lower() in title.lower() or kw.lower() in visual_concept.lower():
            e_score += 5
    e_score = min(10, max(5, e_score))

    total = c_score + s_score + g_score + v_score + syn_score + e_score

    return {
        "total_score": total,
        "breakdown": {
            "curiosity_gap": c_score,
            "emotional_stakes": s_score,
            "glanceability": g_score,
            "visual_metaphor": v_score,
            "title_thumb_synergy": syn_score,
            "entity_velocity": e_score,
        },
        "pass_90": total >= 90,
    }


def humanize(slug: str) -> str:
    """'gemini-3-7-release' -> 'Gemini 3.7 Release' — a readable default entity name."""
    return re.sub(r"[_-]+", " ", slug).strip().title() or slug


def default_keywords(entity: str) -> list:
    return [entity, "AI", "Model", "Coding", "Benchmark", "Speed", "Price"]


def find_evidence_dir(proj_dir: Path) -> Path:
    """Where real evidence images for this project live (media/projects/<slug>/evidence is the
    canonical spot; videos/<slug>/work/images is the older home). First that exists wins."""
    name = proj_dir.name
    for cand in (ROOT / "media" / "projects" / name / "evidence",
                 ROOT / "media" / "projects" / name,
                 proj_dir / "work" / "images"):
        if cand.is_dir() and (any(cand.glob("*.png")) or any(cand.glob("*.jpg"))):
            return cand
    return ROOT / "media" / "projects" / name / "evidence"


def brainstorm(project_dir: Path, entity: str = None, keywords: list = None) -> list:
    if entity is None:
        entity = humanize(project_dir.name)
    if keywords is None:
        keywords = default_keywords(entity)

    results = []
    for arch in ARCHETYPES:
        for t_tmpl in arch["title_templates"]:
            title = t_tmpl.format(entity=entity)
            for th_text in arch["thumb_text_options"]:
                vis = arch["visual_concept"].format(entity=entity)
                evaluation = score_concept(title, th_text, vis, keywords)
                results.append({
                    "archetype": arch["id"],
                    "archetype_name": arch["name"],
                    "title": title,
                    "thumb_text": th_text,
                    "accent": arch["accent"],
                    "visual_concept": vis,
                    "evaluation": evaluation,
                })

    results.sort(key=lambda x: x["evaluation"]["total_score"], reverse=True)
    return results


def render_viral_thumbnail(project_dir: Path, candidate: dict, out_path: Path):
    """
    Renders a 1280x720 cinematic, high-contrast, clickable thumbnail.
    """
    out_path.parent.mkdir(parents=True, exist_ok=True)
    w, h = 1280, 720
    im = Image.new("RGB", (w, h), (10, 14, 20))
    draw = ImageDraw.Draw(im)

    # Gradient backdrop
    for y in range(h):
        ratio = y / h
        r = int(10 + ratio * 15)
        g = int(14 + ratio * 20)
        b = int(20 + ratio * 45)
        draw.line([(0, y), (w, y)], fill=(r, g, b))

    # Font loader helper
    def get_font(size, bold=True):
        candidates = ["arialbd.ttf", "segoeuib.ttf", "DejaVuSans-Bold.ttf", "impact.ttf", "Helvetica-Bold.ttf"]
        for c in candidates:
            try:
                return ImageFont.truetype(c, size)
            except:
                pass
        return ImageFont.load_default()

    font_huge = get_font(96, bold=True)
    font_sub = get_font(64, bold=True)
    font_badge = get_font(34, bold=True)

    accent_colors = {
        "cyan": (56, 189, 248),
        "amber": (251, 191, 36),
        "red": (248, 113, 113),
        "green": (74, 222, 128),
    }
    accent_rgb = accent_colors.get(candidate.get("accent", "cyan"), (56, 189, 248))

    # Evidence preview on the right
    ev_dir = find_evidence_dir(project_dir)
    ev_candidates = sorted(list(ev_dir.glob("*.png"))) + sorted(list(ev_dir.glob("*.jpg")))
    if ev_candidates:
        ev_img = Image.open(ev_candidates[0]).convert("RGB")
        target_w, target_h = 560, 480
        ev_img.thumbnail((target_w, target_h), Image.Resampling.LANCZOS)
        ev_x, ev_y = 670, 120
        # Card glow border
        draw.rectangle([(ev_x - 12, ev_y - 12), (ev_x + ev_img.width + 12, ev_y + ev_img.height + 12)],
                       fill=(22, 27, 34), outline=accent_rgb, width=4)
        im.paste(ev_img, (ev_x, ev_y))

    # Top Tag
    entity_label = humanize(project_dir.name).upper()
    badge_text = f"⚡ {entity_label}" if candidate["archetype"] == "superhuman-speed" else "🔥 BREAKING NEWS"
    draw.rounded_rectangle([(60, 60), (450, 115)], radius=10, fill=accent_rgb)
    draw.text((80, 70), badge_text[:24], font=font_badge, fill=(10, 14, 20))

    # Main Thumb Hook Lines
    th_text = candidate["thumb_text"]
    draw.text((60, 160), entity_label[:14], font=font_huge, fill=(255, 255, 255))
    draw.text((60, 270), th_text, font=font_huge, fill=accent_rgb)

    # Sub Hook / Secondary Curiosity Anchor
    if candidate["archetype"] == "superhuman-speed":
        sub_text = "⚡ 10x FASTER"
        pill_fill = (56, 189, 248)
    elif candidate["archetype"] == "industry-threat":
        sub_text = "💀 MODEL DESTROYED"
        pill_fill = (239, 68, 68)
    elif candidate["archetype"] == "the-catch-glitch":
        sub_text = "⚠️ THE CATCH"
        pill_fill = (245, 158, 11)
    else:
        sub_text = "🏆 NEW #1 BENCHMARK"
        pill_fill = (34, 197, 94)

    draw.rounded_rectangle([(60, 420), (560, 510)], radius=14, fill=(30, 41, 59), outline=pill_fill, width=3)
    draw.text((85, 435), sub_text, font=font_sub, fill=pill_fill)

    # Bottom Contrast Trigger
    draw.text((60, 560), "THIS FEELS LIKE CHEATING.", font=get_font(38, bold=True), fill=(226, 232, 240))

    im.save(out_path.with_suffix(".png"), "PNG")
    im.save(out_path.with_suffix(".jpg"), "JPEG", quality=95)
    print(f"Rendered 90+ Viral Thumbnail -> {out_path.with_suffix('.jpg')} (Score: {candidate['evaluation']['total_score']}/100)")


def main():
    parser = argparse.ArgumentParser(description="1M-View Viral Packaging & Scoring Engine")
    sub = parser.add_subparsers(dest="cmd")

    p_brain = sub.add_parser("brainstorm")
    p_brain.add_argument("project", help="project directory")
    p_brain.add_argument("--min-score", type=int, default=90, help="minimum probability score")
    p_brain.add_argument("--entity", default=None,
                         help="the model/product name to hook on (default: derived from the project dir)")
    p_brain.add_argument("--keywords", default=None, help="comma list of search-trend anchors for scoring")

    p_eval = sub.add_parser("evaluate")
    p_eval.add_argument("--title", required=True)
    p_eval.add_argument("--thumb-text", required=True)
    p_eval.add_argument("--concept", default="")
    p_eval.add_argument("--keywords", default=None, help="comma list of search-trend anchors")

    p_opt = sub.add_parser("optimize")
    p_opt.add_argument("project", help="project directory")
    p_opt.add_argument("--min-score", type=int, default=90, help="minimum probability score")
    p_opt.add_argument("--entity", default=None)
    p_opt.add_argument("--keywords", default=None, help="comma list of search-trend anchors")
    p_opt.add_argument("--rounds", type=int, default=3,
                       help="re-rolls with rotated title templates until >= min-score (default 3)")

    p_render = sub.add_parser("render")
    p_render.add_argument("project")
    p_render.add_argument("--candidate-index", type=int, default=0)
    p_render.add_argument("--out", default=None)
    p_render.add_argument("--entity", default=None)
    p_render.add_argument("--keywords", default=None)

    args = parser.parse_args()

    def kw_list(raw):
        return [k.strip() for k in raw.split(",") if k.strip()] if raw else None

    if args.cmd == "brainstorm":
        proj_dir = Path(args.project)
        results = brainstorm(proj_dir, entity=args.entity, keywords=kw_list(args.keywords))
        qualifying = [r for r in results if r["evaluation"]["total_score"] >= args.min_score]
        
        print(f"\n================================================================================")
        print(f" VIRAL PACKAGING ENGINE: 1M-VIEW CANDIDATE AUDIT (Min Score: {args.min_score}/100)")
        print(f"================================================================================\n")
        print(f"Generated {len(results)} concepts across 5 viral archetypes.")
        print(f"Found {len(qualifying)} candidates scoring >= {args.min_score}/100:\n")

        for idx, cand in enumerate(qualifying[:8]):
            ev = cand["evaluation"]
            print(f"[{idx + 1}] SCORE: {ev['total_score']}/100  |  ARCHETYPE: {cand['archetype_name']}")
            print(f"    TITLE      : \"{cand['title']}\" ({len(cand['title'])} chars)")
            print(f"    THUMB TEXT : \"{cand['thumb_text']}\" (Accent: {cand['accent']})")
            print(f"    VISUAL     : {cand['visual_concept']}")
            print(f"    BREAKDOWN  : Curiosity={ev['breakdown']['curiosity_gap']}/25, Stakes={ev['breakdown']['emotional_stakes']}/20, "
                  f"Glance={ev['breakdown']['glanceability']}/20, Visual={ev['breakdown']['visual_metaphor']}/15, "
                  f"Synergy={ev['breakdown']['title_thumb_synergy']}/10, Entity={ev['breakdown']['entity_velocity']}/10\n")

        # Save candidates to packaging/candidates.json
        cand_path = proj_dir / "packaging" / "candidates.json"
        cand_path.parent.mkdir(parents=True, exist_ok=True)
        cand_path.write_text(json.dumps(results[:15], indent=2), encoding="utf-8")
        print(f"Saved top candidates to {cand_path}")

    elif args.cmd == "evaluate":
        ev = score_concept(args.title, args.thumb_text, args.concept,
                           kw_list(args.keywords) or default_keywords("AI"))
        print(json.dumps(ev, indent=2))

    elif args.cmd == "optimize":
        proj_dir = Path(args.project)
        cand_path = proj_dir / "packaging" / "candidates.json"
        entity = args.entity or humanize(proj_dir.name)
        keywords = kw_list(args.keywords) or default_keywords(entity)
        best = None
        for round_i in range(max(1, args.rounds)):
            results = brainstorm(proj_dir, entity=entity, keywords=keywords)
            if round_i:
                # rotate the template order so later rounds surface different combinations
                for arch in ARCHETYPES:
                    arch["title_templates"] = arch["title_templates"][round_i:] + arch["title_templates"][:round_i]
            qualifying = [r for r in results if r["evaluation"]["total_score"] >= args.min_score]
            print(f"round {round_i + 1}: best {results[0]['evaluation']['total_score']}/100, "
                  f"{len(qualifying)} qualifying")
            if qualifying:
                best = qualifying[0]
                break
            if best is None or results[0]["evaluation"]["total_score"] > best["evaluation"]["total_score"]:
                best = results[0]
        cand_path.parent.mkdir(parents=True, exist_ok=True)
        cand_path.write_text(json.dumps(results[:15], indent=2), encoding="utf-8")
        print(f"\nBest candidate: {best['evaluation']['total_score']}/100")
        print(f"  TITLE: \"{best['title']}\"")
        print(f"  THUMB: \"{best['thumb_text']}\" (accent {best['accent']})")
        print(f"  Saved to {cand_path}")
        if best["evaluation"]["total_score"] < args.min_score:
            print(f"NOTE: no candidate reached {args.min_score}/100 after {args.rounds} rounds — "
                  "tune the entity/keywords or edit the archetype templates.")
            sys.exit(1)

    elif args.cmd == "render":
        proj_dir = Path(args.project)
        cand_path = proj_dir / "packaging" / "candidates.json"
        if not cand_path.exists():
            results = brainstorm(proj_dir, entity=args.entity, keywords=kw_list(args.keywords))
            cand_path.parent.mkdir(parents=True, exist_ok=True)
            cand_path.write_text(json.dumps(results[:15], indent=2), encoding="utf-8")
        candidates = json.loads(cand_path.read_text(encoding="utf-8"))
        chosen = candidates[args.candidate_index]
        out_file = Path(args.out) if args.out else proj_dir / "packaging" / "thumbs" / "viral_master.jpg"
        render_viral_thumbnail(proj_dir, chosen, out_file)


if __name__ == "__main__":
    main()
