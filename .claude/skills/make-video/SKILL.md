---
name: make-video
description: The unified Director front-door for the AI Video Editor — one command that turns a prompt, a link, or raw footage into a finished, engaging, on-brand video by running the whole existing chain. Use when the user says "make a video", "make me a video about/of X", "turn this into a video", gives a URL or a topic or points at uploaded footage and wants the finished thing, or asks to run the whole pipeline end to end. It runs ONE intake (source, tone/persona, length, goal, audience), builds an asset manifest (capturing what it can and asking you to upload what it can't), then delegates to the real skills (/prompt-to-video, /review-site, /clean-cut → /make-tsx → /suggest-sfx → music → /packaging → yt_upload) at their existing gates. It does not re-implement any of them. Not for a single sub-step when the user names it directly (use that skill), and not for changing the channel's visual brand (that is /brand-setup).
---

# make-video — the Director front-door

**This is the one front door to the whole pipeline.** The user gives a prompt, a link, or raw
footage plus a few preferences; this skill runs the entire existing chain to a finished video at the
RiskMarshal quality bar. It is Stage 0 of `docs/VIDEO-OS-ROADMAP.md` — the same intake + orchestration
that a later self-serve app will drive headless via the Agent SDK.

**Prime rule: delegate, never duplicate.** The judgment lives here (what to make, how it should sound,
what assets it needs); the *doing* lives in the skills and tools that already work. This skill calls
`/prompt-to-video`, `/review-site`, `/clean-cut`, `/make-tsx`, `/suggest-sfx`, the music tools, and
`/packaging`, and **honors each one's existing hard gate** (script approval, SFX audit, packaging).
Never re-implement a sub-step — if it drifts from the real engine it's a bug.

Inherit their hard rules too: **no on-screen claim without captured evidence + source** (see
`/review-site` and `EVOLUTION.md`), no em-dashes in on-screen text, human approves before audio and
before publish.

## Read first (every run)

- **`EVOLUTION.md`** — the shared brain: delivery modes + TTS settings, goal-aware CTA table, evidence
  hierarchy, voice library (IDs), and past lessons. Apply them; append after.
- **`brand.md`** — visual + sound brand contract.
- **`channel-persona.<niche-id>.json`** (repo root) — the remembered "how this channel sounds / who
  it's for", **one file per channel**. Resolve `<niche-id>` from the niche this run is routed to
  (Stage A step 1 / the `niches/*.json` file in play) — never assume there's only one channel. If
  that file exists, **confirm** it rather than re-asking cold; if only the legacy unsuffixed
  `channel-persona.json` exists (single-channel repos, or runs before this convention), use it but
  treat it as belonging to whichever channel it actually names, and don't let it silently apply to a
  *different* channel's video. If neither exists, create the suffixed one in intake. Schema in
  `channel-persona.example.json`. **This matters more as channel count grows** — with several niches
  active at once (see EVOLUTION.md multi-channel entry), reading the wrong persona file means the
  wrong voice/tone/audience gets baked into the wrong channel's video silently.

## Stage A — Intake (ONE batch, then go)

Gather everything the chain needs in a single small exchange. Pull defaults from
`channel-persona.<niche-id>.json` and only ask what's missing or worth confirming.

1. **Source + intent** — auto-detect, confirm if ambiguous. **Check intent before source:** "an ad
   / commercial / promo for X" routes to `/make-ad` even when the input is a URL, because an ad is a
   different discipline from a review (sell vs inform) with its own hard checklist.
   | The user gives… | Route to |
   |---|---|
   | "an ad" / "commercial" / "promo" / "advertise this" / a client's product to sell | `/make-ad` |
   | a URL / "review/walkthrough this site" (informational, no sell) | `/review-site` |
   | uploaded clips in `videos/<slug>/` (`*.mp4`, `DJI_*.MP4`) or "I recorded this" | `/clean-cut` |
   | a topic / idea / "make a video about X" (no URL, no footage) | `/prompt-to-video` |
2. **Persona / tone** — one of the delivery modes (`breaking-news` · `calm-explainer` ·
   `sarcastic-review` · `authoritative`) plus any flavor ("dry", "authentic", "hyped"). This maps to
   TTS speed/stability/style and script style (EVOLUTION.md). **Ask once; save to
   `channel-persona.<niche-id>.json`; confirm-don't-reask on later videos** (per-video override
   allowed).
