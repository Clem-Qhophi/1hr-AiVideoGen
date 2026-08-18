---
name: youtube-packaging
description: Generates click-optimized YouTube packaging — one locked title + one thumbnail by default (per-user standing preference, see below; the classic 3-bet A/B/C mode is still available on request), plus a value-forward description, then renders the thumbnail(s) as real images. Use this whenever you want to package a long-form video or turn a video idea into titles and thumbnails. Triggers include how would you package this, title ideas for, thumbnail concept, package this video, A/B variations, and make this clickable. Calibrates to your channel's own CTR data if you have it. Long-form only, never Shorts. Not for non-YouTube copywriting.
---

# YouTube Packaging (Title + Thumbnail)

**STANDING RULE — 1M-VIEW VIRAL PACKAGING & 90+ PROBABILITY GATE (Mandated 2026-08-14):**
Every video packaged on this channel MUST target **1 Million Views** with extreme curiosity, insane hooks, and high-impact visual metaphors (e.g., using "The Flash" superhero analogy for extreme AI speed, split battle comparisons, or high-contrast warning traps).
- **Mandatory Tool**: Always run `python tools/viral_packaging_engine.py brainstorm videos/<slug> --min-score 90` to ideate across 5 viral archetypes.
- **Strict Scoring Gate**: Every proposed packaging concept is evaluated against a rigorous 100-point CTR probability model (Curiosity Gap: 25, Stakes/Disruption: 20, Glanceability: 20, Visual Metaphor: 15, Synergy: 10, Entity Velocity: 10).
- **Hard Acceptance Rule**: **Only packaging concepts scoring >= 90/100 are approved for production and upload.** If candidates score below 90, the brainstorming engine iterates until a 90+ concept is produced.

**Read `EVOLUTION.md` first** (repo root) — the shared learning log. Check **Craft lessons by discipline →
Packaging** (and Providers, for thumbnail-render availability), and **append what you learn there** when
the packaging ships. Measured CTR still belongs in `references/channel-calibration.md`; EVOLUTION.md is for
the production lessons around it.

Turns a video idea into **one locked 90+ title + 1 dominant viral thumbnail** (or 3 distinct bets on request),
plus one value-forward description — rendered with `tools/viral_packaging_engine.py` or Remotion.

The whole skill optimizes for one number: **CTR** (click-through rate) at high scale. It's the metric YouTube
Studio reports per thumbnail, and the only one that isolates *packaging* from topic and algorithm.

## Where these rules come from, and what to do about it

