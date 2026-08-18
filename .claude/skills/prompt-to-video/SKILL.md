---
name: prompt-to-video
description: Step 0 of the AI Video Editor pipeline — turn a text prompt into a complete video WITHOUT recording anything. You write the script, edge-tts (free, tools/tts_edge.py) generates the voiceover with word-level timestamps, make_master.py creates a branded master, then the existing pipeline takes over (make-tsx builds visuals, suggest-sfx adds sound design, packaging makes title + thumbnails). Use when the user wants to "generate a video", "make a video about X", "create a tutorial/review/news video", "turn this topic into a video", or asks for prompt-to-video. Not for editing raw footage (that is /clean-cut) and not for swapping in an AI avatar (not in this pipeline).
---

# prompt-to-video — generate a video from a prompt (no recording)

The pre-step to the existing pipeline. The user gives a topic or idea, you write
a narration script, edge-tts (Microsoft's free neural voices, via
`tools/tts_edge.py`) generates the voiceover WITH word-level timestamps
(replacing the AssemblyAI transcription step), make_master.py creates
a branded background "master" video, and then the standard pipeline takes over:
`/make-tsx` builds the visual beats synced to the TTS timestamps, `/suggest-sfx`
sound-designs it, `/packaging` makes the title + thumbnails, and `tools/yt_upload.py`
uploads a private draft.

**No camera, no microphone, no AssemblyAI key, no API keys at all.** The voice
stack is `edge-tts` (CLAUDE.md standing rule — ElevenLabs is NOT used for VO).
`tools/tts.py` is the old ElevenLabs path and only exists for compatibility.

## CRITICAL: Read EVOLUTION.md first

**Before writing any script or building any shots, read `EVOLUTION.md` at the repo root.**
It contains lessons from past videos, delivery mode settings, voice choices, style
preferences, and performance notes. Apply those lessons. After the video is done,
append what you learned back to EVOLUTION.md.

## CRITICAL: Ask the goal + delivery mode

Before writing the script, ask the user (if not stated):
1. **Goal:** followers? watch time? authority? views/CTR? (adapts CTA strategy + script tone)
2. **Delivery mode:** breaking-news? calm-explainer? sarcastic-review? authoritative? (adapts TTS speed + pacing + script style)

See `EVOLUTION.md` for the delivery mode settings and goal adaptations.

## When to use this vs /clean-cut

| User says | Use |
|---|---|
| "I recorded this, cut it" | `/clean-cut` (raw footage) |
| "Make a video about X" / "generate a tutorial on Y" | **this skill** |
| "Turn this topic into a review/news video" | **this skill** |
| "Add visuals to my cut" | `/make-tsx` (already has a master) |

## Pipeline (run in order)

Let `P` = the project (e.g. `videos/video-1`).

### 1. Set up the project folder

```
videos/<project>/
  work/
    script.md         you write this (the narration)
    keyterms.txt      brand/tech names for TTS pronunciation (optional but helps)
```

Create the folder structure: `videos/<project>/work/`.

### 2. Write the script

**You (the agent) write the script.** This is your job — you're a text model and
this is what you're good at. Write the narration as spoken text, not an essay.
Follow the brand voice from `brand.md` (§1 — direct, confident, no hype-filler).

**Script rules:**
- Write for the EAR, not the page. Short sentences. Conversational.
- No em-dashes in the narration (brand rule — read them as pauses instead).
- Include natural section breaks (blank lines) where visual beats will go.
- Mark sections with `## Section title` comments (not spoken) to plan beats.
- Target length: ~150 words/minute of narration. A 5-min video = ~750 words.
- Leave breathing room — don't pack it wall-to-wall. Pauses let visuals land.

**Video type templates:**

#### Tutorial
```
## Hook (0-15s)
[Hook: the thing they'll be able to do after this video]

## Promise (15-30s)
[What we're building + why it matters]

## Step 1: Setup
[Walk through the first step — what to click, what to type]

## Step 2: Core action
[The main thing — detailed walkthrough]

## Step 3: Result
[Show the outcome — what it looks like when it works]

## Gotchas
[Common mistakes + how to fix them]

## Outro
[What to try next + CTA]
```

#### Review
```
## Hook (0-15s)
[Bold claim or question about the product]

## What it is (15-45s)
[Quick context — what this tool/product does]

## The good
[2-3 specific things it does well, with examples]

## The bad
[1-2 honest limitations — credibility matters]

## Who it's for
[Target user + use case]

## Verdict
[Final recommendation + alternatives if it's not for you]
```

#### AI News / Topic explainer
```
## Hook (0-15s)
[The headline or most interesting claim]

## Context (15-45s)
[Why this matters right now]

## The story
[Walk through 2-3 key points, in order of importance]

## What it means
[Implications — who benefits, who doesn't]

## What to watch
[What's coming next + where to learn more]
```

