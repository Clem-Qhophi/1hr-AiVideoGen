# Handoff prompt — paste this whole file as your first message to a new agent

Written 2026-08-08 by a Claude Code session, for whichever agent (Antigravity, a future Claude
Code session, or anything else) picks this repo up next. Read this file completely before touching
anything. Then read `CLAUDE.md` completely — this file is orientation, `CLAUDE.md` is the actual
constitution.

## What this is

A working, multi-channel YouTube automation pipeline — not a prototype. It has produced 30 video
projects across 5 real YouTube channels, 7 of them fully mastered and uploaded (currently all
private, awaiting the human owner's manual publish — see "Publishing" below, this is deliberate).
It runs on $0 in paid APIs by design (free-tier/local tools only, see "Providers"). You are not
starting fresh and you are not prototyping — you are continuing production work with real
consequences (real channels, real OAuth tokens, real upload history).

**Do not treat this as a blank slate.** If a request seems to call for scaffolding something that
already exists (a new "video pipeline," a "channel config system," a "publishing script"), stop and
look for it first — it is almost certainly already built, in `tools/`, `director/`, or
`.claude/skills/`. Duplicating it instead of finding it is the single most likely way to waste a
session here.

## Read these, in this order, before doing anything else

1. **`CLAUDE.md`** (repo root) — the actual rulebook. Pipeline order, hard conventions (run from
   repo root, venv required, media rules, QA gates), GROWTH RULES (non-negotiable per-video
   requirements), INTAKE rules (ask everything up front, never ask "should I add captions" at the
   end), niche runtime table, provider policy. Everything below is a summary; `CLAUDE.md` is
   authoritative if anything here conflicts with it.
2. **`docs/IMPROVEMENT-QUEUE.md`** — what's DONE (and why, and where it's enforced) vs. OPEN
   (the real backlog, with reasoning). Read the OPEN section before picking a next task; don't
   re-propose something already listed there.
3. **`EVOLUTION.md`** — a dated lesson log per video. Skim the last ~5 entries for recent gotchas
   (disk-full crashes from concurrent sessions, ffmpeg filter bugs, encoder speed findings). Append
   to it, never delete from it.
4. **`niches/*.json`** + **`channel-persona.<niche>.json`** — the 5 channels are DATA, not code.
   Never hardcode a channel's voice/formula into a tool; edit or add a profile instead.
5. **`.claude/skills/*/SKILL.md`** — one file per pipeline stage (cut, visuals, audio, SFX,
   packaging, etc.), written as step-by-step procedure, not Claude-Code-specific. You don't have
   Claude Code's `/skill-name` invocation mechanism, but every one of these is a plain markdown
   runbook — read the relevant one before doing that stage's work by hand.

## The memory/persistence issue this file exists to fix

The user tried a different agent (this one, and earlier a Claude Code session) and separately
Antigravity, worried that context — "what's already been decided, what's already been tried, what
each channel is called" — only lived in one tool's private chat memory and wouldn't transfer. That
worry is **correct for chat memory, and irrelevant for this repo** — because this pipeline was
already built to solve exactly that problem: `CLAUDE.md`, `EVOLUTION.md`,
`docs/IMPROVEMENT-QUEUE.md`, `docs/VIDEO-OS-ROADMAP.md`, and the niche/persona JSON files are the
**actual** source of truth, not any agent's chat history. If a decision, a lesson, or a standing
rule isn't written into one of those files, it effectively doesn't exist for the next session —
regardless of which agent made the decision.

**The obligation this places on you:** when you learn something non-obvious, fix a bug twice, or
get corrected by the user, write it into the right one of those files before ending the session —
the same way `.claude/skills/system-evolve/SKILL.md` instructs Claude Code to. Don't leave it only
in your own conversation. If you're not sure where it belongs: a channel-specific fact goes in that
channel's persona/niche JSON or `docs/CHANNEL-SETUP-<niche>.md`; a pipeline lesson goes in
`EVOLUTION.md`; a new standing rule goes in `CLAUDE.md`; an open problem goes in
`docs/IMPROVEMENT-QUEUE.md`.

## Git — new as of this session, use it

