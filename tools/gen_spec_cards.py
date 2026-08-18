#!/usr/bin/env python3
"""
gen_spec_cards.py — render branded STAT / COMPARE / QUOTE cards as stills for long-form beats.

Why this exists (found on robotics-2026-updates-1, 2026-07-30):
  A news-compilation script is mostly NUMBERS. Stock search cannot represent a number. Asked for
  "twenty implants" it returned a photo of an orange speed-limit sign reading 20; asked for
  "ten thousand unique parts" it returned a red poster of the numeral 10; asked for a timeline it
  returned the word TIMELINE in wooden letters. Every one is "on topic" and every one is unusable,
  which is exactly the failure EVOLUTION.md logs for Openverse and CLAUDE.md warns about generally.

  So facts stop going through stock search. They get RENDERED. This is a template (like
  build_longform.py), not per-beat authoring, so it scales to a 30-minute script.

Card types:
  stat     one big number + unit, a label, and a source footnote
  compare  two values side by side — built for the target-vs-actual contrast this channel needs
  quote    a pull quote + attribution (on-the-record statements)

Every card carries a `foot` (source + date). A card with a number and no source is the thing the
robotics-news honesty_guard exists to prevent, so `foot` is REQUIRED and the tool exits if missing.

Usage:
  python tools/gen_spec_cards.py videos/<slug> --spec videos/<slug>/work/cards.json
  python tools/gen_spec_cards.py videos/<slug> --spec ... --patch-beats   # swap into beats.json

Reads : <spec>.json  [{id, type, kicker, stat, unit, label, foot, match}]
Writes: <project>/work/cards/<id>.png   (+ optionally rewrites beats.json image paths)
"""
import argparse
import json
import os
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent

W, H = 1920, 1080

# Dark technical palette — matches niches/ai-news.json formats.compilation.images.style and brand.ts d900/warn.
BG = (13, 17, 23)
BG2 = (22, 27, 34)
LINE = (48, 54, 61)
INK = (201, 209, 217)
MUTED = (139, 148, 158)
ACCENT = (99, 102, 241)
WARN = (245, 215, 110)
SIGNAL = (77, 184, 168)
DANGER = (232, 135, 159)

ACCENTS = {"accent": ACCENT, "warn": WARN, "signal": SIGNAL, "danger": DANGER}

FONT_DIRS = [Path("C:/Windows/Fonts"), Path("/usr/share/fonts"), Path("/Library/Fonts")]
BOLD_CANDIDATES = ["segoeuib.ttf", "arialbd.ttf", "DejaVuSans-Bold.ttf", "Helvetica-Bold.ttf"]
REG_CANDIDATES = ["segoeui.ttf", "arial.ttf", "DejaVuSans.ttf", "Helvetica.ttf"]


def find_font(candidates):
    for d in FONT_DIRS:
        if not d.exists():
            continue
        for name in candidates:
            p = d / name
            if p.exists():
                return str(p)
        for name in candidates:
            hits = list(d.rglob(name))
            if hits:
                return str(hits[0])
    return None


BOLD_PATH = find_font(BOLD_CANDIDATES)
REG_PATH = find_font(REG_CANDIDATES)


def f(bold, size):
    path = BOLD_PATH if bold else REG_PATH
    if path:
        return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def tw(draw, text, font):
    b = draw.textbbox((0, 0), text, font=font)
    return b[2] - b[0], b[3] - b[1]


def wrap(draw, text, font, max_w):
    words, lines, cur = text.split(), [], ""
    for w_ in words:
        trial = (cur + " " + w_).strip()
        if tw(draw, trial, font)[0] <= max_w or not cur:
            cur = trial
        else:
            lines.append(cur)
            cur = w_
    if cur:
        lines.append(cur)
    return lines


def backdrop(d, accent):
    """Subtle vertical wash + technical grid + left accent rule."""
    for y in range(H):
        t = y / H
        c = tuple(int(BG[i] + (BG2[i] - BG[i]) * t) for i in range(3))
        d.line([(0, y), (W, y)], fill=c)
    for x in range(0, W, 80):
        d.line([(x, 0), (x, H)], fill=(LINE[0], LINE[1], LINE[2]), width=1)
    for y in range(0, H, 80):
        d.line([(0, y), (W, y)], fill=(LINE[0], LINE[1], LINE[2]), width=1)
    d.rectangle([0, 0, 12, H], fill=accent)


def draw_kicker(d, text, accent, x=140, y=150):
    if not text:
        return y
    font = f(True, 34)
    spaced = " ".join(text.upper())
    d.text((x, y), spaced, font=font, fill=accent)
    return y + 70


def draw_foot(d, text, accent):
    font = f(False, 30)
    d.line([(140, H - 165), (W - 140, H - 165)], fill=LINE, width=2)
    d.text((140, H - 130), text, font=font, fill=MUTED)
    d.ellipse([100, H - 122, 120, H - 102], fill=accent)


