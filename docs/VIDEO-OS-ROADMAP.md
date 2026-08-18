# Video OS — Build Roadmap

> North star: a **hosted, multi-user product** where a user gives a prompt, a link, or raw
> footage (plus a few preferences) and gets a finished, engaging, on-brand video — at the
> quality bar of the RiskMarshal review we built by hand.
>
> This doc is the staged plan to get there without throwaway work. Each stage is usable on its
> own and is a strict subset of the next. Written 2026-07-23.

---

## 0. The one principle that shapes everything

The system is three layers, and they must stay separate:

1. **Deterministic tools** (`tools/*.py`, the Remotion project) — real programs. tts, make_master,
   bake, mix_sfx, gen_thumbnail, render, transcription. These already work and are reused at every tier.
2. **The agent core** — an LLM (Claude) that does the *reasoning*: read the site, write the script,
   author the TSX beats, choose SFX cue times, verify by screenshot. Today this is Claude Code (a human
   driving an interactive agent). Tomorrow it's the Claude **Agent SDK** running the same instructions
   headless behind an app.
3. **The skills** (`.claude/skills/*`) — playbooks the agent core executes. **These are the crown
   jewels.** They encode the taste. They do not change when we move from Claude Code → app → hosted;
   only *who invokes them* changes.

**Why this matters:** a plain localhost app with a prompt box cannot produce these videos, because the
creative work is the agent, not a script. Every tier below keeps the same skills + tools and swaps only
the thing that drives them. That is why nothing here is wasted.

---

## 1. Where we are today

The RiskMarshal video was produced by invoking these skills by hand, in order:

| Step | Skill | Input → Output | Status |
|---|---|---|---|
| 0a | `/prompt-to-video` | text prompt → script → VO (word-timestamps) → master | ✅ |
| 0b | `/review-site` | URL (+ angle) → recon + real screenshots → script → master | ✅ |
| 1 | `/clean-cut` | **raw footage** → transcribe → cut filler/errors/dead-air → master | ✅ |
| 1b | `/clean-audio` | denoise / isolate voice | ✅ |
| 2 | `/make-tsx` | master → visual beats (TSX), each reveal synced to word times → baked preview | ✅ |
| 4 | `/suggest-sfx` | beats + narration → SFX synced to beats, library-first → mixed preview | ✅ |
| 5 | final-mix | music bed + auto-duck + final loudness | ⚠️ referenced, verify |
| 6 | `/packaging` | video → 1 title + 3 thumbnails + description | ✅ (render needs billing) |
| 7 | yt_upload | upload to YouTube | ⚠️ verify |

**Reassurance on two things you asked about specifically:**
- **Editing raw uploaded footage already exists** — that's `/clean-cut` → `/make-tsx`. Transcribe →
  cut the errors and filler → then align visuals/effects to the content by word-level timestamp. The
  "align effects to the animation, not just SFX" behavior is exactly what `/make-tsx` does.
- **The compounding / "gets better" idea is partly real already** — the SFX library grows every video,
  thumbnail prompts are saved, brand is remembered.

**The real gaps (what's missing, not what's broken):**
1. **No single front door.** You invoke 6 skills by hand. There's no one intake that asks
   *source? tone? length?* and runs the chain.
2. **No explicit length control.** Duration isn't a first-class parameter.
3. **No asset-gap step.** The system doesn't declare what images/screenshots it needs, capture what it
   can, and ask you to upload the rest.
4. **Persona/tone is not remembered.** "How should it sound?" should be asked once and persist.
5. **The CTR self-improvement loop exists as a worksheet but has never been run** (needs ~10 videos).

---

## 2. Target architecture (constant across all tiers)

```
            ┌─────────────────────────────────────────────┐
  input →   │  DIRECTOR (intake + planning)                │
 prompt /   │  • asks: source, tone/persona, length,       │
 link  /    │    audience, conversion target               │
 footage    │  • builds a VIDEO PLAN (script beats,         │
            │    durations, asset manifest)                 │
            │  • asks user to upload assets it can't get    │
            └───────────────┬─────────────────────────────┘
                            │  VideoPlan (declarative)
            ┌───────────────▼─────────────────────────────┐
            │  CHAIN (existing skills, unchanged)          │
            │  script → VO/master (or clean-cut for raw)   │
            │  → make-tsx → suggest-sfx → final-mix        │
            │  → packaging → upload                         │
            └───────────────┬─────────────────────────────┘
                            │
            ┌───────────────▼─────────────────────────────┐
            │  COMPOUNDING ASSETS + FEEDBACK               │
            │  SFX library · faces · brand/persona memory  │
            │  · CTR calibration loop rewrites the rules   │
            └─────────────────────────────────────────────┘
```

The **VideoPlan** (a declarative JSON, like `timeline.json`/`sfx-plan.json` already are) is the spine.
The Director produces it; the chain consumes it; a human approves it at gates. This is the
`Director → VideoPlan → renderer` shape already noted as the project direction.