This repo had **no version control until 2026-08-08** (baseline commit `a2c02a4`, current HEAD
`b25f679` at time of writing). That's the real reason nobody — including the user — could tell what
a previous agent session had changed. It's fixed now: **commit your own work in small, honestly
described commits as you go**, the same way you would in any other git repo. Don't force-push,
don't rewrite history, don't `git reset --hard` without checking `git status` first — standard
care, nothing repo-specific. If you're a coding agent with its own auto-commit behavior, let it
run; just don't disable or bypass it here.

## Environment specifics (don't rediscover these the hard way)

- **Run every tool from the repo root**, e.g. `python tools/render_cuts.py videos/video-1 …` — not
  from inside `tools/` or `videos/`. Engine paths resolve relative to the tool; project paths
  resolve relative to your CWD.
- **Python needs the venv at repo root** (`venv/Scripts/python` on Windows). A bare `python` that
  resolves to a system interpreter will `ModuleNotFoundError` on `requests`/`Pillow`/`google-*` —
  that error means you're not on the venv, not that a dependency needs installing.
- **`ffmpeg`/`ffprobe` and `node`/`npx` must be on PATH.** They are not pip packages.
- **The Remotion registry is generated, not committed**: after adding/renaming a shot, run
  `cd remotion && npm run gen` — render/frame scripts do not do this for you.
- **`.env` already exists at repo root** with these keys configured (values withheld here
  deliberately — read the file yourself, never print or paste key values into chat/logs):
  `ASSEMBLYAI_API_KEY`, `ELEVENLABS_API_KEY`, `GEMINI_API_KEY`, `PEXELS_API_KEY`, `YOUTUBE_API_KEY`.
  Do not ask the user to re-supply these. `PIXABAY_API_KEY` is the one commonly-referenced key that
  is NOT set — mention it if a task needs it, don't silently skip the fallback.
- **YouTube upload/stats auth is OAuth, not a key, and is already partially set up on this
  machine.** `.youtube/` (git-ignored, untouched by the new git baseline) holds
  `client_secret.json` plus cached tokens: `token-home-hacks.json`, `token-real-estate.json`, and
  an unsuffixed `token.json` (the original/ai-news channel, from before the multi-token convention
  existed). **These already work — do not re-run OAuth for a channel that already has a token
  file.** If you need to upload to `finance` or `entertainment` for the first time, running
  `python tools/yt_upload.py auth` (or the stats equivalent, `yt_stats.py auth`) will open a real
  browser on this device for the user's own Google login — that's expected and fine, it's the
  user's own machine and own YouTube account, not a credential you're handling on their behalf.
  **Authorizing the wrong channel in that browser flow overwrites that niche's token file with no
  warning** — if you're not certain which channel the browser session is logged into, stop and ask
  the user rather than guessing.

## Current state (snapshot at 2026-08-08 — re-verify before trusting exact numbers, this pipeline
## produces new videos autonomously between sessions)

**5 channels, all defined in `niches/*.json` + `channel-persona.<id>.json`:**

| Niche id | Channel name | OAuth token present | Voice |
|---|---|---|---|
| `home-hacks` | The Forgotten Fix (narrator: "Walt Combs") | yes (`token-home-hacks.json`) | en-US-AndrewNeural |
| `ai-news` | AI Under 3 Min | yes (`token.json`, original/unsuffixed) | en-US-AndrewNeural |
| `finance` | The Money Archive | no | en-US-GuyNeural |
| `real-estate` | The Closing Table | yes (`token-real-estate.json`) | en-US-JennyNeural |
| `entertainment` | The Untold Record | no | TBD — validate via `edge_tts.list_voices()` before first video |