#### Website / tool walkthrough
```
## Hook (0-15s)
[The site/tool + the one thing that makes it interesting]

## First look (15-30s)
[Landing page — what it promises]

## Walkthrough
[Click through 2-3 key features, describing what you see]

## The catch
[Pricing, limits, or trade-offs — be honest]

## Worth it?
[Quick verdict + who should try it]
```

Save the script to `<P>/work/script.md`. Show it to the user for review before
generating audio — **this is a hard gate** (same as the cut review in /clean-cut).

### 3. Draft keyterms (optional but recommended)

Write `<P>/work/keyterms.txt` with brand names, product names, and tech terms
from the script. These don't affect TTS pronunciation directly (edge-tts has no
keyterms feature), but they help YOU reference the correct spellings when
authoring the edit plan and shot text later.

### 4. Generate the voiceover

```
venv/Scripts/python tools/tts_edge.py <P> --text-file <P>/work/script.md --voice en-US-GuyNeural
```

Free (edge-tts, no key). Long scripts are chunked and synthesized in parallel
(3 workers max — the free endpoint refuses beyond that), then concatenated with
word offsets re-derived per chunk.

**Apply the delivery mode from EVOLUTION.md via `--speed` (multiplier):**
- breaking-news: `--speed 1.15`
- calm-explainer: `--speed 1.0`
- sarcastic-review: `--speed 1.05`
- authoritative: `--speed 0.95`

Optional `--pitch-hz -3` reads less announcer-flat.

If the user hasn't picked a voice, list available voices first:
```
venv/Scripts/python tools/tts_edge.py --list-voices
```

Recommend a voice based on the delivery mode (see EVOLUTION.md voice library,
and check `niches/voice-rates.json` for measured wpm — budget script length
with the REAL rate, not a textbook one).

**Outputs:**
- `<P>/work/audio/voiceover.mp3` — the generated voiceover
- `<P>/work/edited-transcript.json` — word-level timestamps in ms (the spine)

**Cost:** $0 (free endpoint). If a script chunk ever fails mid-run, re-run —
`tools/robust_tts.py` wraps this exact flow with retry/backoff for long scripts.

### 5. Create the master

```
venv/Scripts/python tools/make_master.py <P>
```

This generates a branded background video (dark gradient + subtle grid, using
brand colors) with the voiceover as the audio track. Outputs:
- `<P>/reference/master.mp4` — the master video
- `<P>/work/timeline.json` — empty timeline (you fill it in step 7)

**Background options:** `--bg dark` (default, professional), `--bg paper` (light),
`--bg ink` (indigo-tinted dark). Pick the one that fits the brand.

### 6. Author the edit plan + capture evidence