---

## 3. The staged plan

### Stage 0 — Unified Director front-door  ·  *small, build first, not throwaway*

A single skill (working name `/make-video`) that is the one front door. It:

1. **Intake (one conversation):**
   - Source: `prompt` | `link` | `raw footage` (auto-detect from what's given).
   - **Persona/tone** — calm / authoritative / sarcastic / hype / authentic. *Asked once, saved to
     brand/persona memory; per-video override allowed.*
   - **Length** — target duration → drives script word count (~2.5 words/sec) → beat count.
   - Audience + conversion target (already in `/packaging` and `/review-site` intake).
2. **Plan + asset manifest** — drafts the VideoPlan and lists every asset it needs, each tagged
   `auto-capturable` (I screenshot it) or `needs-you` (upload checklist). Captures the first set,
   requests the rest.
3. **Runs the chain** end-to-end at the current quality bar, stopping at the existing human gates
   (script approval, SFX audit, packaging).
4. **Saves back** — new SFX/thumbnail assets to the libraries, persona to memory.

**Deliverables:** `.claude/skills/make-video/SKILL.md`; length-control added to the script generators;
an `asset-manifest.json` schema; persona memory. Everything here is reused verbatim by Stage 1/2.

### Stage 1 — Local self-serve app  ·  *medium (weeks)*

Wrap Stage 0 in a runnable app so you (or a tester) drive it without Claude Code:
- **Frontend:** form (source / tone / length / uploads) → live progress → approval + upload prompts →
  download. Can reuse the local cut-editor UI pattern already in the repo.
- **Backend:** the **Claude Agent SDK** runs the Director + chain headless, feeding the same skills as
  instructions and calling the same Python tools; pauses at the human-in-the-loop gates (surfaced in
  the UI instead of the terminal).
- Runs locally with your own API keys (Claude, ElevenLabs, AssemblyAI, Gemini).

### Stage 2 — Hosted product  ·  *large (the north star)*

Multi-user on top of Stage 1: accounts, per-user brand/persona + libraries, a render **queue**
(rendering is minutes/video), cloud storage, billing + usage metering, and safety/moderation on
inputs. No new *creative* code — it's productionizing Stage 1.

---

## 4. Cross-cutting capabilities (build into the Director in Stage 0 so they ride up every tier)

- **Length control.** `duration_s` → target word count → section/beat plan. A 5-min video ≈ ~750
  spoken words ≈ more beats and tighter structure (retention risk grows with length — long videos need
  strong sectioning, not just more words). Validate the rendered duration back against target.
- **Asset manifest + gap requests.** The honest answer to your limitations point. Every needed asset is
  declared and tagged; I capture public screenshots (as done for RiskMarshal's hero/pricing), and hand
  you a tight upload list for what I *can't* get (logged-in captures, some social content, paywalled
  media, anything needing a service that isn't enabled).
- **Persona/brand memory.** Tone asked once, remembered, inherited by every video, overridable per-video.
- **Self-improvement — the realistic version (not auto-rewriting itself):**
  1. **Library-first assets** compound every video (already true).
  2. **CTR calibration loop** — after ~10 published videos, feed real YouTube Studio click-through data
     back; it rewrites `/packaging`'s rules from *your* audience. This is the actual "it evolves" engine.
  3. **Memory** of preferences/feedback persists across sessions.
- **Honest limitation handling.** When something can't be done (e.g. image/video generation with billing
  off — which we hit live on 2026-07-23), the system says so plainly and routes to a user action, rather
  than pretending or silently failing.

---

## 5. Prerequisites & risks (name them now)

- **API billing across four providers** — Claude (agent), ElevenLabs (VO + SFX), AssemblyAI
  (transcription), Gemini (thumbnails). Thumbnail rendering is **currently blocked** on Gemini billing.
- **Cost per video** — several API calls + render compute. Needs metering before Stage 2.
- **Human-in-the-loop is a feature, not a bug** — script approval, SFX audit, and asset uploads stay.
  Fully autonomous is a later, opt-in mode.
- **Long-form retention** — a 5-min video that isn't well-structured loses viewers; length control must
  come with structural templates, not just a bigger word budget.
- **Video generation** (AI b-roll/avatars) is *not* in the pipeline today and has the hardest provider
  limits — treat as a separate future track.

---

## 6. Immediate next actions

1. **(You)** Enable Gemini billing so `/packaging` Stage 5 can render the 3 RiskMarshal thumbnails and
   we close that video out. See [[thumbnail-render-billing-block]].
2. **(Me, on your go)** Build **Stage 0 — the `/make-video` Director front-door** (intake, length
   control, asset manifest, persona memory), tested against a fresh prompt and a fresh link.
3. Publish 1–2 videos, then run the **CTR calibration** once there's data.
4. Revisit Stage 1 (local app) once the Director front-door is proven.
```
