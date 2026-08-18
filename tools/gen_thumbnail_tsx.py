#!/usr/bin/env python3
"""gen_thumbnail_tsx.py — render a YouTube thumbnail with Remotion (the FREE, $0 path).

The Gemini image path (tools/gen_thumbnail.py) needs image billing, which is off. This renders a
LOUD thumbnail entirely in code: it bakes a concept into a tiny Remotion shot that uses the reviewed
remotion/src/lib/thumbnail.tsx component, renders a still at 2560x1440, and writes the YouTube-spec
JPG. Deterministic and reproducible — re-run with the same args for the same image.

THE DEFAULT IS A PHOTO. Rewritten 2026-08-03: every high-multiplier thumbnail in this repo's own
outlier data (docs/research/*-viral.json) is a real photograph with 2-4 black-outlined caps words
over it. A text-on-dark-gradient card is what we shipped for re-closing-costs and the channel owner
said he would scroll past it, so `--variant word` now requires --allow-textonly and prints why.
Get a photo first: `python tools/fetch_stock.py videos/<slug> --queries "..." --provider pexels`.

Variants:
  photo   (DEFAULT) full-bleed photograph + directional scrim + giant two-tone stroked hook
  versus  two photos side by side — before/after, "$0 vs 3%", any contrast-driven concept
  split   text column + a framed real screenshot (evidence-forward)
  bleed   alias of photo (kept so old sidecars still render)
  word    NO-PHOTO FALLBACK ONLY — a saturated color block, gated behind --allow-textonly

Usage:
  # default: a real photo, two-tone hook, corner badge
  python tools/gen_thumbnail_tsx.py --id VidNThumbA \
      --headline "COSTS FELL" --emphasis "EXCEPT HERE" --badge "+4.5%" --accent pop \
      --image projects/video-N/stock/house.jpg \
      --arrow downright --arrow-at 62 46 \
      --out videos/video-N/packaging/thumbs/A.png --jpg

  # value contrast
  python tools/gen_thumbnail_tsx.py --id VidNThumbB --variant versus \
      --headline "SAME SALE. DIFFERENT BILL." \
      --image a.jpg --image2 b.jpg \
      --value-a "$0" --label-a "16 STATES" --value-b "3%" --label-b "DELAWARE" \
      --out videos/video-N/packaging/thumbs/B.png --jpg

--image / --image2 take a media/-relative path (same convention as EvidenceFrame's `image` prop) or
any repo path / absolute file — anything outside media/ is copied into media/thumbs/ automatically.
Accent: pop|lime|cyan|orange|hot|violet|mint|red (loud, preferred) or the muted brand names
accent|accent2|signal|warn|danger, or a hex value.
"""
import argparse
import json
import os
import re
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REMOTION = os.path.join(ROOT, "remotion")
MEDIA = os.path.join(ROOT, "media")


def rel(path):
    try:
        return os.path.relpath(path, ROOT)
    except ValueError:
        return path


def safe_id(raw: str) -> str:
    s = re.sub(r"[^A-Za-z0-9]", "", raw)
    if not s or not s[0].isalpha():
        s = "Thumb" + s
    return s


def media_rel(image: str) -> str:
    """Return a media/-relative posix path for staticFile().

    staticFile() can only reach files under media/, so anything living elsewhere (stock fetched into
    videos/<slug>/work/images, a screenshot on the desktop) is COPIED into media/thumbs/ rather than
    silently turned into a ../ path that fails at render time.
    """
    if not image:
        return image
    cand = image
    if not os.path.isabs(cand):
        # already media-relative? (e.g. projects/x/evidence/y.png) -> trust it
        if os.path.exists(os.path.join(MEDIA, cand)):
            return cand.replace("\\", "/")
        cand = os.path.join(ROOT, image)
    if not os.path.exists(cand):
        return image.replace("\\", "/")  # pass through; render will error loudly if wrong
    cand = os.path.abspath(cand)
    media_abs = os.path.abspath(MEDIA)
    if os.path.commonpath([cand, media_abs]) == media_abs:
        return os.path.relpath(cand, media_abs).replace("\\", "/")
    dest_dir = os.path.join(MEDIA, "thumbs")
    os.makedirs(dest_dir, exist_ok=True)
    dest = os.path.join(dest_dir, os.path.basename(cand))
    if os.path.abspath(dest) != cand:
        shutil.copy2(cand, dest)
        print(f"  copied {rel(cand)} -> {rel(dest)} (staticFile only reaches media/)")
    return "thumbs/" + os.path.basename(cand)


def to_youtube_jpg(png_path, jpg_path, max_bytes=2_000_000, min_w=1280):
    from PIL import Image
    im = Image.open(png_path).convert("RGB")
    if im.width < min_w:
        print(f"  ! render is only {im.width}px wide (<{min_w}); YouTube min not met")
    q = 95
    for q in (95, 90, 85, 80, 72):
        im.save(jpg_path, "JPEG", quality=q, optimize=True, progressive=True)
        if os.path.getsize(jpg_path) <= max_bytes:
            break
    kb = os.path.getsize(jpg_path) // 1024
    print(f"  jpg  -> {rel(jpg_path)}  ({im.width}x{im.height}, q{q}, {kb}KB)")