Write `<P>/work/edit-plan.md` — what visual beats go where, synced to the
script. This is the same format `/make-tsx` reads. For prompt-to-video, **every
beat is a full-screen cutaway** (there's no talking head to overlay on).

Plan the beats from the script structure:
- Section titles → `BigStatement` or `Level*Title` style shots
- Steps / lists → `ChecklistFree` or `PipelineStages` style shots
- UI / website walkthrough → `browser.tsx` + `screencast.tsx` based shots
- Code / terminal → `vscode.tsx` based shots
- Stats / numbers → `CreditsStat` style shots
- Comparisons → side-by-side cards
- Outro → `EndCard`

Time each beat to the word times in `edited-transcript.json`. The script's
`## Section` comments map to the beats.

#### Evidence-first design (CRITICAL for authenticity)

**For every factual claim in the script, decide: screenshot vs animation.** A real
screenshot of the source (tweet, article, benchmark, website) is ALWAYS more
authentic than an animated text card. See EVOLUTION.md "Evidence-first visual design."

**To capture evidence screenshots:**
```
venv/Scripts/python tools/capture_evidence.py \
  --url "https://..." \
  --project <project> \
  --name "descriptive-name" \
  --source "Source Name, Date" \
  [--selector "css-selector"] \
  [--full-page] \
  [--scroll 500] \
  [--wait 3000]
```

Screenshots save to `media/projects/<project>/evidence/<name>.png`.

**To use a screenshot in a Remotion shot:**
```tsx
import { EvidenceBrowser } from '../../lib/evidence';
// or
import { EvidenceFrame } from '../../lib/evidence';

<EvidenceBrowser
  image="projects/<project>/evidence/screenshot.png"
  url="example.com/page"
  source="Source Name, Date"
  label="THE CLAIM"
  appearAt={0}
/>
```

- `EvidenceBrowser` — screenshot in a browser chrome frame (for website/article screenshots)
- `EvidenceFrame` — screenshot in a clean frame with optional highlight box (for tweets, posts, data)

**Evidence cutaway timing:** insert a 5-6s evidence cutaway at the moment the claim
is made in the narration. Use the word times to find the exact moment. Update
timeline.json to interleave evidence shots between animated shots.

**When captures fail (blank/white images):** Cloudflare, bot protection, and rate
limits regularly return blank frames from headless Chrome. After every capture, run
`python tools/validate_captures.py videos/<project>` to check. If captures are blank:

1. **Wire them into `EvidenceFrame` anyway** — with the source URL and label visible.
2. **Add an on-screen disclosure** — a small line in the shot: "live capture blocked — source text verified directly." This is what Growth Rule #3 prescribes.
3. **Never silently substitute a stat card** — a blank `EvidenceFrame` with a disclosure is honest; a code-rendered card pretending to be evidence is not.
4. The evidence gate (`check_deliverable.py`) counts shots using `EvidenceFrame`/`EvidenceBrowser`. If you skip these components, the gate will fatal.

### 7. Hand off to /make-tsx

From here, the existing pipeline takes over. Tell the user:
```
Now run: /make-tsx for <project>
```

`/make-tsx` will:
- Read your edit-plan.md + edited-transcript.json + brand + kit
- Build the Remotion TSX shots
- Update timeline.json with the shot mappings
- Render + bake a preview

### 8. Continue the pipeline

After /make-tsx:
- `/suggest-sfx for <project>` — sound design
- `/clean-audio` — NOT needed (TTS audio is already clean)
- **Music (optional):** `tools/gen_music.py` + `tools/mix_music.py` — auto-ducked music bed
- `/packaging for <project>` — title + 3 thumbnails
- Upload with `tools/yt_upload.py`

### 9. Update EVOLUTION.md (MANDATORY after every video)

After the video is done, append lessons to `EVOLUTION.md`:
- What worked (keep doing)
- What didn't (fix next time)
- Delivery mode + voice used + how it sounded
- Evidence screenshots that worked / failed to capture
- Timing issues (too slow? too fast? dead air?)
- Style preferences discovered
- Total cost + time

This is how the pipeline evolves. Without this step, every video starts from scratch.

## Key differences from the recording-based pipeline

| Step | Recording pipeline | Prompt-to-video |
|---|---|---|
| Script | User writes + records | **Agent writes** (user reviews) |
| Audio | Camera recording | **edge-tts** (free, tools/tts_edge.py) |
| Transcription | AssemblyAI (word times) | **TTS alignment** (word times, free) |
| Cut | /clean-cut (remove filler etc.) | **Not needed** (TTS is clean) |
| Master | Cut render | **make_master.py** (branded bg + audio) |
| Visuals | /make-tsx | /make-tsx (same) |
| Audio cleanup | /clean-audio | **Skip** (TTS is already clean) |
| SFX | /suggest-sfx | /suggest-sfx (same) |
| Packaging | /packaging | /packaging (same) |
| Upload | yt_upload.py | yt_upload.py (same) |

## Voice selection tips

- The voice IS the channel's identity. Pick one and stick with it across videos.
- List voices: `venv/Scripts/python tools/tts_edge.py --list-voices`
- Edge voices are all neural and free; name the voice by its full ID
  (`en-US-GuyNeural`, not `GuyNeural` — the region prefix is part of the ID).
- For a faceless channel, the voice carries ALL the personality. Choose carefully.
- Speed matters more than any other knob: `--speed 1.0` is the neutral baseline;
  see EVOLUTION.md for per-delivery-mode rates.
- Check `niches/voice-rates.json` for the MEASURED wpm of the chosen voice
  (budget word count with it; an unmeasured voice falls back to a default).
- Save the chosen voice ID in the project's work folder for reuse.

## Cost summary (per video)

| Item | Cost |
|---|---|
| TTS voiceover | **$0** (edge-tts, free) |
| SFX generation | ~$0.10-0.50/video (ElevenLabs SFX, only when generating new clips) |
| Thumbnails | ~$0.04/image (Gemini, if rendering) |
| AssemblyAI | **$0** (not needed) |
| Total for a 5-min video | ~$0.15-0.55 |

## What this does NOT do

- **No AI avatar / talking head.** The video is 100% animated visuals + voiceover.
  (To add an avatar, generate one with HeyGen/Synthesia and drop it in as the
  master — but that's a manual workaround, not this skill.)
- **No auto-generated B-roll footage.** All visuals are Remotion TSX (code-based
  animations, diagrams, UI mockups, text cards). Not AI video generation.
- **No script writing by an external LLM.** You (the agent) write the script.
  If you want a different model to write it, paste the script into script.md.
