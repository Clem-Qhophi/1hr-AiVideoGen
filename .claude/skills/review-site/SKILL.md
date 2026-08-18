---
name: review-site
description: The website-review Director — turn a URL (plus an optional angle) into a grounded, evidence-first review or walkthrough video, read-only. Use when the user wants to "review a website/product", "make a review video of <site>", "do a walkthrough/tutorial of <tool>", "screenshot and narrate a site", or points at a URL and wants a video about it. It does recon + real-screenshot capture + fact-grounded scripting, then hands to the existing chain (tts → make_master → /make-tsx → /suggest-sfx → /packaging → yt_upload). Read-only by default; logged-in walkthroughs are human-in-the-loop and never enter credentials. Not for raw-footage editing (/clean-cut) or pure topic generation with no site (/prompt-to-video).
---

# review-site — the website-review Director

Turn a URL into a branded, engaging, **evidence-first** review or walkthrough video —
no camera, no invented facts. This skill is the *front of the funnel*: it does recon,
captures real screenshots with sources, grounds a script in what it actually saw, then
**delegates** the rest to the pipeline that already works (`/prompt-to-video`'s TTS +
`make_master`, then `/make-tsx`, `/suggest-sfx`, `/packaging`, `yt_upload`). It does not
re-implement any of them, so it can't drift from the real engine.

Think of it as encoding the "Director" for one vertical. The renderer, voice, master, and
evidence components already exist — this skill supplies the *judgment* that drives them.

## The one hard rule: no claim without captured evidence

**Every factual on-screen claim — a price, a plan name, a limit, a headline, a quote — must
trace to a screenshot in the evidence manifest with a real source.** If you couldn't capture
it, you can't say it. This single discipline is what separates a trustworthy channel from
AI slop, and it's exactly the miss the `gemini-release` post-mortem flagged in `EVOLUTION.md`.
When in doubt, cut the claim.

Evidence hierarchy (from `EVOLUTION.md`): real screenshot > real-UI TSX clone > animated card.

## Read first (every run)

- **`EVOLUTION.md`** — delivery modes, voice library (with IDs), goal-aware CTA table,
  evidence hierarchy, and past lessons. Apply them; append to it when done.
- **`brand.md`** + `remotion/src/brand.ts` / `fonts.ts` — voice, colors, motion, delivery tokens.
- **`videos/gemini-release/`** — the reference evidence-style project (its `work/script.md`,
  `work/edit-plan.md`, and `remotion/src/shots/gemini-release/Evidence*.tsx`). Mirror it.
- **`.claude/skills/prompt-to-video/SKILL.md`** — you reuse its steps 4–8 verbatim. Don't duplicate.
- **`remotion/src/lib/evidence.tsx`** — the real props:
  `EvidenceBrowser({ image, url, source?, label?, appearAt?, scale? })` (screenshot in browser
  chrome) and `EvidenceFrame({ image, source, label?, appearAt?, highlight?{x,y,w,h in %}, scale? })`
  (screenshot in a frame with an optional highlight box). `image` is relative to `media/`.

## Intake (ask once, in one small batch, then go)

1. **URL(s)** — the target site (and any specific sub-pages worth showing).
2. **Angle / goal** — honest review? enthusiastic? tutorial/walkthrough? comparison? (sets the
   script template + the goal-aware CTA from `EVOLUTION.md`: followers / watch-time / authority / CTR).
3. **Delivery mode** — `sarcastic-review` · `authoritative` · `calm-explainer` · `breaking-news`
   (sets TTS speed/stability + pacing; see `EVOLUTION.md`).
4. **Length** — default 60–90s for the first one; scale up once the loop is proven.
5. **Login needed?** — if the point requires auth, switch to human-in-the-loop (see Safety).
   Default is read-only public pages.

## Pipeline

Let `P = videos/<slug>` (slug from the domain, e.g. `videos/review-riskmarshal`). Create `P/work/`.

### 1. Recon (read-only browse) → `P/work/facts.json`
Open the site in the browser (Claude Browser or Playwright). Visit the key surfaces: landing,
pricing, the 2–3 flagship features, docs/changelog, and — if public — one real product screen.
For each, read the visible text (`get_page_text`) and extract the **real specifics**: prices,
plan names, limits, headline claims, launch dates. Write:
```json
[
  { "claim": "Pro plan is $29/mo", "value": "$29/mo",
    "source_url": "https://site.com/pricing", "source_label": "site.com/pricing",
    "evidence": "pricing-pro" }
]
```
Each entry names the screenshot (`evidence`) that will prove it in step 2. **Can't verify a
number → drop the claim.** This file is the anti-hallucination spine.