def write_shot_tsx(shot_path: str, cid: str, props: dict) -> None:
    os.makedirs(os.path.dirname(shot_path), exist_ok=True)
    # depth of shot file under src/ decides the lib import path: src/shots/<group>/<id>.tsx -> ../../lib
    src_dir = os.path.join(REMOTION, "src")
    depth = os.path.relpath(os.path.dirname(shot_path), src_dir).count(os.sep) + 1
    lib_import = "../" * depth + "lib/thumbnail"
    props_js = json.dumps({k: v for k, v in props.items() if v is not None}, ensure_ascii=False)
    tsx = f"""// AUTO-GENERATED thumbnail shot (tools/gen_thumbnail_tsx.py). Safe to re-generate.
import React from 'react';
import {{ Thumbnail, type ThumbnailProps }} from '{lib_import}';

export const compositionConfig = {{
  id: '{cid}',
  durationInSeconds: 1,
  fps: 30,
  width: 1280,
  height: 720,
}};

const props: ThumbnailProps = {props_js};

export default function {cid}(): React.ReactElement {{
  return <Thumbnail {{...props}} />;
}}
"""
    with open(shot_path, "w", encoding="utf-8") as f:
        f.write(tsx)


def run_node(args: list[str]) -> None:
    r = subprocess.run(["node", *args], cwd=REMOTION, stdout=subprocess.PIPE,
                       stderr=subprocess.STDOUT, text=True)
    if r.returncode != 0:
        sys.exit(f"render failed:\n{r.stdout[-2500:]}")
    # surface the last few lines so the user sees the still path
    tail = "\n".join(l for l in r.stdout.splitlines() if l.strip())[-800:]
    print(tail)