The rules below are not generic YouTube advice — they were derived from Studio CTR data across 20
long-form videos on a real ~1M-subscriber beginner/AI channel, read in CTR order. That dataset isn't
shipped (it's another channel's numbers, and its absolutes wouldn't transfer). The **patterns** do
transfer, and they're a much better prior than guessing.

**But an inherited rule is a bet, not a fact — about YOUR audience.** So:

- **Cold start (no channel data yet).** Use these rules as-is. **Say so when you package**: "these
  are uncalibrated defaults — your own CTR data will beat them." Then tell the creator to start
  logging CTR from video 1.
- **Calibrated (~10+ long-form videos with CTR).** Run `references/channel-calibration.md` first,
  then follow *that* file's numbers wherever it disagrees with this one. **Their data wins over
  anything written here.**

Ask which mode you're in if it isn't obvious. Never quote a target CTR the creator hasn't measured.

## The core model — read this first

**Views = Reach × CTR. Two different levers, driven by two different things.**

- **Reach** (how many people YouTube serves it to) comes from the **topic** and from riding **known
  discovery waves** — a tool everyone's searching, a real news moment, a broad money/free promise.
  **Packaging cannot fix a low-ceiling topic.**
- **CTR** comes from **packaging craft** — concrete promise, magnet word, barrier-drop, one bold
  thumbnail hook. **This is the only lever this skill controls.**

Good packaging on a narrow topic produces good CTR and low views. **That is correct behavior, not a
packaging failure.** Never blame a title when CTR is healthy and views are small — and never expect a
title to rescue a topic nobody wants.

**The one guardrail that stops this becoming hollow clickbait:** the promise must be one the video
actually keeps. Overpromise → the viewer bounces in 30 seconds → retention craters → YouTube chokes
the exact reach you were chasing. **The widest promise that also holds** is what makes YouTube widen
distribution. Reality beats expectations.

## The flow

Run it in order. Stages 1–2 are fast; the value is getting the *promise* right before generating,
because a wrong promise wastes all three bets.

---

### Stage 1 — Intake

Ask in one message:

1. **Core idea** — what's the video about / the rabbit hole.
2. **The concrete takeaway** — the *one clear thing* the viewer walks away with. This becomes the
   promise. If you can't say it in a sentence, the packaging will be vague — push to name it.
3. **Audience** — who clicks this: beginners, practitioners, or a mixed/wide audience? This sets how
   much jargon a title can carry. (A wide/beginner channel should package for the widest clickable
   promise and do its segmentation *inside* the video, never by narrowing the title.)
4. **Locked angle or term?** — any angle already committed to, especially a coined/branded phrase.
5. **Conversion target** — what the video pitches (a course, a tool, a repo, a newsletter, nothing).
   Needed for the description. "Nothing" is a valid answer.
6. **Channel data?** — do they have ~10+ long-form videos with Studio CTR? Sets calibrated vs cold
   start. If calibrated and `references/channel-calibration.md` is still empty, offer to run it first.

---

### Stage 2 — Ceiling + promise (checkpoint before generating)

**Gate 1 — Topic ceiling.** Classify honestly:

- **HIGH** = broad demand riding a known wave (money / save-money, a broadly useful free capability, a
  major tool everyone knows).
- **NARROW** = niche format, niche tool, or an insider flex.

If narrow, **say so plainly and reset the view expectation** *before* generating: packaging will
still maximize CTR, but views are capped by demand. Then decide whether the topic is worth making
*for conversion* even if reach is low. That's a real strategy, but it should be a choice.

**Gate 2 — The promise.** Draft the core promise as the **clearest concrete takeaway, stated
plainly** — NOT a withheld-drama curiosity gap.

- Spell out the takeaway: name the number, the tool, the saving, the outcome.
- Don't withhold or moralize. "X Can Do More Than You Think" and "X Is Dead" are the classic floor.
- **If the video is built on a mechanism** — an experiment, a build-off, a comparison — **the lesson
  is the headline; the mechanism is only how the lesson surfaces.** Never lead with the mechanism.

**CHECKPOINT:** State the ceiling classification and the one-line promise. Confirm or fix the promise
before generating. Do not skip — three bets off a wrong promise is wasted work.

---

### Stage 3 — Generate the packaging

**Structure this correctly, it's the thing people get wrong.** YouTube's A/B test (formerly
"Test & Compare") tests **up to 3 variants**, and since the December 2025 global rollout those
variants can be **titles, thumbnails, OR title+thumbnail combinations** — title testing is no longer
off the table. Verified against Google's own help page 2026-08-02
(`support.google.com/youtube/answer/16391400`). This file previously asserted "thumbnail-only" and
that was wrong; do not reintroduce it.

**Two things that change how you should package, and most creators get both backwards:**

1. **The winner is decided by WATCH TIME, not CTR.** YouTube shows the variants evenly, keeps a small
   control group, and picks whichever earned the most watch time — then labels the result *Winner*,
   *Performed Same*, or *Inconclusive* (inconclusive defaults to the first option uploaded). A
   thumbnail that wins the click and loses the viewer **loses this test**. That means overclaiming is
   not just an honesty problem here, it is a *losing strategy on YouTube's own scoreboard* — which
   lines up exactly with every niche's `honesty_guard`. Say this out loud when a bet tempts you to
   overpromise.
2. **Test ONE dimension at a time unless you have real volume.** Three title+thumbnail combos vary
   two things at once, so a win tells you *that* combo won but not *why* — and with 3 variants
   splitting the traffic you often land on "Inconclusive" anyway. Default to **one fixed title × 3
   thumbnail bets** (the highest-signal test for a channel still finding its packaging), and switch
   to title testing deliberately, as its own experiment, once thumbnails have a proven winner.

**Restrictions worth knowing before you plan a test:** desktop Studio only, Advanced Features must be
enabled, and Shorts, scheduled Lives, Premieres (until the premiere ends), made-for-kids, age-restricted
and private videos are all ineligible. Tests run a few days up to 2 weeks.

**Descriptions cannot be A/B tested.** YouTube provides no native mechanism — see
`references/ab-testing.md` for the honest sequential-test protocol and its confounds. Never imply the
description is being tested the way a title or thumbnail is.

**First, lock ONE title.** It must pass most of the Title Checklist below. Output with it:

- **Implied expectation** — one line: what the viewer expects walking in. The intro must pay this off.
  Carry it into the script.

**Then ONE thumbnail** under that fixed title (default — see the standing rule at the top of this
file; do the classic 3-bet flow below only if the user asks for a test on this video). Pick the
single strongest lever rather than spreading across three:

- **Thumbnail concept** — composition per the Thumbnail Checklist: face + expression, the *one*
  dominant hook (word or number), color pop, any object.
- **Thumbnail text** — a **1–3 word fragment that combines with the title, never repeats it.**
- **Lever** — which lever it tests, one line on the bet.
- **Honesty check** — does this frame stay true under the fixed title, and does the video keep it? A
  thumbnail promising a beat the video doesn't have must be pulled or the beat must be built.

**Lever menu — pick 3 different ones:**

- **Magnet-word lead** — Free / Unlimited / 100% / $0
- **Number/$ lead** — a specific figure as the hook
- **Barrier-drop lead** — for beginners / no coding / without [skill]
- **Object / curiosity-anchored lead** — a tangible thing + a value contrast, or a named valuable
  thing the viewer wants ("the one skill")
- **News / "Now" lead** — only if something genuinely changed
- **Own-term / brand-fit lead** — a coined term. Lower reach (rides no wave) but strong identity —
  good as *one* of three, rarely all three.

Then close Stage 3 with:

- **One description** (one per video). Save to `videos/<project>/packaging/description.txt`:
  1. **2-line value hook** — the concrete payoff in plain words; name the *specific* things they'll
     learn (the real number, the free tool, the exact capability). The title sells the takeaway;
     these two lines make it specific and undeniable.
  2. **CTAs** — lead with the one matching the Stage 1 conversion target, then any others (repo,
     free resources, newsletter). If something is free, say so plainly.
  3. **Timestamps / chapters** — first chapter at `0:00`, keyword-rich labels. Derive from the edit
     plan / final cut; re-confirm if the cut length changed.
  4. Short like/subscribe nudge.
- **Self-check** — run the title and the thumbnail against both checklists; flag any rule bent and
  why it's worth it.
- **Baseline note** — if calibrated, restate their measured median + stretch target. If cold start,
  say plainly that there's no baseline yet and this is the first data point.

---

### Stage 4 — Refine

Iterate — tighten the title, swap a lever, adjust a hook. All 3 run live in the A/B/C test, so the
goal is **3 you're willing to ship**, not one.

---

### Stage 5 — Render the thumbnails

**Default engine: `tools/gen_thumbnail_tsx.py` (Remotion, $0).** Gemini image gen is billing-blocked
on this setup — see repo-root `CLAUDE.md`. Do not plan around it. Mechanics live in
**`references/thumbnail-generation.md`** — load it before rendering. The flow:

1. **Source the photos FIRST, before you finalise the concepts.** What stock actually returns should
   shape the bets — a concept whose photo does not exist is not a concept.
   `venv/Scripts/python tools/fetch_stock.py videos/<slug> --queries "…" --provider pexels`
   Build a contact sheet, **look at it**, and throw out anything that is the wrong subject, wrong
   country or wrong state. Pexels is licence-clean for commercial use with no attribution.
2. **Render the one thumbnail** into `videos/<project>/packaging/thumbs/A.png` with
   `--variant photo|versus|split`, `--headline` + `--emphasis`, an accent from the loud palette, and
   a `--badge` / `--arrow` / `--circle-at` where it earns its place. Sidecar `.json` files make every
   render reproducible. (Only render B/C too if the user explicitly asked for a 3-bet test on this
   video.)
3. **Verify the render by OPENING IT** — against the Thumbnail Checklist above. Rule 0 and rule 1
   are gates, not preferences. Regenerate if it fails.
4. **Squint test.** Downscale to 246px wide and confirm every word is still readable. Most of the
   audience will only ever see it at that size.
5. **Deliver** the final to YouTube spec (`--jpg`, ≤2MB).

**Host photo placement (any channel with a `thumbnail_template.cutout_asset`, e.g. home-hacks/Walt):
never let the cutout cover the subject photo.** Put the host on whichever side is visually emptiest
(check the background image before picking `--face-at`, don't default to the same side every time),
and size him so the subject/evidence image stays legible — the host is a presence in the scene, not
a wall covering it. Vary the crop/zoom/position video to video so consecutive thumbnails don't look
like a copy-paste template.

If a face kit ever lands in `media/library/faces/` **and** Gemini image billing is enabled, the paid
Nano Banana Pro path in the reference doc becomes available as an upgrade — real pose variation,
outfit changes, prop removal (e.g. removing a bag strap), full-body extension from a headshot, all
from the same identity reference. Until then, do not promise those — design for the single-photo
constraint honestly (reposition/recrop, don't claim edits that aren't happening).

Remember the **loud-vs-calm rule**: the thumbnail is intentionally louder than the calm in-video
brand (`brand.md`) — never tone it down to match. See the reference doc.

---

## Title Checklist

A strong title passes most of these. Use as a generator *and* a filter.

1. **Concrete promise** — quantified ($ / count) or absolute (Unlimited / 100% / Free)? Vague = dead.
2. **At least one magnet word** — Free, Unlimited, 100%, Money, Easiest.
3. **Outcome-framed**, not feature-framed — the viewer's *gain*, not what the tool *does*. Selling a
   tool's capability instead of the viewer's outcome is a reliable floor.
4. **Zero unknown / own-product names** — see the self-brand rule below.
5. **Barrier-drop or authenticity rider** where the topic invites skepticism — "for beginners," "no
   coding," "without [skill]," "(No BS)."
6. **News / "Now / New" hook** if something genuinely changed — borrows the discovery wave.
7. **A specific noun**, not vague curiosity — "the one skill," never "WAY more" / "you won't believe."
8. **No hot-take / "DEAD" / negative framing** — make/save/build outperforms opinions. (Test this
   against your own data; it's one of the most channel-dependent rules here.)
9. **Leads with the takeaway, not the mechanism.**

## Thumbnail Checklist

**Rewritten 2026-08-03 after a real rejection.** The old checklist said the right things ("one
dominant hook", "big positive face", "bright saturated color pop") and the pipeline still shipped
three dark text-on-gradient cards for `re-closing-costs`. The channel owner's verdict: *"so boring,
not attractive… I'll pass."* The rules weren't wrong, they were **non-binding** — the tool's default
variant made the dull thing the easy thing, and "bright saturated" was advice rather than a gate. So
rules 0 and 1 below are now **hard gates**, enforced in `tools/gen_thumbnail_tsx.py` itself.

### Rule 0 — HARD GATE: no text-only-on-a-dark-background thumbnail. Ever. Not as any of the 3 bets.

A big word on a dark gradient with a small colored pill is **not a thumbnail**, it's a lower-third.
Nothing on the browse wall looks like that and wins. `gen_thumbnail_tsx.py --variant word` now
**refuses to run** without `--allow-textonly`, and that escape hatch exists only for the case where
no photograph can be sourced at all. **Never more than one text-only card across A/B/C**, and if you
use the escape hatch, say so in the packaging notes and explain why stock failed.

Getting a photo is one command and costs $0:

```
venv/Scripts/python tools/fetch_stock.py videos/<slug> --queries "…,…,…" --provider pexels
```

Then **eyeball the contact sheet before rendering.** Keyword search returns confidently wrong
images — a "delaware state welcome sign" query on this very video returned a **Connecticut** sign.
Shipping that would have been a fabricated visual claim.

### Rule 1 — HARD GATE: the default is a REAL PHOTOGRAPH filling the whole frame.

Every high-multiplier thumbnail in this repo's own outlier data (`docs/research/*-viral.json`,
multipliers 3.5x–34x, downloaded and inspected 2026-08-03) is a photograph. Zero are gradient cards.
`--variant photo` is the default for that reason. Use `--variant versus` for two-photo contrasts and
`--variant split` when a real screenshot IS the evidence.

### The rest, ranked by signal strength. Re-rank against your own data once calibrated.

2. **High contrast is not optional on a faceless channel — it is the whole job.** vidIQ's 2026 study
   of 500 breakout long-form videos: 69% used a face, 56% used high-contrast color, and **89% used a
   face *or* high contrast.** We have no face kit on these channels, so contrast is the load-bearing
   element, not a garnish. It is also why the dark-teal-on-near-black cards died: they had neither.
3. **White text with a THICK BLACK OUTLINE.** The single most consistent device across the winners,
   and the thing v1 of the renderer was missing. A soft drop shadow vanishes over a photo at phone
   size; a hard outline survives. `Stroked` in `remotion/src/lib/thumbnail.tsx` does this.
4. **Two-tone hook: line 1 white, line 2 in one saturated accent.** `--headline` + `--emphasis`.
   Give the SHORT line the bigger type (the renderer sizes the two lines independently).
5. **One dominant hook — never a busy frame.** One magnet word OR one big number as the focal
   element. The multi-logo "kill the competitors" graveyard splits attention and lands mid-tier.
6. **3–5 words of overlay text, total.** vidIQ's median across breakout thumbnails is 5. Past that
   nobody reads it at 246px.
7. **Lead with a number/$ when the topic has one** — huge, bright. Strong but not sufficient: a
   number in a busy frame on a narrow topic still sinks.
8. **Bright saturated color, and avoid YouTube's own red/white/black chrome** — a red-and-white frame
   blends into the UI around it. Prefer the loud thumbnail palette (`pop` yellow, `lime`, `cyan`,
   `orange`, `hot`, `violet`, `mint`). The muted brand tokens (`accent`, `signal`, `warn`, `danger`)
   are in-video colors and read flat on a browse wall — that is how this failure happened.
9. **One directional cue, two at most** — a chunky arrow (`--arrow` + `--arrow-at`) or a circle
   callout (`--circle-at`), pointing at the thing that matters. More cues compete instead of guiding.
10. **A 1–3 word corner badge** (`--badge`) opposite the text column, carrying the sting the hook
    can't fit ("NOT THE PRICE", "WASHINGTON D.C.").
11. **Face if you have one; do NOT fake wanting one.** A big high-energy *positive* face still wins
    when a real face kit exists in `media/library/faces/`. Only ~5% of 2026 breakouts used
    exaggerated shocked expressions, and finance/explainer audiences read them as bait. On a faceless
    channel, design for the constraint honestly — rules 2–4 are the substitute, not an apology.
12. **No DEAD / negative framing visually** — mirrors title rule 8.
13. **Thumbnail text ≠ title** — a 1–3 word fragment that *combines* with the title, never repeats it.
    Title and thumbnail are two halves of one message.

### The two verification steps that are not optional

- **Squint test at 246px.** Downscale the finished A/B/C to a real phone-feed width and LOOK at them
  together. Anything you cannot read there does not exist. This is what caught the versus label pills
  being 30px instead of 38px.
- **Open every render before you surface it.** Not the command's exit code — the actual image. The
  three cards this checklist exists to prevent all rendered successfully.

## Hard rules

- **Long-form only.** If asked to package a Short, decline and note this skill is long-form; Shorts
  are a different packaging game.
- **One title, one thumbnail — by default, per the 2026-08-04 standing rule above.** YouTube *can*
  test titles and title+thumbnail combos since Dec 2025 (up to 3 variants), and this pipeline can
  still produce a 3-bet set on request — but ship one unless asked for a test.
- **Package for watch time, not just the click.** The A/B winner is chosen on watch time, so a bet
  that wins clicks and loses retention actively loses. Every thumbnail promise must be one the video
  actually pays off — the honesty rule and the winning strategy are the same rule here.
- **Clear takeaway over withheld drama — always.** Curiosity is allowed *only* when anchored to a
  named, valuable thing ("the one skill you need"), never pure mystery.
- **The self-brand rule:** unknown / own-product names stay OUT of titles. They don't kill clicks —
  they kill *reach*, because an unknown name rides no discovery wave, so YouTube serves it less.
  Known brands help and are fine. Own products belong in the thumbnail and the video, never the title.
- **No hot-take / "DEAD" / negative framing.**
- **No text-only-on-dark thumbnail.** Enforced by the tool (`--variant word`
  requires `--allow-textonly`). One command gets a free, licence-clean photo; there is no excuse.
  Added 2026-08-03 after the `re-closing-costs` rejection.
- **Never quote a CTR target the creator hasn't measured.** Their median or nothing.
- **The creator's data beats this file.** When `references/channel-calibration.md` has real numbers
  that contradict a rule here, the rule is wrong for that channel. Update it.

## References

- `references/channel-calibration.md` — how to pull your own CTR from Studio (it is **not** in the
  API), build the dataset, derive your baseline and your real levers, and reconcile them back into
  this file. Run it once you have ~10+ long-form videos.
- `references/thumbnail-generation.md` — Stage 5 render engine: the Nano Banana Pro model/tool
  (`tools/gen_thumbnail.py`), the `media/library/faces/` reference kit, the prompt template, the
  per-render verify loop, the loud-vs-calm brand rule, and failure-mode fixes. Load before rendering.
