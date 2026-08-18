#!/usr/bin/env python3
"""
lint_script.py — hard gate on CLARITY and STAKES, run BEFORE the VO.

Why this exists: re-closing-costs (2026-08-02) shipped a factually perfect 32-minute script that the
channel owner could not follow while watching his own video. Every number was sourced; the writing
was a wall. One sentence ran 60 words. "Documentary or deed transfer stamp" was never translated
into English. Nothing in the pipeline caught it, because nothing was measuring it.

This measures it. It enforces CLAUDE.md GROWTH RULES 6 (write it so a tired 12-year-old gets it) and
7 (make the viewer feel the cost of not knowing), and it exits non-zero so a bad script cannot walk
past the gate into an hour of TTS + render.

What it can and cannot know: sentence length, reading grade and second-person density are real,
countable things. Whether an analogy actually lands, or whether a hook is genuinely surprising, are
NOT machine-checkable — those stay human judgment and the tool says so rather than pretending.

Usage:
  python tools/lint_script.py videos/re-closing-costs
  python tools/lint_script.py videos/re-closing-costs --niche real-estate
  python tools/lint_script.py videos/re-closing-costs --max-sentence 22 --max-grade 8
  python tools/lint_script.py videos/re-closing-costs --show 15    # worst 15 offenders
"""
import argparse
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# Terms that mean nothing to a first-time viewer without an immediate plain-language gloss.
# Extend per niche via niches/<id>.json -> script.jargon (a list of extra terms).
JARGON = [
    # money / lending
    "escrow", "amortization", "amortized", "underwriting", "underwriter", "origination",
    "expense ratio", "basis points", "fiduciary", "liquidity", "equity", "principal",
    "compound interest", "vesting", "annuity", "rollover", "capital gains", "depreciation",
    # real estate
    "transfer tax", "documentary stamp", "deed transfer stamp", "recordation", "lien",
    "lienholder", "encumbrance", "estoppel", "contingency", "appraisal contingency",
    "title insurance", "closing disclosure", "loan estimate", "conveyance", "recorder",
    # tech / ai
    "inference", "quantization", "context window", "fine-tuning", "embedding", "latency",
    "tokenization", "parameter count", "benchmark suite",
]

# Phrases that signal the writer immediately explained the term.
GLOSS_SIGNALS = [
    "that's", "that is", "which is", "which means", "meaning", "in other words", "basically",
    "think of it as", "think of that as", "it's just", "that just means", "put simply",
    "in plain english", "or as", "essentially", "the simple version", "what that means",
    "same idea as", "like a", "like the", "similar to",
]

ABSTRACT_OPENERS = [
    "one might", "one can", "people often", "buyers in certain", "individuals", "consumers",
    "one's own", "a person who",
]


def strip_script(text):
    """Return spoken-only prose: no # comments, no [beat: ...] directives, no > production notes."""
    out = []
    for line in text.splitlines():
        s = line.strip()
        if not s or s.startswith("#") or s.startswith(">"):
            continue
        if re.match(r"^\[beat:.*\]$", s, re.I):
            continue
        if s.startswith("##"):
            continue
        out.append(s)
    return " ".join(out)


def sentences(prose):
    parts = re.split(r"(?<=[.!?])\s+", prose)
    return [p.strip() for p in parts if p.strip() and re.search(r"[A-Za-z]", p)]


def words_of(s):
    return re.findall(r"[A-Za-z0-9$%',.-]+", s)


def syllables(word):
    """Approximate syllable count — good enough for a readability index, not linguistics."""
    w = re.sub(r"[^a-z]", "", word.lower())
    if not w:
        return 0
    if len(w) <= 3:
        return 1
    w = re.sub(r"(?:[^laeiouy]es|ed|[^laeiouy]e)$", "", w)
    w = re.sub(r"^y", "", w)
    n = len(re.findall(r"[aeiouy]{1,2}", w))
    return max(1, n)


def flesch_kincaid_grade(sents):
    """US school grade needed to read this. Target <= 8 for a general audience."""
    n_s = len(sents)
    ws = [w for s in sents for w in words_of(s)]
    n_w = len(ws)
    n_syl = sum(syllables(w) for w in ws)
    if not n_s or not n_w:
        return 0.0
    return 0.39 * (n_w / n_s) + 11.8 * (n_syl / n_w) - 15.59


def find_jargon(prose, terms, window=30):
    """-> [(term, context, glossed_bool)] for each first occurrence of each term."""
    low = prose.lower()
    hits = []
    for t in terms:
        i = low.find(t.lower())
        if i < 0:
            continue
        tail = low[i: i + len(t) + window * 7]      # ~7 chars/word of following context
        glossed = any(g in tail for g in GLOSS_SIGNALS)
        ctx = prose[max(0, i - 40): i + len(t) + 90].replace("\n", " ")
        hits.append((t, ctx, glossed))
    return hits


