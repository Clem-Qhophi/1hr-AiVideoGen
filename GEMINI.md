# GEMINI.md — Standing Operational Rules & Generative Standards

This document establishes permanent operating rules across all sessions, conversations, and agents for this repository.

---

## 1. STRATEGIC & JUDICIOUS GENERATIVE MEDIA POLICY (VEO & GEMINI)

The user is a Pro subscriber, but generative video (Veo 3.1) and image (Imagen 3 / Gemini) APIs have quota limits, token costs, and rate limits. **We NEVER saturate an entire video with AI-generated video or images.**

### The Right Time & Right Place Rule:
- **Maximum 1 to 2 Veo Video Clips per Video (5–10s total runtime):**
  - **Spot 1 (Beat 0 / The Hook, 0–5s):** 1 high-impact cinematic Veo clip to visually establish the opening metaphor (e.g. superhero speed, lightning, exploding quantum chip).
  - **Spot 2 (Mid-point Core Turn / Climax):** 1 Veo clip or custom AI visual to illustrate an abstract technical architecture or disruption where no real screenshot exists.
- **The Remaining 80–90% of the Timeline:**
  - **Real Evidence Screenshots:** Official announcements, benchmark repos, live pricing tables, GitHub pages.
  - **Syntax-Highlighted IDE Frames:** High-contrast dark-mode Python/TS code editor mockups (`tools/visual_director.py`).
  - **Benchmark Spec Cards:** High-contrast comparison cards generated via `tools/gen_spec_cards.py`.
- **Generative Media Tools:**
  - `tools/gen_veo_clip.py --prompt "..." --out work/images/veo-hook.mp4 --aspect 16:9`
  - `tools/gen_gemini_media.py video --prompt "..." --out work/images/veo-turn.mp4`
  - `tools/gen_gemini_media.py image --prompt "..." --out work/images/hero-art.png`
  - If quota `429 RESOURCE_EXHAUSTED` occurs, gracefully fallback to local Remotion code stills and IDE syntax frames without failing the render.

---

## 2. 1M-VIEW VIRAL PACKAGING & >= 90 PROBABILITY SCORE GATE

Every video must be packaged for **1 Million Views** using extreme curiosity, disruption hooks, and high-contrast visuals.

- **Tool:** `tools/viral_packaging_engine.py brainstorm videos/<slug> --min-score 90`
- **5 Viral Archetypes:**
  1. *Superhuman Speed / Superhero Metaphor* ("This AI is So Fast It Feels Like Cheating (Gemini 3.7 Flash)")
  2. *Competitor Threat / Industry Shock* ("RIP Claude? Google's New Model Just Destroyed Coding Benchmarks")
  3. *The Catch / Pricing Glitch* ("Google's 50% Price Cut Has a Massive Catch")
  4. *David vs. Goliath Benchmark Destruction* ("65.3% on SWE-Bench for $0.75?! Google Just Broke AI")
  5. *Urgent Direct Command* ("Do NOT Code Another Line Until You See This")
- **100-Point Rubric Gate:**
  - Curiosity Gap (25 pts), Emotional Stakes (20 pts), Mobile Glanceability (20 pts), Visual Metaphor (15 pts), Title-Thumb Synergy (10 pts), Entity Velocity (10 pts).
  - **Strict Gate:** No title or thumbnail is approved unless it scores **>= 90/100**.

---

## 3. ZERO BLANK SPACES & VISUAL DENSITY ENFORCEMENT

- **Tool:** `tools/visual_director.py plan videos/<slug>`
- **Rules:**
  - Every 2.5–3.5s beat is mapped to a specific visual matching the exact spoken narration in `edited-transcript.json`.
  - **Max consecutive identical asset <= 2 beats (<= 6s max)**.
  - **Minimum unique visual assets >= 10 distinct assets** across the video.
  - Generic solid/gradient background spans (`rm-bg-*.png`) restricted to **<= 15%** of total timeline beats.

---

## 4. AUTONOMOUS ANTI-SLOP WATCHDOG & BATCH REMEDIATION LOOP

Never deliver or present a video without running the autonomous defect detection and batch self-remediation loop:
```powershell
venv\Scripts\python tools/auto_qa_remedy.py videos/<slug>
```
- **Unified Diagnostic Sweep**: Scans ALL 5 vectors at once (Visuals, Audio, Captions, Packaging, Assets) to aggregate all defects into one diagnostic sheet.
- **Single-Pass Batch Healing**: NEVER fix issues piecemeal (which causes wasteful duplicate renders). All pre-render assets, captions, and packaging fixes are generated together, followed by ONE consolidated video render pass (`build_longform.py`) and ONE audio remaster (`final_mix.py`).
- **Zero-Defect Verification**: Confirms 0 defects remain across all vectors.

---

## 5. DEFINITION OF DONE & PRE-FLIGHT AUDIT

Never upload or mark complete until both gates pass:
```powershell
venv\Scripts\python tools/auto_qa_remedy.py videos/<slug>
venv\Scripts\python tools/check_deliverable.py videos/<slug> --file videos/<slug>/output/<slug>-MASTER.mp4
```
All checks must output `[PASS] SHIPPABLE` and `[PASS] No defects found.`