def card_stat(c, accent):
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    backdrop(d, accent)
    y = draw_kicker(d, c.get("kicker", ""), accent)

    stat = str(c["stat"])
    size = 300
    font = f(True, size)
    while tw(d, stat, font)[0] > W - 320 and size > 90:
        size -= 10
        font = f(True, size)
    d.text((140, y + 30), stat, font=font, fill=accent)
    yy = y + 30 + tw(d, stat, font)[1] + 80

    if c.get("unit"):
        uf = f(True, 62)
        d.text((140, yy), c["unit"], font=uf, fill=INK)
        yy += 100

    if c.get("label"):
        lf = f(False, 52)
        for ln in wrap(d, c["label"], lf, W - 320):
            d.text((140, yy), ln, font=lf, fill=MUTED)
            yy += 68

    draw_foot(d, c["foot"], accent)
    return img


def card_compare(c, accent):
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    backdrop(d, accent)
    y = draw_kicker(d, c.get("kicker", ""), accent)

    left, right = c["left"], c["right"]
    mid = W // 2
    d.line([(mid, y + 40), (mid, H - 230)], fill=LINE, width=3)

    for side, box_x, col in ((left, 140, SIGNAL), (right, mid + 80, DANGER)):
        col = ACCENTS.get(side.get("accent", ""), col)
        vf, size = None, 210
        vf = f(True, size)
        val = str(side["value"])
        while tw(d, val, vf)[0] > (mid - 240) and size > 70:
            size -= 8
            vf = f(True, size)
        yy = y + 90
        d.text((box_x, yy), val, font=vf, fill=col)
        yy += tw(d, val, vf)[1] + 60
        lf = f(False, 46)
        for ln in wrap(d, side.get("label", ""), lf, mid - 260):
            d.text((box_x, yy), ln, font=lf, fill=MUTED)
            yy += 60

    draw_foot(d, c["foot"], accent)
    return img


def card_quote(c, accent):
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    backdrop(d, accent)
    y = draw_kicker(d, c.get("kicker", ""), accent)

    qf = f(True, 84)
    d.text((140, y - 20), "\u201c", font=f(True, 200), fill=accent)
    yy = y + 130
    for ln in wrap(d, c["stat"], qf, W - 340):
        d.text((150, yy), ln, font=qf, fill=INK)
        yy += 112

    if c.get("label"):
        lf = f(False, 46)
        d.text((150, yy + 30), "\u2014 " + c["label"], font=lf, fill=accent)

    draw_foot(d, c["foot"], accent)
    return img


RENDERERS = {"stat": card_stat, "compare": card_compare, "quote": card_quote}


def main():
    ap = argparse.ArgumentParser(description="Render branded stat/compare/quote cards for beats")
    ap.add_argument("project")
    ap.add_argument("--spec", required=True, help="cards.json spec file")
    ap.add_argument("--patch-beats", action="store_true",
                    help="rewrite beats.json so matching image_query beats use the card")
    args = ap.parse_args()

    project = (ROOT / args.project) if not os.path.isabs(args.project) else Path(args.project)
    cards = json.loads(Path(args.spec).read_text(encoding="utf-8"))
    out_dir = project / "work" / "cards"
    out_dir.mkdir(parents=True, exist_ok=True)

    if not BOLD_PATH:
        print("  [warn] no TrueType font found — falling back to PIL default (small)")

    made = {}
    for c in cards:
        if not c.get("foot"):
            sys.exit(f"card '{c.get('id')}' has no `foot` — every rendered number needs its source")
        kind = c.get("type", "stat")
        accent = ACCENTS.get(c.get("accent", "accent"), ACCENT)
        img = RENDERERS[kind](c, accent)
        p = out_dir / f"{c['id']}.png"
        img.save(p)
        made[c["id"]] = (p, c.get("match", []))
        print(f"  {kind:8} {c['id']}")

    print(f"\n{len(made)} cards -> {out_dir.relative_to(ROOT)}")

    if args.patch_beats:
        bp = project / "work" / "beats.json"
        data = json.loads(bp.read_text(encoding="utf-8"))
        q2card = {}
        for cid, (p, matches) in made.items():
            for m in matches:
                q2card[m.strip().lower()] = p
        n = 0
        for b in data["beats"]:
            q = (b.get("image_query") or "").strip().lower()
            if q in q2card:
                rel = os.path.relpath(q2card[q], project).replace("\\", "/")
                b["image"] = rel
                b["is_card"] = True
                b["move"] = "none"   # a rendered card must not drift; text needs to sit still
                n += 1
        bp.write_text(json.dumps(data, indent=1), encoding="utf-8")
        print(f"patched {n} beats -> {bp.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