def main():
    ap = argparse.ArgumentParser(description="clarity + stakes gate for a script (run BEFORE the VO)")
    ap.add_argument("project")
    ap.add_argument("--niche", help="niches/<id>.json — adds its script.jargon terms")
    ap.add_argument("--max-sentence", type=int, default=25, help="hard word cap per sentence")
    ap.add_argument("--avg-sentence", type=float, default=18.0, help="target average words/sentence")
    ap.add_argument("--max-grade", type=float, default=9.0, help="max Flesch-Kincaid grade")
    ap.add_argument("--long-frac", type=float, default=0.12,
                    help="max fraction of sentences over the hard cap")
    ap.add_argument("--show", type=int, default=8, help="how many offenders to print")
    ap.add_argument("--hook-seconds", type=int, default=30,
                    help="opening window that must carry the stakes")
    ap.add_argument("--wpm", type=float, default=177.3, help="for estimating the hook window")
    a = ap.parse_args()

    proj = a.project if os.path.isabs(a.project) else os.path.abspath(a.project)
    sp = os.path.join(proj, "work", "script.md")
    if not os.path.exists(sp):
        raise SystemExit(f"no script: {sp}")
    prose = strip_script(open(sp, encoding="utf-8").read())
    sents = sentences(prose)
    if not sents:
        raise SystemExit("script has no prose")

    terms = list(JARGON)
    if a.niche:
        np_ = os.path.join(ROOT, "niches", f"{a.niche}.json")
        if os.path.exists(np_):
            n = json.load(open(np_, encoding="utf-8"))
            terms += n.get("script", {}).get("jargon", [])

    lens = [len(words_of(s)) for s in sents]
    n_w = sum(lens)
    avg = n_w / len(sents)
    longs = [(l, s) for l, s in zip(lens, sents) if l > a.max_sentence]
    long_frac = len(longs) / len(sents)
    grade = flesch_kincaid_grade(sents)

    you = len(re.findall(r"\b(you|your|you're|yours)\b", prose, re.I))
    you_per_100 = you / n_w * 100

    hook_words = int(a.hook_seconds / 60 * a.wpm)
    hook = " ".join(words_of(prose)[:hook_words]).lower()
    money_in_hook = bool(re.search(r"\$|\bdollar|\bcost|\bpay|\bthousand|\bpercent|\bfee\b", hook))
    you_in_hook = bool(re.search(r"\byou\b|\byour\b", hook))

    jargon_hits = find_jargon(prose, terms)
    unglossed = [(t, c) for t, c, g in jargon_hits if not g]
    abstract = [p for p in ABSTRACT_OPENERS if p in prose.lower()]

    print(f"script: {os.path.relpath(sp, ROOT)}")
    print(f"  {len(sents)} sentences, {n_w} words\n")

    fails, warns = [], []

    def check(ok, label, detail, hard=True):
        print(f"  [{'PASS' if ok else ('FAIL' if hard else 'WARN')}] {label:<22} {detail}")
        if not ok:
            (fails if hard else warns).append(label)

    check(avg <= a.avg_sentence, "avg sentence",
          f"{avg:.1f} words (target <= {a.avg_sentence})")
    check(long_frac <= a.long_frac, "long sentences",
          f"{len(longs)}/{len(sents)} over {a.max_sentence} words "
          f"({long_frac*100:.0f}%, max {a.long_frac*100:.0f}%)")
    check(grade <= a.max_grade, "reading grade",
          f"Flesch-Kincaid {grade:.1f} (max {a.max_grade})")
    check(not unglossed, "jargon glossed",
          f"{len(unglossed)} term(s) used with no plain-language gloss nearby"
          if unglossed else f"all {len(jargon_hits)} jargon term(s) glossed on first use")
    check(you_per_100 >= 2.0, "second person",
          f"{you_per_100:.1f} 'you' per 100 words (want >= 2.0)", hard=False)
    check(money_in_hook and you_in_hook, "stakes in hook",
          f"first ~{a.hook_seconds}s: cost language={'yes' if money_in_hook else 'NO'}, "
          f"direct address={'yes' if you_in_hook else 'NO'}")
    check(not abstract, "no abstract voice",
          f"{', '.join(abstract)}" if abstract else "none of the impersonal openers", hard=False)

    if longs and a.show:
        print(f"\n  worst {min(a.show, len(longs))} sentence(s) — split these:")
        for l, s in sorted(longs, reverse=True)[:a.show]:
            print(f"    {l:>3}w  {s[:150]}{'...' if len(s) > 150 else ''}")

    if unglossed and a.show:
        print(f"\n  jargon with no gloss on first use — explain in the SAME breath:")
        for t, c in unglossed[:a.show]:
            print(f"    {t:<22} ...{c.strip()[:110]}...")

    print("\n  NOT machine-checkable, still your job: does each mechanism have a real analogy, is the")
    print("  surprise genuinely surprising, does the hook name a cost the viewer actually cares about,")
    print("  and does the video PAY OFF every promise it makes (watch time decides the A/B test).")

    if fails:
        print(f"\n  FAILED: {', '.join(fails)}  — fix before generating the VO.")
        sys.exit(1)
    print(f"\n  CLARITY GATE PASSED{' (warnings: ' + ', '.join(warns) + ')' if warns else ''}")


if __name__ == "__main__":
    main()