(`niches/robotics-news.json` is deprecated — it was merged into `ai-news` as a "compilation" format,
see that niche's `formats` block. It is not a 6th channel.)

**Production status:** 30 project folders under `videos/`. 7 have `packaging/published.json`
(meaning `yt_upload.py` actually pushed them to YouTube) — **all 7 are still `privacy: "private"`**.
This is a known, standing situation, not a bug: uploads default to private by design (an unaudited
Google Cloud project cannot publish public via the API at all — see
`docs/IMPROVEMENT-QUEUE.md` R4), and the channel owner reviews and flips each one to public
personally in Studio, at **most one per channel per day** (see `CLAUDE.md` GROWTH RULES intro —
this cadence rule was only found written down in one project's file note before this session;
it's now in `CLAUDE.md` where it belongs). **Before concluding anything about channel growth or
performance, check each channel's actual public/private videos in Studio or via
`published.json`'s `privacy` field — a flat subscriber count on a channel with zero public videos
is not a content signal.**

**A live/background process may still be running.** While auditing this repo, files were observed
changing in real time — a new project (`burnt-pan-truth`, home-hacks) went from in-progress to
fully mastered and uploaded, new SFX clips were generated, cache segments were deleted mid-session.
`EVOLUTION.md` documents this exact hazard (concurrent sessions sharing one disk/repo). **Before
assuming a project is idle or a file is stale, check its mtime. Before deleting anything that looks
like scratch/cache, confirm no other process is mid-write on it** (matching mtimes across sibling
projects is the tell used previously — see the `re-escrow-shortage` / `re-city-down-payment`
EVOLUTION entry).

## Fixed this session (2026-08-08), for the record

- `videos/money-archive-401k-fee/work/facts.json` had a missing comma between two array entries —
  broke JSON parsing for that project. Fixed.
- Git initialized for the first time; `.gitignore` extended to exclude `work/_lf/` (longform beat
  cache) and `work/videos/*.mp4` (stock video clips) as regenerable heavy artifacts, matching the
  repo's existing policy for `work/audio/`, `work/render/`, `output/`.
- The one-video-public-per-day cadence rule (previously buried in one file's note) is now
  documented in `CLAUDE.md`.
- A stray duplicate project folder (`burnt-pan-truth/` at repo root, containing only an early
  `work/spec.json` — superseded by the real, fully-produced `videos/burnt-pan-truth/`) was found
  but not removed (blocked by a permission guard in the auditing session). It's harmless clutter;
  safe to delete once confirmed it isn't mid-write by another process.
- Everything else audited clean: all Python tools compile, all JSON in `niches/`, `videos/`, and
  `docs/research/` parses (one file's original "invalid JSON" reading during audit was a test-script
  encoding bug, not a real file problem — re-verify with `encoding='utf-8-sig'` on Windows, not a
  bare `open()`, since these files carry a UTF-8 BOM).

## Non-negotiables (violating these is the fastest way to lose the user's trust in the output)

- **Never claim a team, staff, or capability that doesn't exist.** Say the true version of the
  promise instead.
- **Every niche has an `honesty_guard`.** Soften a claim, never fabricate a source. Numbers must
  come from an actually-read primary source (WebFetch/browser/direct read), never a search-summary
  alone.
- **A cut is not a video.** Deliverable = cut + word-synced captions + motion + SFX/music + final
  mix, produced in one pass, verified by `tools/check_deliverable.py`. Never ask "should I add
  captions" after delivering — that's asking permission to finish the job.
- **Ask the full brief up front (niche, runtime, topic, angle), then don't ask again until done.**
  Runtime is computed via `tools/plan_runtime.py`, never guessed.
- **Single thumbnail per video**, not 3 A/B/C bets (standing preference, changed from the older
  3-bet default — `.claude/skills/packaging/SKILL.md` reflects this).
- **Real captured screenshots, not just code-rendered cards**, for any factual/numeric claim —
  `tools/capture_evidence.py`.
- **$0 providers only**: `edge-tts` for voice, AssemblyAI for transcription/alignment, code-rendered
  (not Gemini-generated) thumbnails. If Antigravity's own image generation is tempting to use here —
  it's fine for genuinely new capability (e.g. filling a real gap like an avatar alt-pose, which the
  user separately approved enabling Gemini billing for), but it does **not** replace the
  evidence/screenshot requirement above for factual content, and it does not override the niche's
  `honesty_guard`.

## What NOT to do without asking the user first

- Flip anything from `private` to `public` on YouTube — that's the user's call, one video per
  channel per day, done personally in Studio.
- Re-authorize OAuth for a channel that already has a working token file.
- Force-push, rewrite git history, or run any destructive git command.
- Delete anything you didn't create this session without first checking it isn't mid-write by
  another process (see "live/background process" above) and isn't already-produced work.
- Spend money / enable paid tiers on any provider (this pipeline is $0-by-design; the one exception
  — Gemini billing for avatar image editing — was an explicit, separate user decision, not a
  standing green light).

## Suggested first move

Read `docs/IMPROVEMENT-QUEUE.md`'s OPEN section and ask the user which item (or which new video) to
work on next — don't assume. If the user's request doesn't map to an existing skill/tool, search
`tools/` and `.claude/skills/` before building something new; this pipeline is large enough that the
thing you're about to build usually already exists in some form.
