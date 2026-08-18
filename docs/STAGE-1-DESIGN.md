# Stage 1 — the local self-serve app (design)

> Follows `VIDEO-OS-ROADMAP.md`. Written 2026-07-23, **after** the `/make-video` Director was
> validated end-to-end (the `open-source-ai-mid2026` run: prompt → recon → evidence → script → VO →
> master → 9 beats → baked preview, with real fact-checking and honest fallbacks).

## Locked decisions (2026-07-23)

1. **Product shape = co-pilot with checkpoints.** Not a fire-and-forget vending machine. The app runs
   the chain but **pauses at gates** for the human: script approval, preview check, SFX audit, and asset
   uploads it can't self-capture. Rationale: those gates are where quality and trust come from — they are
   what caught the hallucination risk and the bad capture in the validation run. Removing them lowers
   quality, not just friction.
2. **Providers = tiered (free floor + paid pro).** Every capability has a free fallback and a paid
   "pro" implementation. The app must run at $0 (edge-tts + proportional alignment + no image-gen) AND
   scale up to full quality when keys are funded (ElevenLabs voice, AssemblyAI timing, Gemini thumbnails).
   Rationale: today we hit all three paid walls at once; reliability must not depend on funded keys.

## The core insight from validation

The engine works. The remaining risk is **reliability, cost, and the human-gate UX** — not the AI.
So Stage 1 is three pieces, built in this order. **Orchestrator first, UI last.**

## Piece 1 — the Job state machine (the spine)

A video is a long, resumable **job**, not a function call. Model it explicitly (extend the existing
`plan.json` into job state):

```
INTAKE → PLAN+MANIFEST → [asset-upload-gate] → SCRIPT → [script-gate]
       → MASTER → SHOTS → BAKE → [preview-gate]
       → SFX → [sfx-audit-gate] → MUSIC → PACKAGING → [packaging-gate] → UPLOAD(draft)
```

- Each `[gate]` is a **pause state**: the runner executes until it, persists job state, emits a
  gate-event, and waits for a human decision (`approve | edit(notes) | stop`), then resumes.
- **Dependency-aware (this matters).** The DAG must know what invalidates what. The validation run
  exposed the key one: **VO → transcript(word times) → shot timing.** Regenerating the VO (e.g. free
  placeholder → paid ElevenLabs later) invalidates every beat's sync and must re-run the timing pass.
  Encode these edges so a change re-runs only what it must, not the whole video.
- Persist to `videos/<slug>/work/job.json` (supersedes the ad-hoc `stage` field). Resumable across
  restarts — a job can sit at a gate for days.

## Piece 2 — the Provider layer (tiered capabilities)

One interface per capability, ≥2 implementations, health-checked with auto-fallback + honest notes +
cost metering. Formalizes what we hand-did today.

| Capability | Pro (paid) | Free floor | Fallback trigger seen today |
|---|---|---|---|
| Voiceover | ElevenLabs (`tts.py`) | edge-tts (`tts_edge.py`) | ElevenLabs `quota_exceeded` |
| Word timing | AssemblyAI | proportional alignment | AssemblyAI key empty + edge WordBoundary = 0 |
| Thumbnails | Gemini (`gen_thumbnail.py`) | none (skip, concepts only) | Gemini image `limit:0` (billing off) |
| SFX / music | ElevenLabs SFX / `gen_music` | library-only (no new gen) | ElevenLabs quota |

Each provider reports `{available, tier, est_cost, quality_note}`. On fallback the job records the
tradeoff and surfaces it at the relevant gate ("VO is the free voice; fund ElevenLabs to upgrade + it
will re-sync the beats"). A **per-job cost meter** sums paid calls; a step that needs pro announces the
cost before spending.

## Piece 3 — the Gate protocol (UI-agnostic)

The orchestrator never talks to a terminal or a web page directly. It emits **gate events**:
`{ gate, presentation, options }` — e.g. `script-gate` → present the script + fact list, options
`approve|edit|stop`. Today *I* render those (chat + AskUserQuestion). Tomorrow a CLI renders them, then
a web UI renders them as cards. **Design this interface now** so the UI is a swap, not a rewrite. This
is what makes "orchestrator first, UI last" real.

## Build order

1. **Slice 1 — headless orchestrator (no UI).** Piece 1 + 2 + 3 as a CLI/Agent-SDK runner that
   reproduces the `open-source-ai-mid2026` run as a *resumable job with real gate pauses and tiered
   providers*. Proves the spine. Gates answered at the CLI.
2. **Slice 2 — web shell.** A thin web UI that subscribes to gate events and renders approve/edit/upload
   cards + a job dashboard + the cost meter. No new creative code.
3. **Slice 3 — hardening** toward Stage 2 (accounts, queue, storage, billing) per the roadmap.

## Deferred (not Stage 1)

Multi-user accounts, hosted queue, billing/metering UI, AI b-roll/video generation. And: fund the paid
providers whenever full-quality output is needed — Slice 1 runs on the free floor by design.
