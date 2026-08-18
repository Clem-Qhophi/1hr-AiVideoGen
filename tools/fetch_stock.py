#!/usr/bin/env python3
"""
fetch_stock.py — source free, COMMERCIALLY SAFE images for long-form beats.

Monetised YouTube makes image licensing a real liability, not a formality. This tool will not
hand you a file it cannot justify: every download records its licence, source URL and creator,
and anything that is non-commercial or share-alike is rejected by default.

  Openverse   keyless, works today, CC-licensed  -> filtered to `commercial,modification`
  Pexels      free key, best photography         -> Pexels licence, commercial OK, no attribution
  Pixabay     free key, big and varied           -> Pixabay licence, commercial OK, no attribution

Openverse needs no signup, so a $0 channel starts immediately. Add PEXELS_API_KEY /
PIXABAY_API_KEY to .env when you want better photography (both are free, ~1 minute to get).

Every run writes:
  <project>/work/images/           the files, named <beat>-<slug>.jpg
  <project>/work/images/CREDITS.md attribution you can paste into the video description
  <project>/work/images/credits.json

MOTION FOOTAGE: `--videos` fetches Pexels VIDEO CLIPS instead (same Pexels licence, commercial
OK, no attribution) into <project>/work/videos/. build_longform.py accepts .mp4 beats, so a beat
can be real footage:  { "video_query": "boiling water pan" } in beats.json with --videos
--from-beats, or list them via --queries. Prefers the largest landscape mp4 at or under 1920px.

Usage:
  python tools/fetch_stock.py videos/video-2 --queries "mason jar,farmhouse window,attic fan"
  python tools/fetch_stock.py videos/video-2 --from-beats        # queries come from beats.json
  python tools/fetch_stock.py videos/video-2 --queries "..." --per 3 --provider pexels
  python tools/fetch_stock.py videos/video-2 --videos --queries "boiling water,scrubbing pan"
  python tools/fetch_stock.py videos/video-2 --videos --from-beats   # video_query fields
  python tools/fetch_stock.py --check                            # which providers are usable

ALWAYS eyeball what you got before rendering. A keyword search will happily return something
technically on-topic and visually wrong.
"""
import argparse
import json
import os
import re
import sys
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UA = "framewright-stock/1.0 (educational video production)"

# Licences that are safe on a monetised channel. Share-alike (SA) is excluded on purpose: it can
# force the whole derivative work under the same licence, which is not a fight worth having.
SAFE_LICENSES = {"cc0", "pdm", "by"}
REJECT_HINT = {"nc": "non-commercial", "sa": "share-alike", "nd": "no-derivatives"}


def load_env(name):
    p = os.path.join(ROOT, ".env")
    if not os.path.exists(p):
        return None
    for line in open(p, encoding="utf-8", errors="replace"):
        if line.strip().startswith(name + "="):
            v = line.split("=", 1)[1].strip().strip('"').strip("'")
            return v or None
    return None


def get(url, headers=None, timeout=30):
    req = urllib.request.Request(url, headers={"User-Agent": UA, **(headers or {})})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.load(r)


def slug(s, n=40):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:n] or "img"


# ---------------------------------------------------------------- providers

def search_openverse(q, per):
    url = ("https://api.openverse.org/v1/images/?" + urllib.parse.urlencode({
        "q": q, "page_size": per, "license_type": "commercial,modification",
        "mature": "false", "aspect_ratio": "wide",
    }))
    out = []
    for r in get(url).get("results", []):
        lic = (r.get("license") or "").lower()
        if lic not in SAFE_LICENSES:
            continue                       # belt AND braces: the API filter plus our own check
        out.append({"url": r.get("url"), "license": f"CC {lic.upper()}",
                    "creator": r.get("creator") or "unknown",
                    "source": r.get("foreign_landing_url") or r.get("url"),
                    "provider": "openverse",
                    "attribution_required": lic == "by"})
    return out


def search_pexels(q, per, key):
    url = "https://api.pexels.com/v1/search?" + urllib.parse.urlencode(
        {"query": q, "per_page": per, "orientation": "landscape"})
    return [{"url": p["src"]["large2x"], "license": "Pexels License",
             "creator": p.get("photographer") or "unknown",
             "source": p.get("url"), "provider": "pexels", "attribution_required": False}
            for p in get(url, {"Authorization": key}).get("photos", [])]


def search_pixabay(q, per, key):
    url = "https://pixabay.com/api/?" + urllib.parse.urlencode(
        {"key": key, "q": q, "per_page": max(3, per), "image_type": "photo",
         "safesearch": "true", "orientation": "horizontal"})
    return [{"url": h.get("largeImageURL"), "license": "Pixabay Content License",
             "creator": h.get("user") or "unknown", "source": h.get("pageURL"),
             "provider": "pixabay", "attribution_required": False}
            for h in get(url).get("hits", [])]