3. **Length — always propose a specific number, never generate against a silent assumption.** Default
   to **long-form (~20 min / 1200s)**, matching CLAUDE.md's "20 min typical, 25 min maximum" and this
   user's standing preference (added 2026-07-31). State the proposed length as part of the single
   intake confirmation and wait for it to be approved along with everything else — don't bury it as an
   unstated default. **Exception, and flag it explicitly rather than silently picking a side:** if the
   channel's own niche file defines a fixed runtime that IS its brand identity (e.g. `ai-news`'s
   `hard_max_minutes: 3.5` — "AI Under 3 Min" is a literal promise in the name), that niche's own
   target wins; tell the user you're keeping the niche's short-form promise instead of defaulting long,
   don't quietly override it either way. Drives script word count and beat count (see Length control
   below).
4. **Goal** — followers / watch-time / authority / views-CTR (sets CTA strategy, EVOLUTION.md table).
5. **Audience** — beginners / practitioners / mixed (sets how much jargon script + title carry).
6. **Conversion target** — course / tool / repo / newsletter / nothing (used by `/packaging`).

Write the answers to `videos/<slug>/work/plan.json` (source, persona, delivery_mode, target_s, goal,
audience, conversion) so every downstream step and the app tiers can read one header.

**One-shot rule:** this is the ONLY point where the user is asked to decide anything before seeing
output. Once `plan.json` is written and confirmed, don't re-open settled questions (topic, length,
tone, goal) at a later stage — if the niche file already fixes a value (e.g. `niches/<id>.json`'s
`script.target_minutes`, `pacing`, `voice`), pull it in here and only surface it for confirmation,
don't re-derive it live at generation time. The gates in Stage D (script/preview/SFX) are for
spot-checking the single run in progress, not for producing alternate drafts to choose between — if
a gate fails, fix and re-run that one stage, don't branch into a second parallel video.

## Stage B — Plan + asset manifest (before any capture or script)

1. **Pick the slug** — from the domain (`review-riskmarshal`) or the topic (`video-<short>`), create
   `videos/<slug>/work/`.
2. **Draft the asset manifest** → `videos/<slug>/work/asset-manifest.json`. List every image/screenshot
   the video will need, and for each decide honestly whether *you* can get it:
   ```json
   {
     "project": "<slug>",
     "assets": [
       { "id": "hero", "kind": "screenshot", "purpose": "what-it-is beat",
         "source_url": "https://site.com", "source_label": "site.com, Jul 2026",
         "capture": "auto", "status": "pending", "path": "media/projects/<slug>/evidence/hero.png" },
       { "id": "x-reply-1", "kind": "image", "purpose": "react to a user's comment",
         "capture": "needs-you", "why": "social capture behind anti-bot/login is unreliable",
         "status": "pending-upload", "drop_to": "media/projects/<slug>/uploads/" }
     ]
   }
   ```
   - `capture: "auto"` — public web page you can screenshot with `tools/capture_evidence.py` /
     `tools/capture_web.py`. Capture these yourself.
   - `capture: "needs-you"` — anything you genuinely can't get (see Limitations). State the exact
     screenshot/file you need and where to drop it.
3. **Capture the auto set** now (real screenshots, real sources — the anti-hallucination spine).
4. **UPLOAD GATE (hard):** if any load-bearing asset is `needs-you`/`pending-upload`, **STOP and give
   the user a tight checklist** ("upload these 2 files to `…/uploads/`") before building shots. Don't
   fabricate a missing screenshot; cut the claim or wait for the upload.

## Stage C — Route to the entry skill

