# director — the headless orchestrator (Stage 1, Slice 1)

The spine of the AI Video OS app. Turns the `/make-video` Director skill into a **resumable,
dependency-aware job runner** with a **tiered provider layer** and a **UI-agnostic gate protocol**.
Orchestrator-first, UI-last: this package is what a CLI (now) and a web app (later) both drive.

Design + decisions: `docs/STAGE-1-DESIGN.md` (co-pilot with checkpoints · tiered free/paid providers).

## Run it

```bash
venv/Scripts/python -m director providers            # live health of every capability (pro + free)
venv/Scripts/python -m director status <slug>        # the job's stage table, detected from disk
venv/Scripts/python -m director run <slug>           # dry: print the plan up to the next stop
venv/Scripts/python -m director run <slug> --go       # execute deterministic stages; stop at agent/gate
venv/Scripts/python -m director run <slug> --go --agent   # also drive creative stages via the Agent SDK
venv/Scripts/python -m director.web                   # Slice 2: web UI at http://127.0.0.1:8770
```

## Slice 2 — the web UI (`web.py` + `web_ui.html`)

A dependency-free stdlib HTTP server that renders the **gate protocol** as a dashboard: provider health
(tiered), every project's stage pipeline (detected from disk), a **Run next** button that advances one
stage per click, **gate cards** with inline preview playback (the baked mp4) and the assembled Agent-SDK
plan for creative stages, and the cost meter. It reuses the same orchestrator core — `web.py` is only a
renderer + a thin JSON API (`/api/providers`, `/api/jobs`, `/api/jobs/<slug>`, `POST …/run`,
`/api/artifact`). No new creative code. Artifact serving is path-guarded to the repo root.

**Background runs + streaming (SSE).** A run is a **server-side worker thread**, not a request — it is
decoupled from any browser tab. `start_run(slug)` advances the next stage in a daemon thread, appending
`{type:"log"}` events to an in-memory buffer (deterministic stages stream subprocess output line-by-line
via `engine.popen_stream`, so you watch ffmpeg/render progress; agent stages stream the SDK's text/tool
events). One active run per slug (`start_run` is idempotent).

Clients merely **subscribe**:

| Endpoint | Behavior |
|---|---|
| `POST /api/jobs/<slug>/run` | fire-and-forget: start the run, return immediately |
| `GET …/run-stream?start=1` | start if idle, then subscribe (the **Run next** button) |
| `GET …/run-stream` | attach only if active; if the run already finished, replay its log + result; else `{idle:true}` |

A subscriber **replays the buffer from the beginning, then tails** — so closing the tab does not stop the
run, and reopening re-attaches and catches up (multiple viewers work too). Heartbeat `ping` frames keep
the socket alive and detect disconnects; a dropped viewer never kills the worker. The UI auto-re-attaches
when `running` is true and shows a ● running badge. `engine.py` is the single source of truth for the
deterministic stage commands.

**Persistence.** Every run is also written to `videos/<slug>/work/runs/<run_id>.jsonl` — one JSON object
per line (`meta` → `log`* → `done`), flushed per line, so a crash keeps everything emitted up to that
moment. On boot the server calls `load_runs()` to restore the most recent run per project (it prints
`restored N persisted run log(s)`), and `job_detail` exposes a `last_run` summary the UI shows with a
**view log** button that replays it from disk.

A restored run whose log has **no `done` line** is reported as **`interrupted`**, never as still-running —
its worker died with the previous process, so claiming otherwise would be a lie. The UI shows an amber
"run interrupted" card explaining the log was recovered from disk and the stage can be retried. Old logs
are pruned to the last `RUNS_KEEP` (20) per project.

## The three pieces

- **`providers.py`** — one interface per capability (voiceover, word_timing, thumbnails, sfx, agent),
  each with a PRO (paid) and FREE impl. Health-checked live (e.g. ElevenLabs credit balance), auto-
  selects pro→free, carries a cost meter. Formalizes the fallbacks `/make-video` did by hand.
- **`job.py`** — the stage machine. `STAGES` lists each step as `AUTO` (wraps a tool) or `AGENT`
  (needs the model), with the human `gate` after it and the `invalidates` edges. `Job.detect()`
  infers completion from artifacts on disk, so it attaches to any project and resumes. `invalidate()`
  encodes `voiceover → word_timing → shots → bake → sfx` so a VO swap re-runs only what it must.
- **`__main__.py`** — the CLI + the **gate protocol**. The runner executes AUTO stages and STOPS at
  AGENT tasks and human GATES, emitting a `gate_event({gate, title, presentation, options})`. Today a
  CLI renders it; the web UI will render the same events as cards. It never fakes a creative step.
- **`align.py`** — the free word-timing fallback (proportional alignment) promoted to a reusable fn.

## Driving the AGENT stages — the Claude Agent SDK (`agent.py`)

The AGENT stages (assets, script, shots, sfx, packaging) are creative — they need the model to author
+ render, not a fixed tool. `agent.py` drives them headless via the **Claude Agent SDK**
(`claude-agent-sdk` — Claude Code as a library, with built-in Read/Write/Edit/Bash/Glob/Grep/WebSearch
tools and **auto-loaded `.claude/skills/*`**). A stage worker runs with the repo as `cwd`, a
stage-specific prompt that invokes the matching skill for `<slug>`, `bypassPermissions` (autonomous
within the stage — the human gate is AFTER it), then the runner re-detects artifacts to confirm it
produced its outputs.

```bash
venv/Scripts/python -m director run <slug> --agent          # dry: show the assembled stage worker
venv/Scripts/python -m director run <slug> --go --agent      # drive agent + deterministic stages headless
```

The app's "brain" is a **paid dependency**: needs `pip install claude-agent-sdk` and `ANTHROPIC_API_KEY`.
When either is missing, the runner reports what it *would* run and falls back to naming the skill
(Slice-1 behavior) — it never fakes a creative step. `python -m director providers` shows the `agent`
row's live readiness.

## What Slice 1 does

Live provider health + fallback + cost; detect/resume any project's state from disk; run the
deterministic stages (voiceover, timing, master, bake) as a resumable job; **drive the AGENT stages via
the Claude Agent SDK** (`--agent`), honoring the human gate after each; dependency invalidation. The web
UI (Slice 2) is a renderer for the same `gate_event` dicts — no changes to this core.

## Extending

- **Add a provider:** add an impl fn to the capability list in `providers.py` (pro-first order).
- **Wire AssemblyAI:** implement it in `exec_word_timing` (interface already there; falls through to
  proportional today).
- **Web UI (Slice 2):** subscribe to the `gate_event` dicts and render approve/edit/upload cards +
  the stage table + the cost meter. No changes to the orchestrator core.