def search_pexels_videos(q, per, key):
    """Pexels video search -> best landscape mp4 <=1920px per clip. Same Pexels licence."""
    url = "https://api.pexels.com/videos/search?" + urllib.parse.urlencode(
        {"query": q, "per_page": per, "orientation": "landscape"})
    out = []
    for v in get(url, {"Authorization": key}).get("videos", []):
        best = None
        for f in v.get("video_files", []):
            if f.get("file_type") != "video/mp4":
                continue
            w = f.get("width") or 0
            if best is None or (w <= 1920 and w > best[0]):
                best = (w, f.get("link"))
        link = best[1] if best else None
        if not link:
            continue
        out.append({"url": link, "duration": v.get("duration"),
                    "license": "Pexels License", "creator": (v.get("user") or {}).get("name")
                    or "unknown", "source": v.get("url"), "provider": "pexels-video",
                    "attribution_required": False})
    return out


def providers_available():
    av = [("openverse", None)]
    for name, env in (("pexels", "PEXELS_API_KEY"), ("pixabay", "PIXABAY_API_KEY")):
        k = load_env(env)
        if k:
            av.append((name, k))
    return av


def download(url, dest):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r, open(dest, "wb") as f:
        f.write(r.read())
    return os.path.getsize(dest)


def main():
    ap = argparse.ArgumentParser(description="fetch commercially-safe stock images (or Pexels video clips with --videos)")
    ap.add_argument("project", nargs="?")
    ap.add_argument("--queries", default="", help="comma-separated search terms")
    ap.add_argument("--from-beats", action="store_true", help="take queries from work/beats.json")
    ap.add_argument("--videos", action="store_true", help="fetch Pexels VIDEO clips instead of images")
    ap.add_argument("--per", type=int, default=2, help="assets per query (default 2)")
    ap.add_argument("--provider", default="auto", choices=["auto", "openverse", "pexels", "pixabay"])
    ap.add_argument("--check", action="store_true", help="list usable providers and exit")
    a = ap.parse_args()

    av = providers_available()
    if a.check:
        print("providers:")
        for n, k in av:
            print(f"  {n:<10} {'keyless' if k is None else 'key present'}")
        for n, env in (("pexels", "PEXELS_API_KEY"), ("pixabay", "PIXABAY_API_KEY")):
            if n not in [x[0] for x in av]:
                print(f"  {n:<10} MISSING {env} in .env  (free signup, better photography)")
        return
    if not a.project:
        raise SystemExit("need a project dir (or --check)")

    proj = a.project if os.path.isabs(a.project) else os.path.abspath(a.project)
    outdir = os.path.join(proj, "work", "videos" if a.videos else "images")
    os.makedirs(outdir, exist_ok=True)

    queries = [q.strip() for q in a.queries.split(",") if q.strip()]
    if a.from_beats:
        bp = os.path.join(proj, "work", "beats.json")
        if not os.path.exists(bp):
            raise SystemExit(f"--from-beats needs {bp}")
        qkey = "video_query" if a.videos else "image_query"
        for b in json.load(open(bp, encoding="utf-8"))["beats"]:
            q = b.get(qkey)
            if q and q not in queries:
                queries.append(q)
    if not queries:
        raise SystemExit("no queries (use --queries or --from-beats)")

    chosen = [p for p in av if a.provider in ("auto", p[0])] or av
    if a.videos:
        if "pexels" not in [n for n, _ in av]:
            raise SystemExit("--videos needs PEXELS_API_KEY in .env (free signup, ~1 minute)")
        chosen = [("pexels", [k for n, k in av if n == "pexels"][0])]
    creditsp = os.path.join(outdir, "credits.json")
    credits = json.load(open(creditsp, encoding="utf-8")) if os.path.exists(creditsp) else []
    have = {c["file"] for c in credits}

    print(f"{len(queries)} queries x {a.per}  ->  {os.path.relpath(outdir, ROOT)}")
    # Phase 1: SEARCH sequentially (fallback narrowing depends on per-query results) and
    # build the download plan. Phase 2: DOWNLOAD in parallel (4 workers — politeness cap).
    plan = []  # (url, filename, credit entry)
    ext = "mp4" if a.videos else "jpg"
    for qi, q in enumerate(queries):
        # Stock indexes match WORDS. A long descriptive phrase returns nothing, so fall back to
        # progressively shorter queries: full phrase -> first 3 words -> the 2 most specific.
        words_q = q.split()
        variants = [q]
        if len(words_q) > 3:
            variants.append(" ".join(words_q[:3]))
        if len(words_q) > 2:
            variants.append(" ".join(w for w in words_q if len(w) > 3)[:40] or words_q[0])
        results, used_q = [], q
        for vq in variants:
            for name, key in chosen:
                try:
                    if a.videos:
                        results = search_pexels_videos(vq, a.per, key)
                    elif name == "openverse":
                        results = search_openverse(vq, a.per * 3)
                    elif name == "pexels":
                        results = search_pexels(vq, a.per, key)
                    else:
                        results = search_pixabay(vq, a.per, key)
                except Exception as e:
                    print(f"  {vq!r}: {name} failed ({type(e).__name__})")
                    continue
                if results:
                    used_q = vq
                    break
            if results:
                break
        if used_q != q:
            print(f"  {q!r}: narrowed to {used_q!r}")
        if not results:
            print(f"  {q!r}: nothing usable found")
            continue

        taken = 0
        for r in results:
            if taken >= a.per or not r.get("url"):
                continue
            fn = f"{qi:03d}-{slug(q)}-{taken}.{ext}"
            if fn in have:
                taken += 1
                continue
            plan.append((r["url"], fn, {"file": fn, "query": q, **{k: r[k] for k in
                         ("license", "creator", "source", "provider", "attribution_required")},
                         **({"duration": r["duration"]} if r.get("duration") else {})}))
            taken += 1
        print(f"  {q!r}: {taken} from {results[0]['provider']}")

    got = rejected = 0
    if plan:
        from concurrent.futures import ThreadPoolExecutor
        print(f"downloading {len(plan)} {'clips' if a.videos else 'images'} (4 workers)...")

        def fetch(t):
            url, fn, _credit = t
            try:
                return t, download(url, os.path.join(outdir, fn))
            except Exception as e:
                print(f"  {fn}: download failed ({type(e).__name__})")
                return t, 0

        minsize = 100000 if a.videos else 15000   # small videos are broken fragments, not clips
        with ThreadPoolExecutor(max_workers=4) as ex:
            for t, size in ex.map(fetch, plan):  # map preserves plan order -> deterministic credits
                _url, fn, credit = t
                p = os.path.join(outdir, fn)
                if size < minsize:                   # a few KB means a placeholder or an error page
                    if os.path.exists(p):
                        os.remove(p)
                    rejected += 1
                    continue
                credits.append(credit)
                got += 1

    with open(creditsp, "w", encoding="utf-8") as f:
        json.dump(credits, f, indent=2, ensure_ascii=False)

    need_attr = [c for c in credits if c.get("attribution_required")]
    lines = ["# " + ("Video" if a.videos else "Image") + " credits", "",
             "Paste the attribution block into the video description.", ""]
    if need_attr:
        lines.append("## Attribution REQUIRED (CC BY)")
        for c in need_attr:
            lines.append(f"- \"{c['query']}\" by {c['creator']} - {c['license']} - {c['source']}")
        lines.append("")
    lines += ["## No attribution required", ""]
    for c in credits:
        if not c.get("attribution_required"):
            lines.append(f"- {c['file']} - {c['license']} ({c['provider']}) - {c['source']}")
    with open(os.path.join(outdir, "CREDITS.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")

    # WRITE BACK: point each beat at a file actually fetched for its query. Without this the
    # beat map keeps its PENDING- placeholders and build_longform fails on missing images.
    if a.from_beats:
        bp = os.path.join(proj, "work", "beats.json")
        spec = json.load(open(bp, encoding="utf-8"))
        qkey = "video_query" if a.videos else "image_query"
        by_q = {}
        for c in credits:
            by_q.setdefault(c["query"], []).append(os.path.join("work", "videos" if a.videos else "images", c["file"]))
        pool = [f for fs in by_q.values() for f in fs]
        used, assigned, fallback = {}, 0, 0
        for b in spec["beats"]:
            q = b.get(qkey)
            opts = by_q.get(q) or []
            if opts:                       # rotate within a query so repeats are not identical
                i = used.get(q, 0)
                b["image"] = opts[i % len(opts)]
                used[q] = i + 1
                assigned += 1
            elif pool:
                b["image"] = pool[fallback % len(pool)]
                fallback += 1
        with open(bp, "w", encoding="utf-8") as f:
            json.dump(spec, f, indent=1, ensure_ascii=False)
        print(f"  beats.json: {assigned} beats matched to their own query"
              + (f", {fallback} fell back to another asset" if fallback else ""))

    print(f"\n{got} {'clips' if a.videos else 'images'} downloaded, {rejected} rejected as too small, "
          f"{len(need_attr)} need attribution")
    print(f"  credits -> {os.path.relpath(os.path.join(outdir,'CREDITS.md'), ROOT)}")
    print("  LOOK AT THEM before rendering - keyword search returns on-topic, visually wrong assets.")


if __name__ == "__main__":
    main()