def main() -> None:
    ap = argparse.ArgumentParser(description="Render a YouTube thumbnail with Remotion (free, $0)")
    ap.add_argument("--id", required=True, help="composition id (unique; sanitized to A-Za-z0-9)")
    ap.add_argument("--headline", required=True,
                    help="the giant hook (1-3 words, ALL CAPS). In --variant versus this is the top band.")
    ap.add_argument("--emphasis", help="second hook line, rendered in the accent color (two-tone device)")
    ap.add_argument("--kicker", help="small eyebrow pill above the hook")
    ap.add_argument("--sub", help="small support line under the hook")
    ap.add_argument("--badge", help="1-3 word corner badge, opposite the text column")
    ap.add_argument("--accent", default="pop",
                    help="pop|lime|cyan|orange|hot|violet|mint|red (loud, preferred) | "
                         "accent|accent2|signal|warn|danger (muted brand) | hex")
    ap.add_argument("--variant", default="photo", choices=["photo", "versus", "split", "bleed", "word"])
    ap.add_argument("--image", help="image path (media/-relative, repo-relative or absolute)")
    ap.add_argument("--image2", help="second image — the right half of --variant versus")
    ap.add_argument("--label-a", dest="label_a", help="versus: small pill under the left value")
    ap.add_argument("--label-b", dest="label_b", help="versus: small pill under the right value")
    ap.add_argument("--value-a", dest="value_a", help="versus: giant left value")
    ap.add_argument("--value-b", dest="value_b", help="versus: giant right value")
    ap.add_argument("--arrow", choices=["left", "right", "up", "down",
                                        "downleft", "downright", "upleft", "upright"],
                    help="one chunky block arrow (vidIQ 2026: 1-2 directional cues max)")
    ap.add_argument("--arrow-at", dest="arrow_at", nargs=2, type=float, metavar=("XPCT", "YPCT"),
                    help="where the arrow TIP lands, as a percent of the frame")
    ap.add_argument("--circle-at", dest="circle_at", nargs=4, type=float,
                    metavar=("XPCT", "YPCT", "WPCT", "HPCT"), help="hand-drawn ellipse callout")
    ap.add_argument("--align", default="left", choices=["left", "right"],
                    help="which side the text column sits on (default left, matching the winners)")
    ap.add_argument("--pos", default="center", choices=["top", "center", "bottom"])
    ap.add_argument("--focus", default="50% 50%", help="photo objectPosition, e.g. '50 pct 30 pct'")
    ap.add_argument("--punch", type=float, default=1.0,
                    help="photo saturation/contrast boost multiplier (default 1.0; 0 = untouched)")
    ap.add_argument("--allow-textonly", dest="allow_textonly", action="store_true",
                    help="permit --variant word (text on a flat block, no photo). Only when no usable "
                         "photo exists — never as one of the 3 A/B/C bets if stock is reachable.")
    ap.add_argument("--group", default="thumbnails", help="src/shots/<group>/ subfolder")
    ap.add_argument("--out", required=True, help="output .png path (e.g. videos/video-N/packaging/thumbs/A.png)")
    ap.add_argument("--jpg", action="store_true", help="also write the YouTube-spec JPG (<2MB)")
    ap.add_argument("--wordmark", action="store_true",
                    help="show the brand wordmark badge (default OFF — a tool must not stamp itself "
                         "on client work; also renders nothing unless BRAND.wordmark is set)")
    ap.add_argument("--face", help="media/-relative path to the channel host's photo - renders as a "
                                    "circular bug (vidIQ: 89%% of breakouts used a face). Pair with "
                                    "--arrow/--arrow-at pointed at the subject so the host reads as "
                                    "directing attention to it, not just decorating the corner.")
    ap.add_argument("--face-at", dest="face_at", nargs="+", type=float,
                    metavar="XPCT [YPCT] SIZEPCT",
                    help="circle mode (default): XPCT YPCT SIZEPCT - center + diameter as percent of "
                         "frame. --face-cutout mode: XPCT SIZEPCT only (bottom-anchored, no Y). "
                         "Default (unset): bottom corner, clear of the text column and opposite badge.")
    ap.add_argument("--face-focus", dest="face_focus", default=None,
                    help="objectPosition for the face crop, e.g. '50 pct 20 pct' to bias toward the eyes")
    ap.add_argument("--face-cutout", dest="face_cutout", action="store_true",
                    help="--face is already a background-removed transparent PNG (e.g. via rembg) - "
                         "render large and un-circled, integrated directly into the scene, instead of "
                         "the small circular bug. --face-at becomes [x pct, size pct] (bottom-anchored).")
    args = ap.parse_args()

    cid = safe_id(args.id)
    if args.variant in ("photo", "bleed", "split") and not args.image:
        sys.exit(f"--variant {args.variant} needs --image.\n"
                 f"  Fetch one free: venv/Scripts/python tools/fetch_stock.py videos/<slug> "
                 f"--queries \"...\" --provider pexels   (lands in videos/<slug>/work/images/)")
    if args.variant == "versus" and not (args.image and args.image2):
        sys.exit("--variant versus needs --image AND --image2 (the two sides of the contrast)")
    if args.variant == "word" and not args.allow_textonly:
        sys.exit(
            "REFUSED: --variant word renders text on a flat block with no photograph.\n"
            "  Every high-multiplier thumbnail in docs/research/*-viral.json is a real photo with\n"
            "  outlined caps over it, and a text-only card is the exact failure the channel owner\n"
            "  rejected on re-closing-costs (2026-08-02).\n"
            "  Do this instead:\n"
            "    venv/Scripts/python tools/fetch_stock.py videos/<slug> --queries \"...\" --provider pexels\n"
            "    ...then --variant photo --image videos/<slug>/work/images/<file>.jpg\n"
            "  If a photo genuinely cannot be sourced, re-run with --allow-textonly and say so in the\n"
            "  packaging notes. Never ship more than one text-only card across the 3 A/B/C bets."
        )

    props = {
        "headline": args.headline,
        "emphasis": args.emphasis,
        "kicker": args.kicker,
        "sub": args.sub,
        "badge": args.badge,
        "accent": args.accent,
        "variant": args.variant,
        "image": media_rel(args.image) if args.image else None,
        "image2": media_rel(args.image2) if args.image2 else None,
        "labelA": args.label_a,
        "labelB": args.label_b,
        "valueA": args.value_a,
        "valueB": args.value_b,
        "arrow": args.arrow,
        "arrowAt": args.arrow_at,
        "circleAt": args.circle_at,
        "align": args.align,
        "pos": args.pos,
        "focus": args.focus,
        "punch": args.punch,
        "wordmark": bool(args.wordmark),
        "face": media_rel(args.face) if args.face else None,
        "faceAt": args.face_at,
        "faceFocus": args.face_focus,
        "faceCutout": bool(args.face_cutout),
    }

    shot_path = os.path.join(REMOTION, "src", "shots", args.group, f"{cid}.tsx")
    write_shot_tsx(shot_path, cid, props)
    print(f"shot -> {rel(shot_path)}  (variant={args.variant}, accent={args.accent})")

    print("rendering still (2560x1440)...")
    run_node(["scripts/gen-registry.mjs"])
    run_node(["scripts/render-all.mjs", "--still", cid])

    still = os.path.join(REMOTION, "out", f"{cid}.png")
    if not os.path.exists(still):
        sys.exit(f"expected still not found at {rel(still)} — check the render output above")

    out = args.out if os.path.isabs(args.out) else os.path.join(ROOT, args.out)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    shutil.copy2(still, out)
    print(f"  png  -> {rel(out)}")

    sidecar = os.path.splitext(out)[0] + ".json"
    with open(sidecar, "w", encoding="utf-8") as f:
        json.dump({"engine": "remotion-still", "composition": cid, "props": props,
                   "shot": rel(shot_path)}, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"  meta -> {rel(sidecar)}")

    if args.jpg:
        to_youtube_jpg(out, os.path.splitext(out)[0] + ".jpg")


if __name__ == "__main__":
    main()