### 2. Capture evidence (real screenshots)
For each fact and each screen you'll show, capture with the existing tool. Prefer element
captures (`--selector`) for a specific claim (a pricing card, a feature row); full-page or
viewport for hero shots and scroll reveals.
```
venv/Scripts/python tools/capture_evidence.py --url "<url>" --project <slug> \
  --name "<evidence-name>" --source "<Site>, <Mon YYYY>" \
  [--selector "css"] [--full-page] [--scroll N] [--wait 3000]
```
Saves to `media/projects/<slug>/evidence/<name>.png` (+ `manifest.json`). The `<name>` **must
match** the `evidence` field in `facts.json`.

### 3. Grounded script → `P/work/script.md`  ·  HARD GATE
Write the narration using the **Review** or **Website/tool walkthrough** template from
`/prompt-to-video`. Rules:
- Every factual sentence maps to a `facts.json` entry. **No invented specifics.**
- Include 1–2 honest limitations (the Review template's "The bad") — credibility is the product.
- Write for the ear: short sentences, conversational, **no em-dashes** (brand rule), brand voice.
- Header line: goal + delivery mode + target length.
- **STOP** and show the user the script *plus* the fact/evidence list before generating audio.
  This is a hard gate, same as the cut review in `/clean-cut`.

### 4–5. Voice + master (reuse `/prompt-to-video` exactly)
`tools/tts.py` with the delivery-mode flags from `EVOLUTION.md` → `voiceover.mp3` +
`edited-transcript.json`. Then `tools/make_master.py <P> --bg dark` → `reference/master.mp4` +
an empty `timeline.json`. (No camera, no AssemblyAI. Needs `ELEVENLABS_API_KEY`; `tools/tts_edge.py`
is the free fallback if there's no key.)

### 6. Evidence-first edit plan → `P/work/edit-plan.md`
Every beat is a full-screen cutaway (no talking head). Map script sections → beats, and drop an
`EvidenceBrowser` / `EvidenceFrame` cutaway at the **exact word time** each claim is spoken
(grep `edited-transcript.json` for the phrase → start ms → local frame = `(cue_s − master_in_s) × fps`).
Interleave branded `BigStatement` / `CreditsStat` beats for the hook, transitions, and verdict.
Follow the `/make-tsx` principles P1–P5 (sync to words; don't pre-empt; real info → real page).
- Claim about the site → `EvidenceBrowser` (site chrome + URL) or `EvidenceFrame` with a
  `highlight` box on the exact line.
- A price / number → a `CreditsStat`-style beat backed by the pricing screenshot.
- Hook / verdict → `BigStatement`.

### 7. The anti-boring pass (bake these into the edit plan)
This is what stops it being a white screen with one word:
- **Beat density** — something visibly changes every 2–4s (breaking-news 2–3s, calm 4–5s). No static hold > ~5s.
- **Motivated motion** — zoom/pan *to* the highlighted line as it's spoken (`EvidenceFrame` highlight + scale).
- **Evidence over text** — show the real screenshot when the claim lands, never a lone word card.
- **Variety** — alternate evidence cutaway / stat beat / statement / (optional) fake-screencast. Never the same visual > ~8s.
- **SFX punctuation** — a soft whoosh/click on each reveal (leave beats clean; `/suggest-sfx` adds them).
- **Pacing curve** — hook hard in the first 3s; land on the verdict + a goal-aware CTA at the end.

### 8. Hand to the existing chain
- `/make-tsx for <slug>` — builds the Evidence/statement shots, updates `timeline.json`, renders,
  bakes the preview. (For a multi-page click-through walkthrough, capture the pages with
  `tools/capture_web.py` and use the `/fake-screencast` technique.)
- `python tools/bake.py <P>/work/timeline.json` → `P/output/<slug>-preview.mp4`. Spot-check
  composited frames at each evidence cue.
- `/suggest-sfx for <slug>` — sound design (has its own user-audit gate).
- `/packaging for <slug>` — title + 3 thumbnails.
- `tools/yt_upload.py` — uploads a **private draft**. Publishing is the user's call, not the agent's.

### 9. Update `EVOLUTION.md` (mandatory)
Append: capture hits/misses, pacing, delivery mode + voice used, timing issues, total cost/time.
Tick `[ ] Website review capability` once the first one ships.

## Safety + honesty (read-only by default)

- **Default is READ-ONLY:** navigate public pages, screenshot, narrate. No logins, no form
  submits, no clicking irreversible controls (send / pay / delete / change settings).
- **Logged-in walkthroughs are HUMAN-IN-THE-LOOP:** the user stays signed in on their own
  browser; the agent plans the shot list and captures, but **never types passwords or 2FA** and
  never performs account actions on the user's behalf. Many SaaS forbid automation — respect
  `robots.txt` / ToS; if a site blocks capture, ask the user to screenshot it manually.
- **Reviews must be fair:** include real limitations, attribute every quote, and never fabricate
  a screenshot or a number. Unverifiable → cut.

## Done =
`facts.json` fully sourced · script user-approved with every claim backed · evidence captured ·
shots render and are screenshot-verified at each cue · preview baked and spot-checked ·
`EVOLUTION.md` updated.