Delegate to exactly one, passing the plan.json header so it doesn't re-ask:
- **`/make-ad for <slug>`** — ad/commercial path (recon → evidence → PAS script → master). Use for
  anything meant to SELL, including client work. It carries its own 8-point agency checklist
  (3-second multimodal hook, pain agitation, 4+ real screenshots used across the ad, explicit
  differentiation beat, a memorable repeated line, niche-matched voice, music+SFX always).
- **`/review-site for <slug>`** — link path (recon → evidence → grounded script → master).
- **`/prompt-to-video for <slug>`** — topic path (you write script → TTS → master).
- **`/clean-cut for <slug>`** — raw footage (transcribe → cut filler/errors → master), then
  `/clean-audio` only if the audio is noisy.

Each produces the master + `edited-transcript.json` + an empty `timeline.json` and stops at its **script
gate**. Do not proceed past a gate without user approval.

**CLARITY GATE — run BEFORE the VO, every time, no exceptions:**

```
python tools/lint_script.py videos/<slug> --niche <niche-id>
```

It exits non-zero on a script that is too dense to follow, and it guards the most expensive step in
the chain (TTS + alignment + a full render, ~1h on a long-form piece). Fix the script and re-run
until it passes — do NOT generate a voiceover over a failing script, and do not "note it and carry
on". This exists because re-closing-costs (2026-08-02) shipped at reading grade 13.8 with 29-word
average sentences and the channel owner could not follow his own video; the whole 32-minute render
was wasted work. Enforces CLAUDE.md GROWTH RULES 6 and 7.

The gate cannot check whether an analogy actually lands, whether the surprise is genuinely
surprising, or whether the hook names a cost the viewer cares about — **that judgment is still yours,
and it is the part that decides whether anyone watches.** Read the script aloud before the gate, not
just through it.

## Stage D — Run the rest of the chain (honor every gate)

Track progress in `plan.json` (`stage:` field). Run in order:
1. **Visual Direction & Synthesis (`tools/visual_director.py`)** — automatically scan spoken narration in `edited-transcript.json`, synthesize syntax-highlighted code frames, spec cards, and real captures into `work/images/`, and map dense `beats.json` (max consecutive repetition <= 2, zero empty spans, high visual diversity).
   - **Judicious Veo 3.1 Generative Video Policy:** For key hero moments, generate up to **1–2 cinematic Veo video clips** (e.g. `tools/gen_veo_clip.py --prompt "..." --out work/images/veo-hook.mp4` for the 0–5s opening hook, and a midpoint architectural turn). The remaining 80–90% is high-density real evidence screenshots, code frames, and benchmark cards.
2. **`/make-tsx for <slug>`** or **`build_longform.py`** — build the visual beats synced to word times, update `timeline.json`/`beats.json`, render, and bake the preview (`tools/bake.py`). Spot-check composited frames at each cue.
3. **Preview gate** — show the baked preview; get a "looks good" before sound.
4. **`/suggest-sfx for <slug>`** — SFX pass (has its own hard user-audit gate). RMS-verify cues land.
5. **Music (optional)** — `tools/gen_music.py` + `tools/mix_music.py` for an auto-ducked bed; keep it under the voice.
6. **Viral Packaging (`tools/viral_packaging_engine.py`)** — brainstorm 5 viral archetypes (Superhero Metaphors, Threat, Catch, Benchmark Destruction, Urgent Command), score against the 100-point rubric, enforce **>= 90/100 CTR probability score**, and render high-contrast thumbnails.
7. **Quality Audit Gate (`tools/check_deliverable.py`)** — hard verification of loudness (-14 LUFS), captions, visual diversity (<=2 consecutive same image), real evidence count, and packaging score >=90.
8. **Upload** — `tools/yt_upload.py` uploads a **private draft only**. Publishing is the user's call.

## Length control

