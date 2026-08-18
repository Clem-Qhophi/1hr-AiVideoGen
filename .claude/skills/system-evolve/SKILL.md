---
name: system-evolve
description: The self-improvement layer for this pipeline — turns a repeated manual step, a user correction, a new standing rule, or a lesson learned mid-task into a durable change to the repo itself (niche JSON, a tool, a reusable Remotion lib, a skill's SKILL.md, or EVOLUTION.md), so the next run is faster and doesn't repeat the same fix. Use at the end of any video-production task, whenever the user corrects the same category of mistake twice, whenever they say "always / every time / from now on / never again", or whenever a workaround was improvised mid-task that will recur. Not for one-off facts about this session (that's Claude's own memory) and not a replacement for EVOLUTION.md's per-video lesson log — this decides WHERE a lesson belongs and makes the edit, EVOLUTION.md is one of its possible destinations.
---

# system-evolve — close the loop on every session

This repo's rule (CLAUDE.md, `[[always-improve-the-system]]`) is that every session leaves the
pipeline better, not just the one-off ask delivered. This skill is what makes that a checked step
instead of good intentions: **don't end a task with a lesson sitting only in the chat reply or in
Claude's memory — encode it in the repo, in the right layer, before calling the task done.**

## When to run this

- At the end of any skill run where something had to be figured out, corrected, or improvised.
- The user corrects the same *category* of mistake a second time (the first time is a fix; the
  second time is a missing rule).
- The user says anything like "always do X", "every video must Y", "never do Z again", "from now on".
- A manual workaround was needed mid-task (a retry, a fallback, a re-render) that will recur on the
  next video too.
- A new niche, format, or channel is introduced (as with `ai-news` → `AI under3 Minutes` on
  2026-07-30 — corrected a wrong 8-20min target and added a mandatory CTA + recency guard directly
  in `niches/ai-news.json` rather than leaving it as a chat instruction to re-derive next time).

## Step 1 — check it isn't already solved

Before writing anything, check whether this exact lesson already exists:
- `grep -i "<keyword>" EVOLUTION.md`
- `grep -i "<keyword>" niches/*.json .claude/skills/*/SKILL.md`

Repeating a lesson that's already encoded (and just wasn't read) means fixing the *reading* habit,
not adding a duplicate. If it's genuinely new or the encoded version was wrong, proceed.

## Step 2 — pick exactly ONE destination layer

Pick the most specific correct layer. Do not scatter the same rule across two files — one is the
source of truth, others may reference it.

| The lesson is about... | Goes in... | Example |
|---|---|---|
| A channel/audience's formula: title, structure, CTA, voice, imagery, pacing, honesty/recency rules | The niche file, `niches/<id>.json` | `ai-news`'s `script.brand_promise`, mandatory close-beat CTA, `recency_guard` |
| The channel's visual identity: palette, fonts, wordmark, motion energy | `brand.md` + `remotion/src/brand.ts`/`fonts.ts` | via `/brand-setup`, not a one-off tweak |
| A reusable visual technique or component | `remotion/src/lib/*.tsx` | `atmosphere.tsx`, `evidence.tsx`, `screencast.tsx` |
| A reusable multi-step process | a script in `tools/` | `plan_runtime.py`, `check_deliverable.py` |
| A cross-cutting convention for HOW to work a step, true across niches | that step's `.claude/skills/<name>/SKILL.md` | the voice→vertical table in `make-ad/SKILL.md` |
| A one-off gotcha, measured number, or bug workaround from a specific video | `EVOLUTION.md`, new dated section, appended — never delete past lessons | the edge-tts `VoicePersonalities` tag lesson |
| A durable fact about the user/project not visible in code (goals, decisions, external constraints) | Claude's own memory system | agency direction, provider credit status |

If a rule is genuinely general-purpose (not niche-specific), it may belong in `CLAUDE.md` itself —
reserve that for things that change how *every* video is made, not one channel's formula. Niches are
data specifically so channel-specific rules don't have to touch code or global instructions.

## Step 3 — make the edit now, not later

Write the change as part of finishing the current task, in the same turn if possible. A lesson that
exists only as a spoken explanation to the user gets re-derived (or missed) on the next session; a
lesson written into the repo is enforced the next time that niche/skill/tool runs, by anyone, with
no chat history required.

## Step 4 — say what changed, briefly

One or two lines to the user naming the file touched and the one-sentence rule now encoded — not a
essay, this is a byproduct of the real task, not the deliverable.