Duration is a first-class input. Convert and validate:
- **Word budget** ≈ `target_seconds × 2.4` spoken words (≈150 wpm), adjusted by delivery speed.
- **Structure by band:**
  | Band | Words | Beats | Shape |
  |---|---|---|---|
  | ≤ 90s (hook/promo) | ~140–220 | 6–9 | single arc, hook→payoff→CTA (RiskMarshal = 70s) |
  | 2–4 min (standard) | ~300–600 | 10–20 | sectioned; open a loop early, close it late |
  | 5 min+ (long) | ~750+ | 20+ | chaptered; strong sections + open loops or retention drops |
- **Validate after TTS:** master duration should land within ~±10% of target. If off, tighten or extend
  the script and regenerate — don't stretch pacing to fake a length.
- Longer ≠ better: more minutes = more shots to author (more time + cost) and higher retention risk.
  Recommend the shortest length that fully delivers the promise.

## Limitations & honesty (analyze capability, then ask — never fake)

Before promising a beat, check whether you can actually source it. Be explicit with the user when you
can't, and route it to them:
- **Can:** screenshot public web pages, read public text, generate VO + SFX + music (keys present),
  build any TSX visual, synthesize dark-mode IDE code frames (`visual_director.py`), generate high-definition
  video clips with **Google Veo 3.1** (`tools/gen_veo_clip.py`), and generate AI images with **Imagen 3**
  (`tools/gen_gemini_media.py image`).
- **Judicious Pro Media Budget:** Never flood an entire video with Veo/AI clips; keep to 1–2 strategic
  spots (0-5s hook & mid-turn) to preserve rate limits and preserve viewer trust.
- **Cannot reliably:** logged-in / paywalled captures, some social (X/Twitter) content behind
  anti-bot. If Gemini / Veo billing quota is exceeded, fall back to code frames and stat cards cleanly.
- **The move:** mark it `needs-you` in the asset manifest with a precise ask (the exact screenshot to
  take, the file to drop, or "enable billing then rerun this one command"). Never invent a screenshot,
  a number, or a source.

## Save back (the evolution loop — the realistic version)

"Gets better each video" = three compounding mechanisms, wired into this front door:
1. **Libraries compound** — `/suggest-sfx` and `/packaging` already save new SFX/thumbnail assets;
   make sure `used_in` is updated.
2. **`EVOLUTION.md` append (MANDATORY)** — capture hits/misses, delivery mode + voice, timing, cost/time.
   Tick any `Pipeline improvements needed` item this run completed.
3. **Persona memory** — if the user changed how it should sound, update `channel-persona.<niche-id>.json`.
4. **CTR calibration reminder** — once ~10 long-form videos have shipped, prompt the user to run
   `/packaging`'s `channel-calibration.md` so packaging rules get rewritten from their real click data.

## Done =

`plan.json` complete · asset manifest resolved (auto captured, needs-you uploaded, all claims sourced) ·
script user-approved · preview baked and spot-checked · SFX audited + mixed · packaging produced (>= 90 score) ·
**Anti-Slop QA Watchdog passed** (`python tools/auto_qa_remedy.py videos/<slug>`) ·
`check_deliverable.py` passed · private draft uploaded (or blocked steps clearly handed to the user) ·
`EVOLUTION.md` appended · `channel-persona.<niche-id>.json` current.

## Parallelizing a run (use subagents where stages are genuinely independent)

The chain in Stage C/D has real data dependencies — visual beats need the VO's word timing, SFX needs
the beats' timeline, the final mix needs SFX+music both rendered. Don't parallelize across a
dependency; it just produces work that gets thrown away when the upstream input changes. Where it
DOES help, use it:
- **Research/fact-gathering for the script** (Stage B/`/prompt-to-video`) — independent claims/sources
  can be verified by parallel subagents before scripting starts.
- **`/packaging`'s title+3 thumbnails** — can be drafted in parallel with `/make-tsx`'s beat-building
  once the script is locked, since packaging depends on the script, not the rendered beats.
- **Multi-story/compilation formats** (e.g. the `ai-news` compilation format's 8 segments) — independent segment
  research can run in parallel; the segments still get assembled into one script in order.
Rendering, TTS, alignment, and the final mix are compute/API-bound single passes — more agents don't
shrink that wall-clock time, only more parallel *research and drafting* does.
